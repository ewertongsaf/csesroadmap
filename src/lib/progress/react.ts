import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $progress, $ready, $storageError, startProgress } from './store.ts';
import { emptyProgress } from './types.ts';

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

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    startProgress();
    setMounted(true);
  }, []);
  return mounted;
}
