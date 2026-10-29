import { useProgress } from '../../lib/progress/react.ts';
import { isMastered, milestoneProgress, nextProblem } from '../../lib/progress/selectors.ts';
import { checkpointPath, milestonePath, type TrailData } from '../../lib/trail.ts';
import { ProgressBar } from '../ui.tsx';

export interface MilestoneDetail {
  goal: string;
  modules: { title: string; href: string | null }[];
}

export default function RoadmapTrail({ trail, details }: { trail: TrailData; details: Record<string, MilestoneDetail> }) {
  const { state, ready } = useProgress();
  const current = ready ? nextProblem(trail, state)?.ms ?? -1 : -1;

  return (
    <div className="space-y-12">
      {trail.phases.map((phase, pi) => {
        const ms = trail.milestones.filter((m) => m.phase === pi);
        return (
          <section key={phase.slug}>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.14em] text-muted">{phase.name}</h2>
            <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[19px] before:w-px before:bg-line">
              {ms.map((m) => {
                const prog = milestoneProgress(state, m);
                const mastered = isMastered(state, m.slug);
                const isCurrent = m.num - 1 === current;
                const d = details[m.slug];
                const node = !ready
                  ? 'border-line bg-surface text-muted'
                  : prog.done
                    ? 'border-ok bg-ok text-bg'
                    : isCurrent
                      ? 'border-accent bg-accent text-accent-fg'
                      : mastered
                        ? 'border-dashed border-muted bg-surface text-muted'
                        : 'border-line bg-surface text-muted';
                return (
                  <li key={m.slug} className="relative flex gap-4">
                    <a
                      href={milestonePath(m.slug)}
                      className={`z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold tabular-nums ${node}`}
                      aria-label={`Milestone ${m.num}`}
                    >
                      {m.num}
                    </a>
                    <div
                      className={`min-w-0 flex-1 rounded-xl border bg-surface p-4 sm:p-5 ${isCurrent ? 'border-accent/60' : 'border-line'} ${mastered && !prog.done ? 'opacity-70' : ''}`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <a href={milestonePath(m.slug)} className="font-semibold tracking-tight hover:underline underline-offset-4">
                          {m.name}
                        </a>
                        <span className="text-xs tabular-nums text-muted">
                          {ready ? `${prog.solved}/${prog.total}` : `${prog.total} problemas`}
                          {mastered && ' · já domino'}
                          {isCurrent && <span className="ml-2 font-semibold text-accent">você está aqui</span>}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-muted">Ao final você sabe {d.goal}</p>
                      <ProgressBar value={ready ? prog.solved : 0} total={prog.total} className="mt-3" />
                      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                        {d.modules.map((mod) =>
                          mod.href ? (
                            <a key={mod.title} href={mod.href} className="rounded-md bg-surface-2 px-2 py-1 hover:text-accent">
                              {mod.title}
                            </a>
                          ) : (
                            <span key={mod.title} className="rounded-md border border-dashed border-line px-2 py-1 text-faint" title="Módulo ainda não escrito">
                              {mod.title}
                            </span>
                          ),
                        )}
                        <a href={checkpointPath(m.slug)} className="rounded-md border border-line px-2 py-1 text-muted hover:text-fg">
                          Checkpoint Cego ({m.reserved.length + m.review.length})
                        </a>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
