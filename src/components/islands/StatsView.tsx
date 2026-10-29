import { useProgress } from '../../lib/progress/react.ts';
import { milestoneProgress, solvedBySection, streaks, totalSolved } from '../../lib/progress/selectors.ts';
import { addDays, dayKey } from '../../lib/progress/dates.ts';
import type { ProgressState } from '../../lib/progress/types.ts';
import { milestonePath, type TrailData } from '../../lib/trail.ts';
import { ProgressBar, Skeleton } from '../ui.tsx';

export default function StatsView({ trail, sections }: { trail: TrailData; sections: string[] }) {
  const { state, ready } = useProgress();
  if (!ready) return <Skeleton className="h-64 w-full" />;

  const total = totalSolved(state);
  const streak = streaks(state);
  const bySection = solvedBySection(trail, state);

  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-4">
        <Big label="Resolvidos" value={total.solved} sub={`de ${trail.problems.length}`} />
        <Big label="Sem dica" value={total.solved - total.withHint} sub={`${total.withHint} com dica`} />
        <Big label="Streak atual" value={streak.current} sub={streak.current === 1 ? 'dia' : 'dias'} />
        <Big label="Melhor streak" value={streak.best} sub={streak.best === 1 ? 'dia' : 'dias'} />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Atividade</h2>
        <p className="mt-1 text-sm text-muted">Problemas resolvidos por dia nas últimas 26 semanas.</p>
        <Heatmap state={state} />
      </section>

      <section className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Por seção do CSES</h2>
          <ul className="mt-4 space-y-3">
            {sections.map((s) => {
              const r = bySection.get(s) ?? { solved: 0, total: 0 };
              return (
                <li key={s}>
                  <div className="flex justify-between text-sm">
                    <span>{s}</span>
                    <span className="tabular-nums text-muted">{r.solved}/{r.total}</span>
                  </div>
                  <ProgressBar value={r.solved} total={r.total} className="mt-1.5" />
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Por milestone</h2>
          <ul className="mt-4 space-y-3">
            {trail.milestones.map((m) => {
              const p = milestoneProgress(state, m);
              return (
                <li key={m.slug}>
                  <div className="flex justify-between gap-3 text-sm">
                    <a href={milestonePath(m.slug)} className="truncate hover:underline underline-offset-4">
                      <span className="mr-1.5 tabular-nums text-faint">{m.num}.</span>
                      {m.name}
                    </a>
                    <span className="shrink-0 tabular-nums text-muted">{p.solved}/{p.total}</span>
                  </div>
                  <ProgressBar value={p.solved} total={p.total} className="mt-1.5" />
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Big({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="text-xs uppercase tracking-wider text-faint">{label}</p>
      <p className="mt-1.5 text-3xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  );
}

const WEEKS = 26;
const CELL = 12;
const GAP = 3;
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function Heatmap({ state }: { state: ProgressState }) {
  const today = new Date();
  // Começa no domingo de (WEEKS-1) semanas atrás, como o GitHub.
  const start = addDays(today, -today.getDay() - (WEEKS - 1) * 7);
  const level = (n: number) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4);
  const fill = ['var(--c-surface-2)', 'color-mix(in oklab, var(--c-ok) 35%, var(--c-surface-2))', 'color-mix(in oklab, var(--c-ok) 60%, var(--c-surface-2))', 'color-mix(in oklab, var(--c-ok) 82%, var(--c-surface-2))', 'var(--c-ok)'];
  const cells = [];
  const labels = [];
  for (let w = 0; w < WEEKS; w++) {
    const weekStart = addDays(start, w * 7);
    if (weekStart.getDate() <= 7) labels.push({ x: w * (CELL + GAP), text: MONTHS[weekStart.getMonth()] });
    for (let d = 0; d < 7; d++) {
      const day = addDays(start, w * 7 + d);
      if (day > today) continue;
      const a = state.activity[dayKey(day)];
      const n = a?.solved ?? 0;
      cells.push(
        <rect key={`${w}-${d}`} x={w * (CELL + GAP)} y={16 + d * (CELL + GAP)} width={CELL} height={CELL} rx={2.5} fill={fill[level(n)]}>
          <title>{`${day.toLocaleDateString('pt-BR')}: ${n} resolvido(s)${a?.actions ? `, ${a.actions} ação(ões)` : ''}`}</title>
        </rect>,
      );
    }
  }
  const width = WEEKS * (CELL + GAP);
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface p-4">
      <svg width={width} height={16 + 7 * (CELL + GAP)} role="img" aria-label="Heatmap de problemas resolvidos por dia">
        {labels.map((l) => (
          <text key={`${l.x}`} x={l.x} y={10} fontSize={10} fill="var(--c-faint)">{l.text}</text>
        ))}
        {cells}
      </svg>
    </div>
  );
}
