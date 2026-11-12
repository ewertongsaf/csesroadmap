// localStorage + nuvem. O localStorage é sempre a fonte imediata: a página abre com o que há neste
// navegador (inclusive offline) e a nuvem é mesclada em segundo plano. Quando a mescla muda algo,
// o estado local é regravado e as ilhas recarregam.
import { mergeProgress, sameProgress } from '../merge.ts';
import { SYNC_CONFIGURED, currentUser, fetchRemote, getClient, markSyncError, markSynced, markSyncing, pushRemote } from '../sync.ts';
import { emptyProgress, type ProgressAdapter } from '../types.ts';
import { localStorageAdapter } from './localStorage.ts';

const PUSH_DELAY = 1500;
let pushTimer: ReturnType<typeof setTimeout> | undefined;
/** `updatedAt` do último estado que este dispositivo enviou: serve para ignorar o próprio eco no realtime. */
let lastPushed: string | undefined;
let lastSync = 0;
let uid: string | null = null;
/** Avisa o store de que o localStorage mudou por causa da nuvem. */
let notify: (() => void) | null = null;
/** A próxima carga vem de um notify nosso: não precisa sincronizar de novo. */
let skipSync = false;
let running = false;
let again = false;

const readLocal = async () => (await localStorageAdapter.load()) ?? emptyProgress();

/**
 * Uma rodada de sincronização: lê a nuvem, mescla com o local, envia se a nuvem estiver atrás e
 * regrava o local se ele estiver atrás. Nunca envia sem mesclar antes, então um dispositivo não
 * apaga o que outro acabou de salvar. Chamadas simultâneas viram uma rodada extra no fim.
 */
export async function syncNow() {
  if (!SYNC_CONFIGURED) return;
  if (running) {
    again = true;
    return;
  }
  running = true;
  try {
    for (let round = 0; round < 3; round++) {
      again = false;
      const user = await currentUser();
      uid = user?.id ?? null;
      if (!user) return;
      markSyncing();
      const remote = await fetchRemote(user.id);
      const merged = remote ? mergeProgress(await readLocal(), remote) : await readLocal();
      if (!remote || !sameProgress(merged, remote)) {
        await pushRemote(user.id, merged);
        lastPushed = merged.updatedAt;
      }
      // O local pode ter mudado enquanto a rede respondia: mescla de novo antes de gravar.
      const now = await readLocal();
      const final = mergeProgress(now, merged);
      if (!sameProgress(final, now)) {
        await localStorageAdapter.save(final);
        skipSync = true;
        notify?.();
      }
      lastSync = Date.now();
      markSynced();
      if (sameProgress(final, merged) && !again) return;
    }
  } catch (e) {
    // Sem rede ou tabela ausente: o site segue com o que há neste navegador.
    markSyncError(e);
  } finally {
    running = false;
  }
}

function syncSoon() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void syncNow(), PUSH_DELAY);
}

function syncIfPending() {
  if (pushTimer === undefined) return;
  clearTimeout(pushTimer);
  pushTimer = undefined;
  void syncNow();
}

export const syncedAdapter: ProgressAdapter = {
  name: 'localStorage',

  async load() {
    const local = await localStorageAdapter.load();
    if (skipSync) skipSync = false;
    else void syncNow();
    return local;
  },

  async save(state) {
    await localStorageAdapter.save(state);
    if (SYNC_CONFIGURED && uid) syncSoon();
  },

  subscribe(onExternalChange) {
    const offLocal = localStorageAdapter.subscribe!(onExternalChange);
    if (!SYNC_CONFIGURED) return offLocal;
    notify = onExternalChange;
    let closed = false;
    let stopRemote = () => {};

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') syncIfPending();
      // Voltou para a aba: confere a nuvem (cobre o caso de o realtime estar desligado no projeto).
      else if (uid && Date.now() - lastSync > 20_000) void syncNow();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', syncIfPending);

    void (async () => {
      const client = await getClient();
      if (!client || closed) return;
      let channel: ReturnType<typeof client.channel> | null = null;
      let listening: string | null | undefined;
      const listen = (id: string | null) => {
        if (id === listening) return;
        listening = id;
        if (channel) void client.removeChannel(channel);
        channel = id
          ? client
              .channel(`progress:${id}`)
              .on('postgres_changes', { event: '*', schema: 'public', table: 'progress', filter: `user_id=eq.${id}` }, (payload) => {
                const stamp = (payload.new as { state?: { updatedAt?: string } } | null)?.state?.updatedAt;
                if (stamp === undefined || stamp !== lastPushed) void syncNow();
              })
              .subscribe()
          : null;
      };
      listen(uid);
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        const next = session?.user.id ?? null;
        listen(next);
        if (next === uid) return;
        uid = next;
        void syncNow();
      });
      stopRemote = () => {
        data.subscription.unsubscribe();
        if (channel) void client.removeChannel(channel);
      };
    })();

    return () => {
      closed = true;
      notify = null;
      offLocal();
      stopRemote();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', syncIfPending);
    };
  },
};
