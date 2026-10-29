// Estado de progresso do usuário. Versionado: mudou o formato -> nova versão + migração em schema.ts.

export type Status = 'not_started' | 'trying' | 'solved' | 'solved_with_hint';

export const STATUS_LABEL: Record<Status, string> = {
  not_started: 'Não iniciado',
  trying: 'Tentando',
  solved: 'Resolvido',
  solved_with_hint: 'Resolvido com dica',
};

export interface ProblemProgress {
  status: Status;
  /** Quantas dicas foram reveladas (0–3). */
  hintsRevealed: number;
  notes: string;
  code: string;
  updatedAt: string;
  solvedAt?: string;
}

export interface DayActivity {
  /** Problemas marcados como resolvidos neste dia. */
  solved: number;
  /** Qualquer mudança de status (conta para o streak). */
  actions: number;
}

export interface ProgressState {
  version: 1;
  /** Chave = id do problema (string, por ser JSON). */
  problems: Record<string, ProblemProgress>;
  /** Slugs de milestones marcados como "já domino". */
  masteredMilestones: string[];
  /** Chave = data local YYYY-MM-DD. */
  activity: Record<string, DayActivity>;
  /** Chave = id do problema; o palpite de técnica escrito no Checkpoint Cego. */
  checkpointGuesses: Record<string, string>;
}

/**
 * Onde o progresso é guardado. A fase 1 usa localStorage; a fase 2 (sync) só precisa
 * de outro adapter (ex.: Supabase / Vercel KV) com a mesma interface.
 */
export interface ProgressAdapter {
  name: string;
  load(): Promise<ProgressState | null>;
  save(state: ProgressState): Promise<void>;
  /** Avisa quando o estado mudou por fora (outra aba, outro dispositivo). Devolve o unsubscribe. */
  subscribe?(onExternalChange: () => void): () => void;
}

export const emptyProgress = (): ProgressState => ({
  version: 1,
  problems: {},
  masteredMilestones: [],
  activity: {},
  checkpointGuesses: {},
});

export const emptyProblem = (): ProblemProgress => ({
  status: 'not_started',
  hintsRevealed: 0,
  notes: '',
  code: '',
  updatedAt: new Date().toISOString(),
});

export const isSolved = (s: Status | undefined) => s === 'solved' || s === 'solved_with_hint';
