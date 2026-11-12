import { useEffect, useMemo, useRef, useState } from 'react';
import { useProgress } from '../../lib/progress/react.ts';
import { isMastered, milestoneProgress, solvedBySection, statusOf, streaks, totalSolved } from '../../lib/progress/selectors.ts';
import { addDays, dayKey } from '../../lib/progress/dates.ts';
import { isSolved, type ProgressState } from '../../lib/progress/types.ts';
import { journeySummary, worldOf } from '../../lib/journey.ts';
import { milestonePath, type TrailData } from '../../lib/trail.ts';
import { Icon, ProgressBar, Ring, Skeleton } from '../ui.tsx';

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export default function StatsView({ trail, sections }: { trail: TrailData; sections: string[] }) {
  const { state, ready } = useProgress();
  const sum = useMemo(() => journeySummary(trail, state), [trail, state]);
  if (!ready) return <Skeleton className="h-64 w-full" />;

  const total = totalSolved(state);
  const streak = streaks(state);
  const bySection = solvedBySection(trail, state);
  const n = trail.problems.length;
  const trying = trail.problems.filter((p) => statusOf(state, p.id) === 'trying').length;
  const clean = total.solved - total.withHint;
  const byDiff = [1, 2, 3, 4, 5].map((d) => {
    const ps = trail.problems.filter((p) => p.difficulty === d);
    return { d, total: ps.length, solved: ps.filter((p) => isSolved(statusOf(state, p.id))).length };
  });
  const breakdown = [
    { label: 'Sem dica', value: clean, color: 'var(--c-ok)' },
    { label: 'Com dica', value: total.withHint, color: 'var(--c-hint)' },
    { label: 'Tentando', value: trying, color: 'var(--c-try)' },
    { label: 'Não iniciados', value: n - total.solved - trying, color: 'var(--c-line)' },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Big label="Resolvidos" value={total.solved} sub={`de ${n} · ${Math.round((total.solved / n) * 100)}%`} icon="check" />
        <Big label="XP · nível" value={sum.xp} sub={`nível ${sum.level} · ${sum.title}`} icon="bolt" />
        <Big label="Streak atual" value={streak.current} sub={streak.current === 1 ? 'dia' : 'dias'} icon="fire" />
        <Big label="Melhor streak" value={streak.best} sub={streak.best === 1 ? 'dia' : 'dias'} icon="flag" />
      </section>

      <Card title="Atividade" sub="Problemas resolvidos por dia no último ano.">
        <Heatmap state={state} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card title="Ritmo" sub="Total acumulado de problemas resolvidos.">
          <Cumulative state={state} />
        </Card>
        <div className="space-y-6">
          <Card title="Como resolvi">
            <div className="flex h-3.5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={breakdown.map((b) => `${b.label}: ${b.value}`).join(', ')}>
              {breakdown.filter((b) => b.value > 0).map((b) => (
                <span key={b.label} title={`${b.label}: ${b.value}`} style={{ flexGrow: b.value, background: b.color }} className="min-w-1 first:rounded-l-full last:rounded-r-full" />
              ))}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {breakdown.map((b) => (
                <li key={b.label} className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: b.color }} />
                  <span className="text-muted">{b.label}</span>
                  <span className="ml-auto font-medium tabular-nums">{b.value}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Por dificuldade">
            <ul className="space-y-2.5">
              {byDiff.map((r) => (
                <li key={r.d} className="flex items-center gap-3 text-sm" title={`Dificuldade ${r.d}: ${r.solved} de ${r.total}`}>
                  <span className="w-14 shrink-0 text-xs text-muted">nível {r.d}</span>
                  <ProgressBar value={r.solved} total={r.total} className="!h-2.5" />
                  <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted">{r.solved}/{r.total}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card title="Por milestone" sub="O anel mostra quanto de cada milestone já foi resolvido. A cor é a da fase.">
        <div className="space-y-4">
          {trail.phases.map((ph, pi) => {
            const w = worldOf(pi);
            return (
              <div key={ph.slug} className="grid gap-x-4 gap-y-2 sm:grid-cols-[11rem_1fr] sm:items-center">
                <p className="flex items-center gap-2 text-xs text-muted">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: w.color }} />
                  Fase {pi + 1} · {w.name}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {trail.milestones.filter((m) => m.phase === pi).map((m) => {
                    const p = milestoneProgress(state, m);
                    return (
                      <li key={m.slug}>
                        <a href={milestonePath(m.slug)} title={`${m.num}. ${m.name}: ${p.solved}/${p.total}${isMastered(state, m.slug) ? ' (já domino)' : ''}`} aria-label={`${m.num}. ${m.name}: ${p.solved} de ${p.total}`} className="block rounded-full hover:opacity-80">
                          <Ring value={p.solved} total={p.total} size={40} stroke={4} color={p.done ? 'var(--c-ok)' : w.color}>
                            <span className={`text-xs font-semibold tabular-nums ${p.done ? 'text-ok' : p.solved ? 'text-fg' : 'text-faint'}`}>{m.num}</span>
                          </Ring>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Por seção do CSES">
        <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
          {sections.map((s) => {
            const r = bySection.get(s) ?? { solved: 0, total: 0 };
            return (
              <li key={s} className="min-w-0">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">{s}</span>
                  <span className="shrink-0 tabular-nums text-muted">{r.solved}/{r.total}</span>
                </div>
                <ProgressBar value={r.solved} total={r.total} className="mt-1.5" />
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl border border-line bg-surface p-5">
      <h2 className="font-semibold">{title}</h2>
      {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Big({ label, value, sub, icon }: { label: string; value: number; sub: string; icon: 'check' | 'bolt' | 'fire' | 'flag' }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-surface p-4 sm:p-5">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-faint"><Icon name={icon} size={13} /> {label}</p>
      <p className="mt-1.5 text-3xl font-semibold tabular-nums">{value}</p>
      <p className="truncate text-xs text-muted">{sub}</p>
    </div>
  );
}

const WEEKS = 53;
const CELL = 12;
const GAP = 3;
const LEFT = 26;
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const FILL = ['var(--c-surface-2)', 'color-mix(in oklab, var(--c-ok) 35%, var(--c-surface-2))', 'color-mix(in oklab, var(--c-ok) 60%, var(--c-surface-2))', 'color-mix(in oklab, var(--c-ok) 82%, var(--c-surface-2))', 'var(--c-ok)'];
const heat = (n: number) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4);

function Heatmap({ state }: { state: ProgressState }) {
  const box = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  // O dia de hoje fica à direita: no celular a rolagem começa no fim.
  useEffect(() => {
    if (box.current) box.current.scrollLeft = box.current.scrollWidth;
  }, []);
  const today = new Date();
  // Começa no domingo de (WEEKS-1) semanas atrás, como o GitHub.
  const start = addDays(today, -today.getDay() - (WEEKS - 1) * 7);
  const cells = [];
  const labels = [];
  for (let w = 0; w < WEEKS; w++) {
    const weekStart = addDays(start, w * 7);
    if (weekStart.getDate() <= 7) labels.push({ x: LEFT + w * (CELL + GAP), text: MONTHS[weekStart.getMonth()] });
    for (let d = 0; d < 7; d++) {
      const day = addDays(start, w * 7 + d);
      if (day > today) continue;
      const a = state.activity[dayKey(day)];
      const n = a?.solved ?? 0;
      const text = `${day.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}: ${n} ${n === 1 ? 'resolvido' : 'resolvidos'}`;
      cells.push(
        <rect key={`${w}-${d}`} x={LEFT + w * (CELL + GAP)} y={16 + d * (CELL + GAP)} width={CELL} height={CELL} rx={3} fill={FILL[heat(n)]} onMouseEnter={() => setHover(text)}>
          <title>{text}</title>
        </rect>,
      );
    }
  }
  const width = LEFT + WEEKS * (CELL + GAP);
  return (
    <div>
      <div ref={box} className="overflow-x-auto pb-1" onMouseLeave={() => setHover(null)}>
        <svg width={width} height={16 + 7 * (CELL + GAP)} role="img" aria-label="Heatmap de problemas resolvidos por dia" className="mx-auto block">
          {labels.map((l) => (
            <text key={`${l.x}`} x={l.x} y={10} fontSize={10} fill="var(--c-faint)">{l.text}</text>
          ))}
          {['seg', 'qua', 'sex'].map((t, i) => (
            <text key={t} x={0} y={16 + (1 + i * 2) * (CELL + GAP) + 10} fontSize={10} fill="var(--c-faint)">{t}</text>
          ))}
          {cells}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span className="tabular-nums">{hover ?? 'Passe o mouse num dia para ver o detalhe.'}</span>
        <span className="flex items-center gap-1">
          menos
          {FILL.map((f, i) => (
            <span key={i} className="size-3 rounded-[3px]" style={{ background: f }} />
          ))}
          mais
        </span>
      </div>
    </div>
  );
}

/** Linha do total acumulado de resolvidos, pelo solvedAt de cada problema. */
function Cumulative({ state }: { state: ProgressState }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hi, setHi] = useState<number | null>(null);
  const points = useMemo(() => {
    const perDay = new Map<string, number>();
    for (const p of Object.values(state.problems)) {
      if (!isSolved(p.status) || !p.solvedAt) continue;
      const k = dayKey(new Date(p.solvedAt));
      perDay.set(k, (perDay.get(k) ?? 0) + 1);
    }
    const keys = [...perDay.keys()].sort();
    if (keys.length === 0) return [];
    const [y, m, d] = keys[0].split('-').map(Number);
    const out: { date: Date; total: number }[] = [];
    let acc = 0;
    const end = new Date();
    for (let day = addDays(new Date(y, m - 1, d), -1); day <= end; day = addDays(day, 1)) {
      acc += perDay.get(dayKey(day)) ?? 0;
      out.push({ date: day, total: acc });
    }
    return out;
  }, [state]);

  const H = 290;
  const pad = { l: 34, r: 12, t: 12, b: 24 };
  if (points.length < 2)
    return <div ref={ref} className="grid h-[290px] place-items-center text-sm text-muted">Resolva o primeiro problema para a linha aparecer.</div>;

  const max = Math.max(4, points.at(-1)!.total);
  const step = max <= 8 ? 2 : max <= 20 ? 5 : max <= 50 ? 10 : max <= 100 ? 25 : max <= 200 ? 50 : 100;
  const top = Math.ceil(max / step) * step;
  const iw = Math.max(1, width - pad.l - pad.r);
  const ih = H - pad.t - pad.b;
  const x = (i: number) => pad.l + (i / (points.length - 1)) * iw;
  const y = (v: number) => pad.t + ih - (v / top) * ih;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.total).toFixed(1)}`).join(' ');
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  const h = hi === null ? null : points[hi];

  return (
    <div ref={ref} className="relative">
      {width > 0 && (
        <svg
          width={width}
          height={H}
          role="img"
          aria-label={`Total acumulado: ${points.at(-1)!.total} problemas resolvidos desde ${fmt(points[0].date)}`}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setHi(Math.max(0, Math.min(points.length - 1, Math.round(((e.clientX - r.left - pad.l) / iw) * (points.length - 1)))));
          }}
          onMouseLeave={() => setHi(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="var(--c-line)" strokeWidth="1" strokeDasharray={t === 0 ? undefined : '2 4'} />
              <text x={pad.l - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="var(--c-faint)">{t}</text>
            </g>
          ))}
          <text x={pad.l} y={H - 6} fontSize="10" fill="var(--c-faint)">{fmt(points[0].date)}</text>
          <text x={width - pad.r} y={H - 6} textAnchor="end" fontSize="10" fill="var(--c-faint)">hoje</text>
          <path d={`${line} L${x(points.length - 1).toFixed(1)},${y(0)} L${x(0)},${y(0)} Z`} fill="var(--c-ok)" opacity="0.12" />
          <path d={line} fill="none" stroke="var(--c-ok)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {h && hi !== null && (
            <g>
              <line x1={x(hi)} x2={x(hi)} y1={pad.t} y2={y(0)} stroke="var(--c-muted)" strokeWidth="1" />
              <circle cx={x(hi)} cy={y(h.total)} r="4.5" fill="var(--c-ok)" stroke="var(--c-surface)" strokeWidth="2" />
            </g>
          )}
          {!h && <circle cx={x(points.length - 1)} cy={y(points.at(-1)!.total)} r="4.5" fill="var(--c-ok)" stroke="var(--c-surface)" strokeWidth="2" />}
        </svg>
      )}
      {h && hi !== null && (
        <div className="pointer-events-none absolute top-1 rounded-lg border border-line bg-bg px-2.5 py-1.5 text-xs shadow-lg" style={x(hi) > width / 2 ? { right: width - x(hi) + 10 } : { left: x(hi) + 10 }}>
          <p className="text-muted">{fmt(h.date)}</p>
          <p className="font-semibold tabular-nums">{h.total} resolvidos</p>
        </div>
      )}
    </div>
  );
}
