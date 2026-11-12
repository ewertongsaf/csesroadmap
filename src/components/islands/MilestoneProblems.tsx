import { useProgress } from '../../lib/progress/react.ts';
import { isMastered, milestoneProgress, statusOf } from '../../lib/progress/selectors.ts';
import { toggleMastered } from '../../lib/progress/store.ts';
import { isSolved } from '../../lib/progress/types.ts';
import { MILESTONE_BONUS, milestoneStars, problemXp } from '../../lib/journey.ts';
import { csesUrl, problemPath, type TrailMilestone } from '../../lib/trail.ts';
import { DifficultyDots, Icon, Ring, Stars, StatusDot } from '../ui.tsx';

export interface Row {
  id: number;
  title: string;
  difficulty: number;
}

export default function MilestoneProblems({ milestone, rows, reserved, color }: { milestone: TrailMilestone; rows: Row[]; reserved: Row[]; color: string }) {
  const { state, ready } = useProgress();
  const prog = milestoneProgress(state, milestone);
  const mastered = isMastered(state, milestone.slug);
  const all = [...rows, ...reserved];
  const available = all.reduce((a, r) => a + problemXp(r.difficulty, false), MILESTONE_BONUS);
  const earned = all.reduce((a, r) => {
    const st = statusOf(state, r.id);
    return a + (isSolved(st) ? problemXp(r.difficulty, st === 'solved_with_hint') : 0);
  }, prog.done ? MILESTONE_BONUS : 0);
  const nextId = ready ? rows.find((r) => !isSolved(statusOf(state, r.id)))?.id : undefined;

  return (
    <section>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border border-line bg-surface p-5">
        <Ring value={ready ? prog.solved : 0} total={prog.total} size={64} stroke={6} color={ready && prog.done ? 'var(--c-ok)' : color} label={`${prog.solved} de ${prog.total} resolvidos`}>
          <span className="text-sm font-semibold tabular-nums">{ready ? `${Math.round((prog.solved / prog.total) * 100)}%` : '·'}</span>
        </Ring>
        <dl className="grid min-w-0 flex-1 basis-56 grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-faint">Resolvidos</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">{ready ? prog.solved : '–'}<span className="ml-1 text-sm font-normal text-muted">/ {prog.total}</span></dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-faint">Estrelas</dt>
            <dd className="mt-0.5 text-lg"><Stars value={ready ? milestoneStars(state, milestone) : 0} /></dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-faint">XP</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">{ready ? earned : '–'}<span className="ml-1 text-sm font-normal text-muted">/ {available}</span></dd>
          </div>
        </dl>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted select-none">
          <input type="checkbox" className="size-4 accent-[var(--c-accent)]" checked={mastered} disabled={!ready} onChange={() => toggleMastered(milestone.slug)} />
          Já domino (pular na trilha)
        </label>
      </div>

      <ol className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {rows.map((r, i) => {
          const isNext = r.id === nextId;
          return (
            <li key={r.id} className={`relative flex items-center gap-3 px-4 py-3 hover:bg-surface-2/60 ${isNext ? 'bg-accent/[0.07]' : ''}`}>
              {isNext && <span className="absolute inset-y-0 left-0 w-1 bg-accent" aria-hidden="true" />}
              <span className="w-5 shrink-0 text-right text-xs tabular-nums text-faint">{i + 1}</span>
              <StatusDot status={ready ? statusOf(state, r.id) : 'not_started'} mastered={mastered} />
              <a href={problemPath(r.id)} className="min-w-0 flex-1 truncate after:absolute after:inset-0 hover:underline underline-offset-4">
                {r.title}
              </a>
              {isNext && <span className="hidden shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-fg sm:block">próximo</span>}
              <DifficultyDots value={r.difficulty} />
              <span className="hidden w-12 shrink-0 text-right text-xs tabular-nums text-faint sm:block">+{problemXp(r.difficulty, false)} XP</span>
              <a href={csesUrl(r.id)} target="_blank" rel="noreferrer" className="relative z-10 inline-flex shrink-0 items-center gap-1 text-xs text-muted hover:text-accent" title="Abrir no CSES">
                CSES <Icon name="external" size={12} />
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
