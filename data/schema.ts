// Tipos compartilhados entre os dados (data/), os scripts e o site.

export type Difficulty = 1 | 2 | 3 | 4 | 5;

/** Uma linha de data/cses-problems.json (gerado por scripts/parse-cses.mjs). */
export interface CsesProblem {
  id: number;
  title: string;
  section: string;
  /** Snapshot público de quantas pessoas resolveram / tentaram, na data do fetch. */
  solvedBy: number;
  attemptedBy: number;
}

/** Um problema posicionado na trilha. */
export interface RoadmapEntry {
  id: number;
  difficulty: Difficulty;
  /** Slugs de data/concepts.ts. Ficam ocultos na página do problema até "revelar tema". */
  concepts: string[];
  /** true = classificação de técnica feita com menos certeza; revisar ao escrever as dicas. */
  uncertain?: boolean;
}

export interface Checkpoint {
  /** Problemas inéditos que só aparecem aqui (contam como slots normais da trilha). */
  reserved: RoadmapEntry[];
  /** Problemas já vistos em milestones anteriores (ou neste), para refazer sem olhar. */
  review: number[];
}

export interface Milestone {
  slug: string;
  name: string;
  /** Completa a frase "Ao final você sabe…". */
  goal: string;
  /** Slugs de data/modules.ts, na ordem de leitura. */
  modules: string[];
  problems: RoadmapEntry[];
  checkpoint: Checkpoint;
}

export interface Phase {
  slug: string;
  name: string;
  milestones: Milestone[];
}

export interface ModuleRef {
  slug: string;
  title: string;
  /** Capítulos/seções do CPH 2018 (cses.fi/book.pdf), ex.: "3.3". Vazio = o CPH não cobre. */
  cph: string[];
  /** Quando o CPH não cobre bem, de onde vem a base do módulo. */
  basedOn?: string;
  /** 'written' exige content/modules/<slug>.mdx. */
  status: 'planned' | 'written';
}
