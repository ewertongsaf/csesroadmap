// Mescla dois estados de progresso (este dispositivo x nuvem). Função pura, testada em tests/merge.test.ts.
//
// Regras:
// - Problemas: por id, vale o que tem `updatedAt` mais recente. `hintsRevealed` nunca diminui.
// - Atividade: por dia, o maior contador (cada dispositivo só soma).
// - "Já domino" e palpites do checkpoint não têm data própria: valem os do estado mais novo (`updatedAt` do estado);
//   em empate (estados antigos, sem data), une os dois.
// - Reset (import / apagar tudo): quem tem o `resetAt` mais recente manda. Do outro lado só sobrevive
//   o que foi alterado DEPOIS desse reset.
import type { ProblemProgress, ProgressState } from './types.ts';

const newer = (a: string | undefined, b: string | undefined) => (a ?? '') > (b ?? '');

function pick(a: ProblemProgress, b: ProblemProgress): ProblemProgress {
  const win = newer(b.updatedAt, a.updatedAt) ? b : a;
  const hints = Math.max(a.hintsRevealed, b.hintsRevealed);
  return hints === win.hintsRevealed ? win : { ...win, hintsRevealed: hints };
}

export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const resetAt = newer(a.resetAt, b.resetAt) ? a.resetAt : b.resetAt;
  // Lado "velho" em relação ao reset: só os problemas tocados depois dele continuam valendo.
  const prune = (s: ProgressState): ProgressState =>
    resetAt && newer(resetAt, s.resetAt)
      ? {
          ...s,
          problems: Object.fromEntries(Object.entries(s.problems).filter(([, p]) => p.updatedAt > resetAt)),
          masteredMilestones: [],
          checkpointGuesses: {},
          activity: {},
          updatedAt: undefined,
        }
      : s;
  const x = prune(a);
  const y = prune(b);

  const problems: ProgressState['problems'] = { ...x.problems };
  for (const [id, p] of Object.entries(y.problems)) problems[id] = id in problems ? pick(problems[id], p) : p;

  const activity: ProgressState['activity'] = { ...x.activity };
  for (const [day, d] of Object.entries(y.activity)) {
    const o = activity[day];
    activity[day] = o ? { solved: Math.max(o.solved, d.solved), actions: Math.max(o.actions, d.actions) } : d;
  }

  // Empate, ou algum lado sem data (estado antigo, de antes da sincronização): não dá para saber quem é mais novo, então nada se perde.
  const tie = !x.updatedAt || !y.updatedAt || x.updatedAt === y.updatedAt;
  const lead = newer(y.updatedAt, x.updatedAt) ? y : x;
  const updatedAt = newer(a.updatedAt, b.updatedAt) ? a.updatedAt : b.updatedAt;
  return {
    version: 1,
    problems,
    masteredMilestones: tie ? [...new Set([...x.masteredMilestones, ...y.masteredMilestones])].sort() : [...lead.masteredMilestones],
    activity,
    checkpointGuesses: tie ? { ...y.checkpointGuesses, ...x.checkpointGuesses } : { ...lead.checkpointGuesses },
    ...(updatedAt ? { updatedAt } : {}),
    ...(resetAt ? { resetAt } : {}),
  };
}

/** Comparação estrutural estável (ordem das chaves não importa). */
export function sameProgress(a: ProgressState, b: ProgressState) {
  const norm = (v: unknown): unknown =>
    Array.isArray(v)
      ? [...v].map(norm).sort()
      : v && typeof v === 'object'
        ? Object.fromEntries(Object.entries(v as Record<string, unknown>).filter(([, x]) => x !== undefined).sort(([p], [q]) => (p < q ? -1 : 1)).map(([k, x]) => [k, norm(x)]))
        : v;
  return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}
