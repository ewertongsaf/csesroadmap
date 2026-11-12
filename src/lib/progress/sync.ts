// Sincronização com o Supabase (opcional). Sem as variáveis PUBLIC_SUPABASE_* ou sem login,
// o site funciona exatamente como antes, só com localStorage.
// Tabela e políticas: supabase/schema.sql. Passo a passo: README.
import { atom } from 'nanostores';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseProgress } from './schema.ts';
import type { ProgressState } from './types.ts';

const URL_ = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;
export const SYNC_CONFIGURED = Boolean(URL_ && KEY);
const TABLE = 'progress';

export interface SyncState {
  email: string | null;
  status: 'off' | 'syncing' | 'ok' | 'error';
  lastSyncedAt: string | null;
  error: string | null;
}
export const $sync = atom<SyncState>({ email: null, status: 'off', lastSyncedAt: null, error: null });
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
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => createClient(URL_!, KEY!, { auth: { persistSession: true, detectSessionInUrl: true } }));
  return clientPromise;
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

/** Envia o link (e o código, se o template do e-mail tiver {{ .Token }}) para o e-mail. */
export async function sendLoginEmail(email: string) {
  const client = (await getClient(true))!;
  const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/config` } });
  if (error) throw new Error(error.message);
}

export async function verifyLoginCode(email: string, code: string) {
  const client = (await getClient(true))!;
  const { error } = await client.auth.verifyOtp({ email, token: code.trim(), type: 'email' });
  if (error) throw new Error(error.message);
}

export async function signOut() {
  const client = await getClient(true);
  await client?.auth.signOut();
  patch({ email: null, status: 'off', error: null });
}
