import { useMemo } from 'react';
import { useProfile, useProgress } from '../../lib/progress/react.ts';
import { milestoneProgress, nextProblem, statusOf, streaks, totalSolved } from '../../lib/progress/selectors.ts';
import { addDays, dayKey } from '../../lib/progress/dates.ts';
import { isSolved } from '../../lib/progress/types.ts';
import { journeySummary, problemXp, worldOf, worldProgress } from '../../lib/journey.ts';
import { checkpointPath, csesUrl, milestonePath, problemPath, type TrailData } from '../../lib/trail.ts';
import { HeroPortrait } from '../journey/Hero.tsx';
import { DifficultyDots, Icon, Ring, Skeleton, StatusDot } from '../ui.tsx';
import type { MilestoneDetail } from './RoadmapTrail.tsx';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function HomeDashboard({ trail, details }: { trail: TrailData; details: Record<string, MilestoneDetail> }) {
  const { state, ready } = useProgress();
  const { look } = useProfile();
  const next = nextProblem(trail, state);
  const ms = next ? trail.milestones[next.ms] : null;
  const msProg = ms ? milestoneProgress(state, ms) : null;
  const total = totalSolved(state);
  const streak = streaks(state);
  const sum = useMemo(() => journeySummary(trail, state), [trail, state]);
  const world = worldOf(ms?.phase ?? trail.phases.length - 1);

  const week = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i - 6);
      return { label: WEEKDAYS[d.getDay()], active: (state.activity[dayKey(d)]?.actions ?? 0) > 0, today: i === 6 };
    });
  }, [state]);

  const recent = useMemo(() => {
    const byId = new Map(trail.problems.map((p) => [String(p.id), p]));
    return Object.entries(state.problems)
      .filter(([id, p]) => isSolved(p.status) && p.solvedAt && byId.has(id))
      .sort((a, b) => b[1].solvedAt!.localeCompare(a[1].solvedAt!))
      .slice(0, 5)
      .map(([id, p]) => ({ ...byId.get(id)!, when: new Date(p.solvedAt!) }));
  }, [trail, state]);

  return (
    <div className="space-y-6">
      {/* Próximo problema + personagem */}
      <section className="grid gap-4 lg:grid-cols-[1fr_19rem]">
        <div
          className="relative overflow-hidden rounded-2xl border border-accent/40 bg-surface p-6 sm:p-8"
          style={{ backgroundImage: `radial-gradient(36rem 16rem at 100% 0%, color-mix(in oklab, ${world.color} 18%, transparent), transparent 70%)` }}
        >
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            <Icon name="target" size={14} /> Próximo problema
          </p>
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
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted">
                <span className="font-mono text-faint">#{next.id}</span>
                <DifficultyDots value={next.difficulty} />
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">+{problemXp(next.difficulty, false)} XP</span>
                {next.reserved ? (
                  <a className="hover:text-fg" href={checkpointPath(ms.slug)}>Checkpoint Cego · milestone {ms.num}</a>
                ) : (
                  <a className="hover:text-fg" href={milestonePath(ms.slug)}>Milestone {ms.num} · {ms.name}</a>
                )}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={problemPath(next.id)} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg hover:opacity-90">
                  Continuar de onde parei <Icon name="arrow" size={15} />
                </a>
                <a href={csesUrl(next.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm hover:bg-surface-2">
                  Abrir no CSES <Icon name="external" size={14} />
                </a>
              </div>
            </>
          ) : (
            <p className="mt-3 text-2xl font-semibold">Trilha completa. Todos os {trail.problems.length} problemas resolvidos.</p>
          )}
        </div>

        <a href="/jornada" className="lift flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 lg:flex-col lg:items-stretch lg:text-center">
          <span className="grid size-24 shrink-0 place-items-center rounded-2xl lg:mx-auto lg:size-28" style={{ background: `color-mix(in oklab, ${world.color} 22%, var(--c-surface-2))` }}>
            <HeroPortrait look={look} gear={ready ? sum.gear : []} className="h-20 lg:h-24" />
          </span>
          <span className="min-w-0 flex-1">
            {ready ? (
              <>
                <span className="block text-lg font-semibold tracking-tight">Nível {sum.level} <span className="text-sm font-medium text-accent">· {sum.title}</span></span>
                <span className="mt-2 block h-2 overflow-hidden rounded-full bg-surface-2">
                  <span className="block h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${Math.round((sum.into / sum.span) * 100)}%` }} />
                </span>
                <span className="mt-1.5 block text-xs tabular-nums text-muted">{sum.toNext} XP para o nível {sum.level + 1}</span>
                <span className="mt-2 block truncate text-xs text-faint">{world.name}</span>
              </>
            ) : (
              <Skeleton className="h-16 w-full" />
            )}
          </span>
        </a>
      </section>

      {/* Números */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Tile label="Resolvidos" ready={ready}>
          <div className="flex items-center gap-3">
            <Ring value={total.solved} total={trail.problems.length} size={52} stroke={5}>
              <span className="text-[11px] font-semibold tabular-nums">{Math.round((total.solved / trail.problems.length) * 100)}%</span>
            </Ring>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{total.solved}<span className="ml-1 text-sm font-normal text-muted">/ {trail.problems.length}</span></p>
              <p className="text-xs text-muted">{total.withHint} com dica</p>
            </div>
          </div>
        </Tile>
        <Tile label="Streak" ready={ready}>
          <p className="flex items-center gap-2 text-2xl font-semibold tabular-nums">
            <Icon name="fire" size={20} className={streak.current > 0 ? 'text-accent' : 'text-faint'} />
            {streak.current}<span className="text-sm font-normal text-muted">{streak.current === 1 ? 'dia' : 'dias'}</span>
          </p>
          <p className="text-xs text-muted">Melhor: {streak.best} {streak.best === 1 ? 'dia' : 'dias'}</p>
          <div className="mt-2.5 flex gap-1.5" aria-label="Últimos 7 dias">
            {week.map((d, i) => (
              <span key={i} className="flex flex-col items-center gap-1 text-[10px] text-faint">
                <span className={`size-4 rounded-full border ${d.active ? 'border-accent bg-accent' : d.today ? 'border-dashed border-muted' : 'border-line bg-surface-2'}`} />
                {d.label}
              </span>
            ))}
          </div>
        </Tile>
        <Tile label="Milestone atual" ready={ready}>
          {ms && msProg ? (
            <a href={milestonePath(ms.slug)} className="flex items-center gap-3 hover:text-accent">
              <Ring value={msProg.solved} total={msProg.total} size={52} stroke={5} color={world.color}>
                <span className="text-sm font-semibold tabular-nums">{ms.num}</span>
              </Ring>
              <span className="min-w-0">
                <span className="line-clamp-2 text-sm font-medium leading-snug">{ms.name}</span>
                <span className="text-xs tabular-nums text-muted">{msProg.solved}/{msProg.total}</span>
              </span>
            </a>
          ) : (
            <p className="text-2xl font-semibold">—</p>
          )}
        </Tile>
      </section>

      {/* Mundos */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted">As cinco fases</h2>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
          {trail.phases.map((ph, pi) => {
            const w = worldOf(pi);
            const wp = worldProgress(trail, state, pi);
            const here = ready && ms?.phase === pi;
            return (
              <a key={ph.slug} href={`/roadmap#${ph.slug}`} className={`lift w-44 shrink-0 overflow-hidden rounded-xl border bg-surface lg:w-auto ${here ? 'border-accent/60' : 'border-line'}`}>
                <span className="block h-1.5" style={{ background: w.color }} />
                <span className="block p-3.5">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Fase {pi + 1}{here && ' · você está aqui'}</span>
                  <span className="mt-0.5 block text-sm font-semibold leading-snug">{w.name}</span>
                  <span className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${ready && wp.total ? (wp.solved / wp.total) * 100 : 0}%`, background: w.color }} />
                  </span>
                  <span className="mt-1.5 block text-xs tabular-nums text-muted">{ready ? `${wp.solved}/${wp.total} problemas` : `${wp.total} problemas`}</span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* Estudar agora + últimos resolvidos */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-line bg-surface p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted"><Icon name="book" size={15} /> Teoria deste milestone</h2>
          {ms ? (
            <ul className="mt-3 space-y-2">
              {details[ms.slug].modules.map((mod) => (
                <li key={mod.title}>
                  <a href={mod.href ?? '#'} className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3.5 py-2.5 text-sm hover:text-accent">
                    <span className="min-w-0 truncate">{mod.title}</span>
                    <Icon name="arrow" size={14} className="text-faint" />
                  </a>
                </li>
              ))}
              <li>
                <a href={checkpointPath(ms.slug)} className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-line px-3.5 py-2.5 text-sm text-muted hover:text-fg">
                  Checkpoint Cego do milestone {ms.num}
                  <Icon name="arrow" size={14} className="text-faint" />
                </a>
              </li>
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Nada pendente.</p>
          )}
        </div>
        <div className="min-w-0 rounded-2xl border border-line bg-surface p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted"><Icon name="check" size={15} /> Últimos resolvidos</h2>
          {!ready ? (
            <Skeleton className="mt-3 h-24 w-full" />
          ) : recent.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Ainda nada por aqui. O primeiro problema leva uns dez minutos: comece por ele.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {recent.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2 text-sm">
                  <StatusDot status={statusOf(state, p.id)} />
                  <a href={problemPath(p.id)} className="min-w-0 flex-1 truncate hover:underline underline-offset-4">{p.title}</a>
                  <span className="shrink-0 text-xs tabular-nums text-faint">{p.when.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* No celular, Checklist e Template não cabem na barra inferior. */}
      <nav aria-label="Ferramentas" className="grid grid-cols-2 gap-3 text-sm md:hidden">
        {([
          ['/checklist', 'check', 'Checklist de submit'],
          ['/template', 'code', 'Template C++'],
        ] as const).map(([href, icon, label]) => (
          <a key={href} href={href} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 text-muted">
            <Icon name={icon} size={17} className="text-accent" /> {label}
          </a>
        ))}
      </nav>
    </div>
  );
}

function Tile({ label, ready, children }: { label: string; ready: boolean; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-surface p-4 sm:p-5">
      <p className="mb-2.5 text-xs uppercase tracking-wider text-faint">{label}</p>
      {ready ? children : <Skeleton className="h-12 w-full" />}
    </div>
  );
}
