import { parseProgress } from '../schema.ts';
import type { ProgressAdapter } from '../types.ts';

const KEY = 'cses-roadmap:progress';

/** Persistência local. Toda leitura/escrita em try/catch: aba anônima ou storage bloqueado não pode quebrar o site. */
export const localStorageAdapter: ProgressAdapter = {
  name: 'localStorage',

  async load() {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return null;
    const parsed = parseProgress(JSON.parse(raw));
    if (!parsed.ok) {
      // Não sobrescreve um estado corrompido: guarda uma cópia antes de seguir do zero.
      localStorage.setItem(`${KEY}:corrupted:${Date.now()}`, raw);
      throw new Error(`progresso salvo inválido (cópia preservada): ${parsed.error}`);
    }
    return parsed.state;
  },

  async save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  },

  subscribe(onExternalChange) {
    const handler = (e: StorageEvent) => {
      if (e.key === KEY) onExternalChange();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },
};
