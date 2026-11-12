import { useEffect, useState } from 'react';
import { useProgress } from '../../lib/progress/react.ts';
import { isMastered, milestoneProgress, nextProblem, totalSolved } from '../../lib/progress/selectors.ts';
import { milestoneStars, worldOf, worldProgress } from '../../lib/journey.ts';
import { checkpointPath, milestonePath, problemPath, type TrailData } from '../../lib/trail.ts';
import { Icon, ProgressBar, Ring, Stars } from '../ui.tsx';

export interface MilestoneDetail {
  goal: string;
  modules: { title: string; href: string | null }[];
}

export default function RoadmapTrail({ trail, details }: { trail: TrailData; details: Record<string, MilestoneDetail> }) {
  const { state, ready } = useProgress();
  const next = ready ? nextProblem(trail, state) : null;
  const current = next?.ms ?? -1;
  const total = totalSolved(state);
  // Fases concluídas começam recolhidas; o clique no cabeçalho (ou num atalho) abre e fecha.
  const [toggled, setToggled] = useState<Record<number, boolean>>({});
  const isOpen = (pi: number, done: boolean) => toggled[pi] ?? !(ready && done);
  const open = (pi: number) => setToggled((t) => ({ ...t, [pi]: true }));
  // Link direto para um milestone de uma fase recolhida: abre a fase e rola até ele.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    const m = trail.milestones.find((x) => x.slug === id);
    if (!ready || !m) return;
    open(m.phase);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div>
      {/* Resumo + atalhos de fase (gruda no topo ao rolar) */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3 text-xs text-muted">
          <ProgressBar value={ready ? total.solved : 0} total={trail.problems.length} />
          <span className="shrink-0 tabular-nums">{ready ? `${total.solved}/${trail.problems.length}` : `${trail.problems.length} problemas`}</span>
        </div>
        <nav aria-label="Fases" className="mt-2.5 flex gap-1.5 overflow-x-auto text-xs">
          {trail.phases.map((ph, pi) => {
            const w = worldOf(pi);
            const wp = worldProgress(trail, state, pi);
            return (
              <a key={ph.slug} href={`#${ph.slug}`} onClick={() => open(pi)} className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 hover:border-accent/60">
                <span className="size-2 rounded-full" style={{ background: w.color }} />
                Fase {pi + 1}
                {ready && <span className="tabular-nums text-faint">{wp.cleared}/{wp.milestones}</span>}
              </a>
            );
          })}
          {next && (
            <a href={`#${trail.milestones[next.ms].slug}`} onClick={() => open(trail.milestones[next.ms].phase)} className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 font-semibold text-accent-fg">
              Onde estou <Icon name="arrow" size={12} />
            </a>
          )}
        </nav>
      </div>

      <div className="mt-8 space-y-14">
        {trail.phases.map((phase, pi) => {
          const ms = trail.milestones.filter((m) => m.phase === pi);
          const w = worldOf(pi);
          const wp = worldProgress(trail, state, pi);
          const shown = isOpen(pi, wp.done);
          return (
            <section key={phase.slug} id={phase.slug} className="scroll-mt-36">
              <header className={`overflow-hidden rounded-2xl border border-line bg-surface ${shown ? 'mb-6' : ''}`} style={{ backgroundImage: `linear-gradient(100deg, color-mix(in oklab, ${w.color} 20%, transparent), transparent 60%)` }}>
                <button
                  type="button"
                  aria-expanded={shown}
                  aria-controls={`${phase.slug}-lista`}
                  onClick={() => setToggled((t) => ({ ...t, [pi]: !shown }))}
                  className="flex w-full flex-wrap items-end justify-between gap-x-6 gap-y-2 p-5 text-left"
                >
                  <span className="block min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Fase {pi + 1} · {w.name}</span>
                    <span role="heading" aria-level={2} className="mt-1 block text-xl font-semibold tracking-tight">{phase.name.replace(/^Fase \d+ — /, '')}</span>
                    <span className="mt-1 block text-sm text-muted">{w.blurb}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-sm tabular-nums text-muted">
                    {ready && wp.done && <span className="rounded-full bg-ok/15 px-2 py-0.5 text-xs font-semibold text-ok">concluída</span>}
                    {ready ? `${wp.solved}/${wp.total} problemas · ${wp.cleared}/${wp.milestones} milestones` : `${wp.total} problemas · ${wp.milestones} milestones`}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform ${shown ? 'rotate-180' : ''}`}>
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </button>
                <div className="h-1.5 bg-surface-2">
                  <div className="h-full transition-[width] duration-700" style={{ width: `${ready && wp.total ? (wp.solved / wp.total) * 100 : 0}%`, background: w.color }} />
                </div>
              </header>
              <ol id={`${phase.slug}-lista`} hidden={!shown} className="relative space-y-3 before:absolute before:top-4 before:bottom-4 before:left-[21px] before:w-0.5 before:rounded-full before:bg-line">
                {ms.map((m) => {
                  const prog = milestoneProgress(state, m);
                  const mastered = isMastered(state, m.slug);
                  const isCurrent = m.num - 1 === current;
                  const d = details[m.slug];
                  const done = ready && prog.done;
                  return (
                    <li key={m.slug} id={m.slug} className="relative flex scroll-mt-36 gap-3 sm:gap-4">
                      <a href={milestonePath(m.slug)} aria-label={`Milestone ${m.num}`} className="z-10 mt-3 shrink-0 rounded-full bg-bg">
                        <Ring value={ready ? prog.solved : 0} total={prog.total} size={44} stroke={4} color={done ? 'var(--c-ok)' : isCurrent ? 'var(--c-accent)' : w.color}>
                          {done ? (
                            <Icon name="check" size={18} className="text-ok" />
                          ) : (
                            <span className={`text-sm font-semibold tabular-nums ${isCurrent ? 'text-accent' : 'text-muted'}`}>{m.num}</span>
                          )}
                        </Ring>
                      </a>
                      <div className={`min-w-0 flex-1 rounded-xl border bg-surface p-4 sm:p-5 ${isCurrent ? 'border-accent/60 shadow-[0_0_0_4px_color-mix(in_oklab,var(--c-accent)_8%,transparent)]' : 'border-line'} ${mastered && !done ? 'opacity-70' : ''}`}>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <a href={milestonePath(m.slug)} className="font-semibold tracking-tight hover:underline underline-offset-4">
                            {done && <span className="mr-1.5 text-xs tabular-nums text-faint">{m.num}.</span>}
                            {m.name}
                          </a>
                          <span className="flex items-center gap-2.5 text-xs tabular-nums text-muted">
                            {ready && <Stars value={milestoneStars(state, m)} className="text-sm" />}
                            {ready ? `${prog.solved}/${prog.total}` : `${prog.total} problemas`}
                            {mastered && ' · já domino'}
                          </span>
                        </div>
                        <p className={`mt-1.5 text-sm text-muted ${isCurrent ? '' : 'line-clamp-2 sm:line-clamp-none'}`}>Ao final você sabe {d.goal}</p>
                        {isCurrent && next && (
                          <a href={problemPath(next.id)} className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-fg hover:opacity-90">
                            <span className="truncate">Continuar: {next.title}</span> <Icon name="arrow" size={14} />
                          </a>
                        )}
                        <div className={`mt-3 flex-wrap gap-1.5 text-xs ${isCurrent ? 'flex' : 'hidden sm:flex'}`}>
                          {d.modules.map((mod) =>
                            mod.href ? (
                              <a key={mod.title} href={mod.href} className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2 py-1 hover:text-accent">
                                <Icon name="book" size={12} className="text-faint" /> {mod.title}
                              </a>
                            ) : (
                              <span key={mod.title} className="rounded-md border border-dashed border-line px-2 py-1 text-faint">{mod.title}</span>
                            ),
                          )}
                          <a href={checkpointPath(m.slug)} className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-muted hover:text-fg">
                            <Icon name="target" size={12} /> Checkpoint Cego ({m.reserved.length + m.review.length})
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
    </div>
  );
}
