// Página /jornada: o roadmap como um mapa de mundos. A personagem caminha até o milestone escolhido;
// o caminho aceso mostra o progresso real. XP, nível, estrelas e conquistas vêm de src/lib/journey.ts.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProgress } from '../../lib/progress/react.ts';
import { isMastered, milestoneProgress, nextProblem, statusOf, streaks, totalSolved } from '../../lib/progress/selectors.ts';
import { isSolved } from '../../lib/progress/types.ts';
import { GEAR, MILESTONE_BONUS, achievements, journeySummary, milestoneStars, problemXp, worldOf, worldProgress } from '../../lib/journey.ts';
import { checkpointPath, milestonePath, problemPath, slotsOf, type TrailData } from '../../lib/trail.ts';
import { HeroFigure, HeroPortrait } from '../journey/Hero.tsx';
import { H, Scene, posX, sceneWidth, terrainY, type NodeView } from '../journey/scene.tsx';
import { ProgressBar, Skeleton } from '../ui.tsx';
import type { MilestoneDetail } from './RoadmapTrail.tsx';

const SEEN_KEY = 'cses-roadmap:jornada';

function readSeen(): { t: number; xp: number } | null {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) ?? 'null');
    return raw && typeof raw.t === 'number' && typeof raw.xp === 'number' ? raw : null;
  } catch {
    return null;
  }
}
function writeSeen(v: { t: number; xp: number }) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(v));
  } catch {}
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function JourneyMap({ trail, details }: { trail: TrailData; details: Record<string, MilestoneDetail> }) {
  const { state, ready } = useProgress();
  const n = trail.milestones.length;
  const sum = useMemo(() => journeySummary(trail, state), [trail, state]);
  const [selected, setSelected] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<SVGGElement>(null);
  const flipRef = useRef<SVGGElement>(null);
  const heroT = useRef(0);
  const raf = useRef(0);
  const started = useRef(false);
  const seenRef = useRef<{ t: number; xp: number } | null>(null);
  // O cenário usa Math.sin: só é desenhado no cliente, para o HTML do build não divergir na hidratação.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const place = useCallback((t: number, follow: boolean) => {
    heroT.current = t;
    const x = posX(t);
    heroRef.current?.setAttribute('transform', `translate(${x.toFixed(1)},${terrainY(x).toFixed(1)})`);
    const box = scrollRef.current;
    if (follow && box) box.scrollLeft = x - box.clientWidth / 2;
  }, []);

  const walkTo = useCallback(
    (target: number) => {
      cancelAnimationFrame(raf.current);
      const from = heroT.current;
      const dist = Math.abs(target - from);
      const flip = flipRef.current;
      if (dist < 0.001 || reducedMotion()) {
        place(target, true);
        flip?.classList.remove('jr-walk');
        return;
      }
      flip?.setAttribute('transform', `scale(${target < from ? -1 : 1},1)`);
      flip?.classList.add('jr-walk');
      const duration = 450 + 380 * Math.min(dist, 4);
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / duration);
        const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        place(from + (target - from) * e, true);
        if (k < 1) raf.current = requestAnimationFrame(step);
        else {
          flip?.classList.remove('jr-walk');
          flip?.setAttribute('transform', 'scale(1,1)');
        }
      };
      raf.current = requestAnimationFrame(step);
    },
    [place],
  );
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Entrada: a personagem aparece onde estava na última visita e caminha até o progresso de hoje.
  // Depois disso, qualquer avanço (ex.: problema marcado em outra aba) também vira caminhada.
  useEffect(() => {
    if (!ready) return;
    const first = !started.current;
    const seen = first ? readSeen() : seenRef.current;
    started.current = true;
    seenRef.current = { t: sum.position, xp: sum.xp };
    writeSeen(seenRef.current);
    if (first) {
      setSelected(sum.current);
      place(seen && seen.t < sum.position ? Math.max(0, seen.t) : sum.position, true);
      heroRef.current?.classList.remove('opacity-0');
    }
    if (seen && sum.xp > seen.xp) setToast(first ? `+${sum.xp - seen.xp} XP desde a sua última visita` : `+${sum.xp - seen.xp} XP`);
    const moved = seen !== null && (first ? seen.t < sum.position : seen.t !== sum.position);
    if (!moved) return;
    const id = setTimeout(() => {
      setSelected(sum.current);
      walkTo(sum.position);
    }, first ? 500 : 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, sum.position, sum.xp]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  const select = useCallback(
    (i: number) => {
      const j = Math.max(0, Math.min(n - 1, i));
      setSelected(j);
      walkTo(j + 1);
    },
    [n, walkTo],
  );
  const goHome = () => {
    setSelected(sum.current);
    walkTo(sum.position);
  };

  const nodes: NodeView[] = useMemo(
    () =>
      trail.milestones.map((m, i) => ({
        state: !ready ? 'ahead' : milestoneProgress(state, m).done ? 'done' : i === sum.current && !sum.finished ? 'current' : isMastered(state, m.slug) ? 'mastered' : 'ahead',
        stars: ready ? milestoneStars(state, m) : 0,
      })),
    [trail, state, ready, sum.current, sum.finished],
  );

  const m = trail.milestones[selected];
  const d = details[m.slug];
  const prog = milestoneProgress(state, m);
  const world = worldOf(m.phase);
  const next = nextProblem(trail, state);
  const total = totalSolved(state);
  const streak = streaks(state);
  const starsTotal = nodes.reduce((acc, v) => acc + v.stars, 0);
  const badges = useMemo(() => achievements(trail, state), [trail, state]);
  const msXp = useMemo(() => {
    const byId = new Map(trail.problems.map((p) => [p.id, p]));
    let earned = 0;
    let available = MILESTONE_BONUS;
    for (const id of slotsOf(m)) {
      const p = byId.get(id)!;
      available += problemXp(p.difficulty, false);
      const st = statusOf(state, id);
      if (isSolved(st)) earned += problemXp(p.difficulty, st === 'solved_with_hint');
    }
    if (prog.done) earned += MILESTONE_BONUS;
    return { earned, available };
  }, [trail, state, m, prog.done]);

  const tag = !ready
    ? null
    : prog.done
      ? { text: 'Concluído', cls: 'bg-ok/15 text-ok' }
      : selected === sum.current
        ? { text: 'Você está aqui', cls: 'bg-accent/15 text-accent' }
        : isMastered(state, m.slug)
          ? { text: 'Já domino', cls: 'bg-surface-2 text-muted' }
          : { text: selected > sum.current ? `${selected - sum.current} milestone${selected - sum.current === 1 ? '' : 's'} adiante` : 'Em aberto', cls: 'bg-surface-2 text-muted' };

  return (
    <div className="space-y-6">
      {/* HUD */}
      <section className="grid gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-[auto_1fr] sm:p-6">
        <div className="flex items-center gap-4">
          <div className="grid size-24 shrink-0 place-items-center rounded-2xl bg-surface-2">
            <HeroPortrait gear={ready ? sum.gear : []} className="h-20" />
          </div>
          <div className="min-w-0 sm:hidden">
            <LevelLine ready={ready} level={sum.level} title={sum.title} />
          </div>
        </div>
        <div className="min-w-0">
          <div className="hidden sm:block">
            <LevelLine ready={ready} level={sum.level} title={sum.title} />
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-label="XP no nível atual" aria-valuenow={sum.into} aria-valuemin={0} aria-valuemax={sum.span}>
            <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${ready ? Math.round((sum.into / sum.span) * 100) : 0}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {ready ? (
              <>
                <span className="tabular-nums">{sum.into} / {sum.span} XP</span> neste nível
                {sum.nextGear && <> · próximo equipamento: <span className="text-fg">{sum.nextGear.name}</span> no nível {sum.nextGear.level}</>}
              </>
            ) : (
              <Skeleton className="h-3 w-48" />
            )}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <Stat label="XP total" ready={ready} value={`${sum.xp}`} />
            <Stat label="Resolvidos" ready={ready} value={`${total.solved}`} suffix={`/ ${trail.problems.length}`} />
            <Stat label="Estrelas" ready={ready} value={`${starsTotal}`} suffix={`/ ${n * 3}`} />
            <Stat label="Streak" ready={ready} value={`${streak.current}`} suffix={streak.current === 1 ? 'dia' : 'dias'} />
          </dl>
        </div>
      </section>

      {/* Mundos */}
      <nav aria-label="Mundos" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {trail.phases.map((ph, pi) => {
          const w = worldOf(pi);
          const wp = worldProgress(trail, state, pi);
          const here = m.phase === pi;
          const firstIdx = trail.milestones.findIndex((x) => x.phase === pi);
          return (
            <button
              key={ph.slug}
              type="button"
              onClick={() => select(trail.milestones[sum.current].phase === pi ? sum.current : firstIdx)}
              aria-pressed={here}
              className={`shrink-0 rounded-xl border px-3.5 py-2 text-left transition-colors ${here ? 'border-accent/60 bg-surface' : 'border-line bg-surface hover:bg-surface-2'}`}
            >
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Mundo {pi + 1}</span>
              <span className="block text-sm font-semibold whitespace-nowrap">{w.name}</span>
              <span className="mt-0.5 block text-xs tabular-nums text-muted">
                {ready ? (wp.done ? 'concluído' : `${wp.cleared}/${wp.milestones} milestones`) : `${wp.milestones} milestones`}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mapa */}
      <section className="relative">
        <div
          ref={scrollRef}
          tabIndex={0}
          role="group"
          aria-label="Mapa da jornada. Use as setas esquerda e direita para andar entre os milestones e Enter para entrar."
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') { e.preventDefault(); select(selected + 1); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); select(selected - 1); }
            else if (e.key === 'Enter' && e.target === e.currentTarget) window.location.href = milestonePath(m.slug);
          }}
          className="overflow-x-auto overflow-y-hidden rounded-2xl border border-line bg-surface-2"
          style={{ height: H }}
        >
          <svg width={sceneWidth(n)} height={H} viewBox={`0 0 ${sceneWidth(n)} ${H}`} className="block select-none" style={{ fontFamily: 'var(--font-sans)' }}>
            {mounted && <Scene trail={trail} nodes={nodes} litTo={ready ? sum.position : 0} selected={selected} onSelect={select} />}
            <g ref={heroRef} className="pointer-events-none opacity-0 transition-opacity duration-300">
              <g ref={flipRef} className="jr-idle">
                <g transform="scale(1.15)">
                  <HeroFigure gear={ready ? sum.gear : []} />
                </g>
              </g>
            </g>
          </svg>
        </div>
        {toast && (
          <p role="status" className="jr-toast absolute top-3 left-1/2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-fg shadow-lg">
            {toast}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <span>Clique num milestone ou use ← → para andar. A linha dourada é o seu progresso real.</span>
          <button type="button" onClick={goHome} className="rounded-md border border-line px-2.5 py-1 hover:bg-surface-2 hover:text-fg">
            Voltar para onde parei
          </button>
        </div>
      </section>

      {/* Milestone selecionado */}
      <section aria-live="polite" className={`rounded-2xl border bg-surface p-5 sm:p-6 ${ready && selected === sum.current && !prog.done ? 'border-accent/60' : 'border-line'}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="font-semibold uppercase tracking-[0.14em] text-accent">{world.name}</span>
          <span className="text-faint">Milestone {m.num} de {n}</span>
          {tag && <span className={`rounded-full px-2 py-0.5 font-semibold ${tag.cls}`}>{tag.text}</span>}
        </div>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{m.name}</h2>
        <p className="mt-1.5 text-sm text-muted">Ao final você sabe {d.goal}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span aria-label={`${nodes[selected].stars} de 3 estrelas`} className="text-lg leading-none tracking-widest">
            {[1, 2, 3].map((k) => (
              <span key={k} className={k <= nodes[selected].stars ? 'text-accent' : 'text-line'}>★</span>
            ))}
          </span>
          <span className="tabular-nums text-muted">{ready ? `${prog.solved}/${prog.total}` : prog.total} problemas</span>
          <span className="tabular-nums text-muted">{ready ? `${msXp.earned} / ` : ''}{msXp.available} XP</span>
        </div>
        <ProgressBar value={ready ? prog.solved : 0} total={prog.total} className="mt-3" />
        <p className="mt-2 text-xs text-faint">★ metade resolvida · ★★ tudo resolvido · ★★★ tudo sem abrir dica</p>
        <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
          {d.modules.map((mod) =>
            mod.href ? (
              <a key={mod.title} href={mod.href} className="rounded-md bg-surface-2 px-2 py-1 hover:text-accent">{mod.title}</a>
            ) : (
              <span key={mod.title} className="rounded-md border border-dashed border-line px-2 py-1 text-faint">{mod.title}</span>
            ),
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {ready && next && next.ms === selected && (
            <a href={problemPath(next.id)} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:opacity-90">
              Próximo: {next.title}
            </a>
          )}
          <a href={milestonePath(m.slug)} className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-surface-2">Entrar no milestone</a>
          <a href={checkpointPath(m.slug)} className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-surface-2">
            Checkpoint Cego ({m.reserved.length + m.review.length})
          </a>
        </div>
      </section>

      {/* Equipamentos e conquistas */}
      <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Equipamentos</h2>
          <ul className="mt-4 space-y-3">
            {GEAR.map((g) => {
              const on = ready && sum.level >= g.level;
              return (
                <li key={g.key} className={`flex items-center gap-3 ${on ? '' : 'opacity-55'}`}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-surface-2">
                    <HeroPortrait gear={[g.key]} className="h-9" />
                  </span>
                  <span className="min-w-0 text-sm">
                    <span className="block font-medium">{g.name}</span>
                    <span className="block text-xs text-muted">{on ? 'Equipado' : `Libera no nível ${g.level}`}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
            Conquistas{ready && <span className="ml-2 font-normal tabular-nums normal-case tracking-normal">{badges.filter((b) => b.unlocked).length}/{badges.length}</span>}
          </h2>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {badges.map((b) => {
              const on = ready && b.unlocked;
              return (
                <li key={b.key} className={`flex items-center gap-3 rounded-xl border p-3 ${on ? 'border-accent/50' : 'border-line opacity-55'}`}>
                  <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-lg ${on ? '' : 'grayscale'}`}>{b.icon}</span>
                  <span className="min-w-0 text-sm">
                    <span className="block truncate font-medium">{b.name}</span>
                    <span className="block text-xs text-muted">{b.how}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}

function LevelLine({ ready, level, title }: { ready: boolean; level: number; title: string }) {
  return ready ? (
    <p className="flex flex-wrap items-baseline gap-x-3">
      <span className="text-2xl font-semibold tracking-tight">Nível {level}</span>
      <span className="text-sm font-medium text-accent">{title}</span>
    </p>
  ) : (
    <Skeleton className="h-8 w-40" />
  );
}

function Stat({ label, value, suffix, ready }: { label: string; value: string; suffix?: string; ready: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-faint">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums">
        {ready ? <>{value}{suffix && <span className="ml-1 text-sm font-normal text-muted">{suffix}</span>}</> : <Skeleton className="h-5 w-12" />}
      </dd>
    </div>
  );
}
