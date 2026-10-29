// Forma compacta da trilha, serializável, usada pelas ilhas React (o progresso vive no cliente).
// Montada no build por src/lib/data.ts e passada como prop.

export interface TrailMilestone {
  slug: string;
  /** 1-based, na ordem da trilha. */
  num: number;
  name: string;
  phase: number;
  /** Problemas da lista do milestone, na ordem. */
  ids: number[];
  /** Inéditos do Checkpoint Cego (também são slots da trilha). */
  reserved: number[];
  /** Revisão do checkpoint (já apareceram antes). */
  review: number[];
}

export interface TrailProblem {
  id: number;
  title: string;
  section: string;
  difficulty: number;
  /** Índice (0-based) do milestone. */
  ms: number;
  reserved: boolean;
}

export interface TrailData {
  phases: { slug: string; name: string }[];
  milestones: TrailMilestone[];
  /** Todos os 400 problemas na ordem linear da trilha. */
  problems: TrailProblem[];
}

/** Todos os slots de um milestone: lista + inéditos do checkpoint. */
export const slotsOf = (m: TrailMilestone) => [...m.ids, ...m.reserved];

export const csesUrl = (id: number) => `https://cses.fi/problemset/task/${id}`;
export const problemPath = (id: number) => `/p/${id}`;
export const milestonePath = (slug: string) => `/m/${slug}`;
export const checkpointPath = (slug: string) => `/checkpoint/${slug}`;
export const modulePath = (slug: string) => `/modulos/${slug}`;
