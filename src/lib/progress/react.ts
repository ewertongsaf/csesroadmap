import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $progress, $ready, $storageError, startProgress } from './store.ts';
import { emptyProgress } from './types.ts';
import { $sync, type SyncState } from './sync.ts';
import { $profile, DEFAULT_LOOK, startProfile, type Profile } from '../profile.ts';

const SSR_SYNC: SyncState = { email: null, status: 'off', lastSyncedAt: null, error: null, recovery: false };
const SSR_PROFILE: Profile = { username: null, look: DEFAULT_LOOK };

const SSR_STATE = emptyProgress();

/**
 * Estado de progresso + se já foi carregado do storage.
 * Até o mount devolve o mesmo que o HTML do build (estado vazio, ready=false): se outra ilha já
 * carregou o progresso, renderizá-lo direto na hidratação causaria hydration mismatch.
 */
export function useProgress() {
  const mounted = useMounted();
  const state = useStore($progress);
  const ready = useStore($ready);
  return mounted ? { state, ready } : { state: SSR_STATE, ready: false };
}

/** Mensagem de erro do storage (null até o mount, pelo mesmo motivo do useProgress). */
export function useStorageError() {
  const mounted = useMounted();
  const error = useStore($storageError);
  return mounted ? error : null;
}

/** Estado da sincronização (vazio até o mount, como o useProgress). */
export function useSync() {
  const mounted = useMounted();
  const sync = useStore($sync);
  return mounted ? sync : SSR_SYNC;
}

/** Nome de usuário e aparência do avatar (padrão até o mount, para o HTML do build não divergir). */
export function useProfile() {
  const mounted = useMounted();
  const profile = useStore($profile);
  useEffect(() => startProfile(), []);
  return mounted ? profile : SSR_PROFILE;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    startProgress();
    setMounted(true);
  }, []);
  return mounted;
}
