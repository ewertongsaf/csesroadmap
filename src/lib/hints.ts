// Carrega data/hints/*.yaml no build (via Vite, então o dev server recarrega ao editar).
import { parseHintFile, type ProblemHints } from '../../data/hint-schema.ts';

const files = import.meta.glob<string>('/data/hints/*.yaml', { query: '?raw', import: 'default', eager: true });

export const hintsById = new Map<number, ProblemHints>();
for (const [path, text] of Object.entries(files)) {
  for (const [id, h] of parseHintFile(text, path)) hintsById.set(id, h);
}
