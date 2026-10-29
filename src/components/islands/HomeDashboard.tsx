import { useProgress } from '../../lib/progress/react.ts';
import { milestoneProgress, nextProblem, streaks, totalSolved } from '../../lib/progress/selectors.ts';
import { checkpointPath, csesUrl, milestonePath, problemPath, type TrailData } from '../../lib/trail.ts';
import { DifficultyDots, ProgressBar, Skeleton } from '../ui.tsx';

export default function HomeDashboard({ trail }: { trail: TrailData }) {
  const { state, ready } = useProgress();
  const next = nextProblem(trail, state);
  const ms = next ? trail.milestones[next.ms] : null;
  const msProg = ms ? milestoneProgress(state, ms) : null;
  const total = totalSolved(state);
  const streak = streaks(state);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-accent/40 bg-surface p-6 shadow-[0_0_0_4px_color-mix(in_oklab,var(--c-accent)_8%,transparent)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Próximo problema</p>
        {!ready ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : next && ms ? (
          <>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              <a href={problemPath(next.id)} className="hover:underline underline-offset-4">{next.title}</a>
            </h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="font-mono text-faint">#{next.id}</span>
              <DifficultyDots value={next.difficulty} />
              {next.reserved ? (
                <a className="hover:text-fg" href={checkpointPath(ms.slug)}>Checkpoint Cego · milestone {ms.num}</a>
              ) : (
                <a className="hover:text-fg" href={milestonePath(ms.slug)}>Milestone {ms.num} · {ms.name}</a>
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={problemPath(next.id)} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:opacity-90">
                Abrir página do problema
              </a>
              <a href={csesUrl(next.id)} target="_blank" rel="noreferrer" className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-surface-2">
                Abrir no CSES ↗
              </a>
            </div>
          </>
        ) : (
          <p className="mt-3 text-2xl font-semibold">Trilha completa. Todos os 400 problemas resolvidos.</p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Resolvidos" ready={ready} value={`${total.solved}`} suffix={`/ ${trail.problems.length}`}>
          <ProgressBar value={total.solved} total={trail.problems.length} className="mt-3" />
          <p className="mt-2 text-xs text-muted">{total.withHint} com dica</p>
        </Stat>
        <Stat label="Streak" ready={ready} value={`${streak.current}`} suffix={streak.current === 1 ? 'dia' : 'dias'}>
          <p className="mt-3 text-xs text-muted">Melhor: {streak.best} {streak.best === 1 ? 'dia' : 'dias'}</p>
        </Stat>
        <Stat label="Milestone atual" ready={ready} value={ms ? `${ms.num}` : '—'} suffix={`/ ${trail.milestones.length}`}>
          {ms && msProg && (
            <>
              <ProgressBar value={msProg.solved} total={msProg.total} className="mt-3" />
              <a href={milestonePath(ms.slug)} className="mt-2 block truncate text-xs text-muted hover:text-fg">{ms.name}</a>
            </>
          )}
        </Stat>
      </section>
    </div>
  );
}

function Stat({ label, value, suffix, ready, children }: { label: string; value: string; suffix: string; ready: boolean; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="text-xs uppercase tracking-wider text-faint">{label}</p>
      {ready ? (
        <>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums">
            {value} <span className="text-base font-normal text-muted">{suffix}</span>
          </p>
          {children}
        </>
      ) : (
        <Skeleton className="mt-2 h-7 w-20" />
      )}
    </div>
  );
}
