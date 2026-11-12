// Sincronização com o Supabase. Sem login, o site funciona só com localStorage, como antes.
// Tabela e políticas: supabase/schema.sql. Passo a passo: README.
import { atom } from 'nanostores';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseProgress } from './schema.ts';
import type { ProgressState } from './types.ts';

// Projeto do site. A chave "publishable" é pública por desenho (vai para o navegador): quem protege
// os dados são as políticas de supabase/schema.sql. As variáveis de ambiente, se existirem, têm prioridade.
const DEFAULT_URL = 'https://ecggvmsiyqguhmvulhcp.supabase.co';
const DEFAULT_KEY = 'sb_publishable_pasvhehJyMpUVrBT2BGV_A_iaZyrnTe';
const URL_ = (import.meta.env.PUBLIC_SUPABASE_URL as string | undefined) || DEFAULT_URL;
const KEY = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_KEY;
export const SYNC_CONFIGURED = Boolean(URL_ && KEY);
const TABLE = 'progress';

export interface SyncState {
  email: string | null;
  status: 'off' | 'syncing' | 'ok' | 'error';
  lastSyncedAt: string | null;
  error: string | null;
  /** Voltou do link de "esqueci minha senha": a página de conta pede a senha nova. */
  recovery: boolean;
}
export const $sync = atom<SyncState>({ email: null, status: 'off', lastSyncedAt: null, error: null, recovery: false });
const patch = (p: Partial<SyncState>) => $sync.set({ ...$sync.get(), ...p });
export const markSyncing = () => patch({ status: 'syncing', error: null });
export const markSynced = () => patch({ status: 'ok', error: null, lastSyncedAt: new Date().toISOString() });
export const markSyncError = (e: unknown) => patch({ status: 'error', error: e instanceof Error ? e.message : String(e) });

let clientPromise: Promise<SupabaseClient> | null = null;

/** Só baixa o SDK se houver chance de sessão: token salvo, volta do link do e-mail, ou pedido explícito (página Progresso). */
function mightHaveSession() {
  try {
    if (/[#?&](access_token|code|token_hash)=/.test(location.hash + location.search)) return true;
    for (let i = 0; i < localStorage.length; i++) if (/^sb-.*-auth-token$/.test(localStorage.key(i) ?? '')) return true;
  } catch {}
  return false;
}

export function getClient(force = false): Promise<SupabaseClient> | null {
  if (!SYNC_CONFIGURED || typeof window === 'undefined') return null;
  if (!clientPromise && (force || mightHaveSession()))
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      const client = createClient(URL_!, KEY!, { auth: { persistSession: true, detectSessionInUrl: true } });
      let uid: string | null | undefined;
      client.auth.onAuthStateChange((event, session) => {
        const user = session?.user ?? null;
        patch(user ? { email: user.email ?? '' } : { email: null, status: 'off' });
        if (event === 'PASSWORD_RECOVERY') patch({ recovery: true });
        if ((user?.id ?? null) !== uid) {
          uid = user?.id ?? null;
          // Fora do callback: o SDK não deixa chamar a própria API de dentro dele.
          setTimeout(() => userListeners.forEach((fn) => fn()), 0);
        }
      });
      return client;
    });
  return clientPromise;
}

const userListeners = new Set<() => void>();
/** Avisa quando alguém entra ou sai (o perfil usa para recarregar nome e avatar). */
export function onUserChange(fn: () => void) {
  userListeners.add(fn);
  return () => userListeners.delete(fn);
}

/** Usuário logado (ou null). Atualiza $sync.email. */
export async function currentUser(force = false) {
  const client = await getClient(force);
  if (!client) return null;
  const { data } = await client.auth.getSession();
  const user = data.session?.user ?? null;
  patch(user ? { email: user.email ?? '' } : { email: null, status: 'off' });
  return user;
}

export async function fetchRemote(userId: string): Promise<ProgressState | null> {
  const client = (await getClient())!;
  const { data, error } = await client.from(TABLE).select('state').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const parsed = parseProgress(data.state);
  if (!parsed.ok) throw new Error(`progresso da nuvem inválido: ${parsed.error}`);
  return parsed.state;
}

export async function pushRemote(userId: string, state: ProgressState) {
  const client = (await getClient())!;
  const { error } = await client.from(TABLE).upsert({ user_id: userId, state, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

/** Mensagens do Supabase Auth em português. */
function authError(message: string, code?: string): Error {
  const m = message.toLowerCase();
  if (code === 'invalid_credentials' || m.includes('invalid login')) return new Error('E-mail ou senha incorretos.');
  if (code === 'email_not_confirmed' || m.includes('not confirmed')) return new Error('Confirme seu e-mail pelo link que enviamos antes de entrar.');
  if (code === 'user_already_exists' || m.includes('already registered')) return new Error('Já existe uma conta com este e-mail.');
  if (code === 'weak_password' || m.includes('password should')) return new Error('A senha precisa ter pelo menos 6 caracteres.');
  if (code === 'same_password') return new Error('A senha nova precisa ser diferente da atual.');
  if (code?.includes('rate_limit') || m.includes('rate limit') || m.includes('security purposes')) return new Error('Muitas tentativas seguidas. Espere um pouco e tente de novo.');
  if (m.includes('database error')) return new Error('Não consegui criar a conta. O nome de usuário pode ter acabado de ser usado por outra pessoa.');
  if (m.includes('failed to fetch')) return new Error('Sem conexão com o servidor. Verifique a internet e tente de novo.');
  return new Error(message);
}

/** Cria a conta. Devolve true se já entrou, false se falta confirmar o e-mail. */
export async function signUp(email: string, password: string, username: string) {
  const client = (await getClient(true))!;
  const { data, error } = await client.auth.signUp({ email, password, options: { data: { username }, emailRedirectTo: `${location.origin}/config` } });
  if (error) throw authError(error.message, error.code);
  // Para um e-mail já cadastrado o Supabase responde "ok" com uma conta sem identidades.
  if (data.user && data.user.identities?.length === 0) throw new Error('Já existe uma conta com este e-mail.');
  return data.session !== null;
}

export async function signIn(email: string, password: string) {
  const client = (await getClient(true))!;
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw authError(error.message, error.code);
}

export async function sendPasswordReset(email: string) {
  const client = (await getClient(true))!;
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/config` });
  if (error) throw authError(error.message, error.code);
}

export async function updatePassword(password: string) {
  const client = (await getClient(true))!;
  const { error } = await client.auth.updateUser({ password });
  if (error) throw authError(error.message, error.code);
  patch({ recovery: false });
}

export async function signOut() {
  const client = await getClient(true);
  await client?.auth.signOut();
  patch({ email: null, status: 'off', error: null, recovery: false });
}
