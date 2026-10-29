// Cálculos derivados do progresso + trilha. Funções puras (testáveis e usadas pelas ilhas).
import { slotsOf, type TrailData, type TrailMilestone, type TrailProblem } from '../trail.ts';
import { addDays, dayKey } from './dates.ts';
import { isSolved, type ProgressState, type Status } from './types.ts';

export const statusOf = (s: ProgressState, id: number): Status => s.problems[id]?.status ?? 'not_started';

export const isMastered = (s: ProgressState, slug: string) => s.masteredMilestones.includes(slug);

export function milestoneProgress(s: ProgressState, m: TrailMilestone) {
  const slots = slotsOf(m);
  let solved = 0;
  let trying = 0;
  for (const id of slots) {
    const st = statusOf(s, id);
    if (isSolved(st)) solved++;
    else if (st === 'trying') trying++;
  }
  return { solved, trying, total: slots.length, done: solved === slots.length };
}

/** Primeiro problema da trilha ainda não resolvido, pulando milestones marcados como "já domino". */
export function nextProblem(trail: TrailData, s: ProgressState): TrailProblem | null {
  for (const p of trail.problems) {
    if (isMastered(s, trail.milestones[p.ms].slug)) continue;
    if (!isSolved(statusOf(s, p.id))) return p;
  }
  return null;
}

export function totalSolved(s: ProgressState) {
  let solved = 0;
  let withHint = 0;
  for (const p of Object.values(s.problems)) {
    if (p.status === 'solved') solved++;
    if (p.status === 'solved_with_hint') withHint++;
  }
  return { solved: solved + withHint, withHint };
}

/** Streak atual (dias seguidos com alguma ação, terminando hoje ou ontem) e o melhor histórico. */
export function streaks(s: ProgressState, today = new Date()) {
  const active = (d: Date) => (s.activity[dayKey(d)]?.actions ?? 0) > 0;
  let current = 0;
  let d = active(today) ? today : addDays(today, -1);
  while (active(d)) {
    current++;
    d = addDays(d, -1);
  }
  const days = Object.keys(s.activity).filter((k) => s.activity[k].actions > 0).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of days) {
    const [y, m, dd] = k.split('-').map(Number);
    run = prev !== null && dayKey(addDays(new Date(y, m - 1, dd), -1)) === prev ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return { current, best: Math.max(best, current) };
}

export function solvedBySection(trail: TrailData, s: ProgressState) {
  const rows = new Map<string, { solved: number; total: number }>();
  for (const p of trail.problems) {
    const r = rows.get(p.section) ?? { solved: 0, total: 0 };
    r.total++;
    if (isSolved(statusOf(s, p.id))) r.solved++;
    rows.set(p.section, r);
  }
  return rows;
}
