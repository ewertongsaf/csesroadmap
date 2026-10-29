// Junta data/ em estruturas prontas para as páginas (só no build).
import csesJson from '../../data/cses-problems.json';
import { roadmap } from '../../data/roadmap.ts';
import { modules } from '../../data/modules.ts';
import { concepts, type ConceptSlug } from '../../data/concepts.ts';
import type { CsesProblem, Milestone, ModuleRef, RoadmapEntry } from '../../data/schema.ts';
import type { TrailData } from './trail.ts';

export const csesProblems = (csesJson as { problems: CsesProblem[] }).problems;
const csesById = new Map(csesProblems.map((p) => [p.id, p]));

export interface MilestoneInfo extends Milestone {
  num: number;
  index: number;
  phaseIndex: number;
  phaseName: string;
}

export interface ProblemInfo extends RoadmapEntry {
  title: string;
  section: string;
  solvedBy: number;
  milestone: MilestoneInfo;
  reserved: boolean;
  /** Posição (0-based) na trilha linear. */
  pos: number;
}

export const milestones: MilestoneInfo[] = roadmap.flatMap((ph, phaseIndex) =>
  ph.milestones.map((m) => ({ ...m, phaseIndex, phaseName: ph.name, num: 0, index: 0 })),
);
milestones.forEach((m, i) => Object.assign(m, { index: i, num: i + 1 }));

export const problems: ProblemInfo[] = milestones.flatMap((m) => [
  ...m.problems.map((e) => ({ e, reserved: false })),
  ...m.checkpoint.reserved.map((e) => ({ e, reserved: true })),
].map(({ e, reserved }) => {
  const c = csesById.get(e.id);
  if (!c) throw new Error(`problema ${e.id} não existe em cses-problems.json`);
  return { ...e, title: c.title, section: c.section, solvedBy: c.solvedBy, milestone: m, reserved, pos: 0 };
}));
problems.forEach((p, i) => (p.pos = i));

export const problemById = new Map(problems.map((p) => [p.id, p]));
export const moduleBySlug = new Map<string, ModuleRef>(modules.map((m) => [m.slug, m]));
export const conceptLabel = (slug: string) => concepts[slug as ConceptSlug] ?? slug;

/** Seções na ordem do site do CSES. */
export const sections = [...new Set(csesProblems.map((p) => p.section))];

export const trailData: TrailData = {
  phases: roadmap.map((ph) => ({ slug: ph.slug, name: ph.name })),
  milestones: milestones.map((m) => ({
    slug: m.slug,
    num: m.num,
    name: m.name,
    phase: m.phaseIndex,
    ids: m.problems.map((e) => e.id),
    reserved: m.checkpoint.reserved.map((e) => e.id),
    review: m.checkpoint.review,
  })),
  problems: problems.map((p) => ({
    id: p.id,
    title: p.title,
    section: p.section,
    difficulty: p.difficulty,
    ms: p.milestone.index,
    reserved: p.reserved,
  })),
};
