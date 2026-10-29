import { useProgress } from '../../lib/progress/react.ts';
import { isMastered, milestoneProgress, statusOf } from '../../lib/progress/selectors.ts';
import { toggleMastered } from '../../lib/progress/store.ts';
import { csesUrl, problemPath, type TrailMilestone } from '../../lib/trail.ts';
import { DifficultyDots, ProgressBar, StatusDot } from '../ui.tsx';

export interface Row {
  id: number;
  title: string;
  difficulty: number;
}

export default function MilestoneProblems({ milestone, rows }: { milestone: TrailMilestone; rows: Row[] }) {
  const { state, ready } = useProgress();
  const prog = milestoneProgress(state, milestone);
  const mastered = isMastered(state, milestone.slug);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Problemas</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted select-none">
          <input type="checkbox" className="accent-[var(--c-accent)]" checked={mastered} disabled={!ready} onChange={() => toggleMastered(milestone.slug)} />
          Já domino (pular na trilha)
        </label>
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm text-muted">
        <ProgressBar value={ready ? prog.solved : 0} total={prog.total} />
        <span className="shrink-0 tabular-nums">{ready ? `${prog.solved}/${prog.total}` : `${prog.total}`}</span>
      </div>
      <ol className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {rows.map((r, i) => (
          <li key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2/60">
            <span className="w-5 shrink-0 text-right text-xs tabular-nums text-faint">{i + 1}</span>
            <StatusDot status={ready ? statusOf(state, r.id) : 'not_started'} mastered={mastered} />
            <a href={problemPath(r.id)} className="min-w-0 flex-1 truncate hover:underline underline-offset-4">
              {r.title}
            </a>
            <DifficultyDots value={r.difficulty} />
            <a href={csesUrl(r.id)} target="_blank" rel="noreferrer" className="shrink-0 text-xs text-muted hover:text-accent" title="Abrir no CSES">
              CSES ↗
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
