// Índice de busca (gerado no build em /search-index.json) e o matcher usado pelo Ctrl+K.

export interface SearchItem {
  kind: 'problem' | 'milestone' | 'module' | 'page';
  title: string;
  sub: string;
  href: string;
  /** Só para problemas: id e rótulos de conceito (só são pesquisáveis se o problema já foi resolvido). */
  id?: number;
  concepts?: string[];
}

export const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Pontua um item contra a query (todas as palavras precisam aparecer). Menor = melhor; null = não casa.
 * `withConcepts` decide se os conceitos entram no texto pesquisável (spoiler para não resolvidos).
 */
export function score(item: SearchItem, query: string, withConcepts: boolean): number | null {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  const title = normalize(item.title);
  const hay = `${title} ${normalize(item.sub)} ${item.id ?? ''} ${withConcepts ? normalize((item.concepts ?? []).join(' ')) : ''}`;
  if (!words.every((w) => hay.includes(w))) return null;
  const first = words[0];
  const kindRank = { page: 0, milestone: 1, module: 2, problem: 3 }[item.kind];
  if (String(item.id) === first) return -1;
  if (title.startsWith(first)) return kindRank;
  if (title.includes(first)) return 10 + kindRank;
  return 20 + kindRank;
}
