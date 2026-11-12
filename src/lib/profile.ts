// Perfil: nome de usuário e aparência do avatar.
// A aparência fica no localStorage (vale mesmo sem conta e aparece na hora em todas as páginas) e,
// com login, também em public.profiles: na sincronização vale a versão alterada por último.
import { atom } from 'nanostores';
import { getClient, onUserChange } from './progress/sync.ts';

export const SKIN = ['#f6d7bd', '#f2c9a1', '#dba577', '#b97f52', '#8d5a3b', '#5e3b28'];
export const HAIR_COLOR = ['#6a3fa0', '#231b16', '#5a3a22', '#b9722d', '#e3c16f', '#c0392b', '#2f7fd6', '#e56fb0', '#d9dde3'];
export const OUTFIT = ['#3a86ff', '#2fa98a', '#e2894f', '#d1495b', '#8e6fe0', '#4b5563', '#e5b93c', '#ec6ca8'];
export const HAIR_STYLE = ['rabo', 'curto', 'longo', 'cacheado'] as const;
export const EXTRA = ['nenhum', 'oculos', 'faixa'] as const;
export const HAIR_STYLE_LABEL: Record<HairStyle, string> = { rabo: 'Rabo de cavalo', curto: 'Curto', longo: 'Longo', cacheado: 'Cacheado' };
export const EXTRA_LABEL: Record<Extra, string> = { nenhum: 'Nenhum', oculos: 'Óculos', faixa: 'Faixa' };
export type HairStyle = (typeof HAIR_STYLE)[number];
export type Extra = (typeof EXTRA)[number];

export interface AvatarLook {
  /** Índices das paletas acima. */
  skin: number;
  hairColor: number;
  outfit: number;
  hair: HairStyle;
  extra: Extra;
}
export const DEFAULT_LOOK: AvatarLook = { skin: 1, hairColor: 0, outfit: 0, hair: 'rabo', extra: 'nenhum' };

/** Aceita qualquer coisa (JSON do banco, localStorage) e devolve uma aparência válida. */
export function normalizeLook(raw: unknown): AvatarLook {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const idx = (v: unknown, len: number, d: number) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) < len ? (v as number) : d);
  return {
    skin: idx(r.skin, SKIN.length, DEFAULT_LOOK.skin),
    hairColor: idx(r.hairColor, HAIR_COLOR.length, DEFAULT_LOOK.hairColor),
    outfit: idx(r.outfit, OUTFIT.length, DEFAULT_LOOK.outfit),
    hair: HAIR_STYLE.includes(r.hair as HairStyle) ? (r.hair as HairStyle) : DEFAULT_LOOK.hair,
    extra: EXTRA.includes(r.extra as Extra) ? (r.extra as Extra) : DEFAULT_LOOK.extra,
  };
}

export const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
export const USERNAME_RULE = '3 a 20 caracteres: letras sem acento, números e _';

export interface Profile {
  username: string | null;
  look: AvatarLook;
}
export const $profile = atom<Profile>({ username: null, look: DEFAULT_LOOK });

const KEY = 'cses-roadmap:avatar';
let lookUpdatedAt = '';
let started = false;
let pushTimer: ReturnType<typeof setTimeout> | undefined;

function readLocal() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (raw) {
      lookUpdatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : '';
      $profile.set({ username: typeof raw.username === 'string' ? raw.username : null, look: normalizeLook(raw.look) });
    }
  } catch {}
}
function writeLocal() {
  try {
    const { username, look } = $profile.get();
    localStorage.setItem(KEY, JSON.stringify({ look, username, updatedAt: lookUpdatedAt }));
  } catch {}
}

async function session() {
  const client = await getClient();
  const user = client ? (await client.auth.getSession()).data.session?.user : null;
  return client && user ? { client, user } : null;
}

async function pushLook() {
  const s = await session();
  if (!s) return;
  await s.client.from('profiles').update({ avatar: $profile.get().look, updated_at: lookUpdatedAt }).eq('user_id', s.user.id);
}

/** Busca o perfil da conta e concilia a aparência com a deste navegador (vale a alterada por último). */
export async function syncProfile() {
  const s = await session();
  if (!s) {
    if ($profile.get().username !== null) {
      $profile.set({ ...$profile.get(), username: null });
      writeLocal();
    }
    return;
  }
  const { data } = await s.client.from('profiles').select('username, avatar, updated_at').eq('user_id', s.user.id).maybeSingle();
  if (!data) return;
  const remoteHasLook = data.avatar && Object.keys(data.avatar).length > 0;
  const remoteAt = new Date(data.updated_at).toISOString();
  if (remoteHasLook && remoteAt > lookUpdatedAt) {
    lookUpdatedAt = remoteAt;
    $profile.set({ username: data.username, look: normalizeLook(data.avatar) });
  } else {
    $profile.set({ ...$profile.get(), username: data.username });
    if (!remoteHasLook || lookUpdatedAt > remoteAt) {
      lookUpdatedAt ||= new Date().toISOString();
      void pushLook();
    }
  }
  writeLocal();
}

/** Idempotente; chamado por toda ilha que mostra o avatar. */
export function startProfile() {
  if (started || typeof window === 'undefined') return;
  started = true;
  readLocal();
  window.addEventListener('storage', (e) => e.key === KEY && readLocal());
  onUserChange(() => void syncProfile());
  void syncProfile();
}

export function setLook(look: AvatarLook) {
  lookUpdatedAt = new Date().toISOString();
  $profile.set({ ...$profile.get(), look });
  writeLocal();
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void pushLook(), 700);
}

export async function usernameAvailable(name: string) {
  const client = await getClient(true);
  if (!client) return false;
  const { data, error } = await client.rpc('username_available', { name });
  if (error) throw new Error(error.message);
  return data === true;
}

export async function setUsername(name: string) {
  if (!USERNAME_RE.test(name)) throw new Error(`Nome inválido. Use ${USERNAME_RULE}.`);
  const s = await session();
  if (!s) throw new Error('Entre na sua conta para escolher um nome de usuário.');
  const { error } = await s.client.from('profiles').update({ username: name }).eq('user_id', s.user.id);
  if (error) throw new Error(error.code === '23505' ? 'Esse nome de usuário já está em uso.' : error.message);
  $profile.set({ ...$profile.get(), username: name });
  writeLocal();
}
