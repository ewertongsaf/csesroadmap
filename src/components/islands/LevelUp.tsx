// Comemoração de subida de nível. Fica no layout: o nível sobe onde o problema é marcado como
// resolvido (página do problema, milestone, checkpoint), não só na /jornada.
// O último nível comemorado fica em localStorage; a primeira visita só registra, sem comemorar.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProgress } from '../../lib/progress/react.ts';
import { GEAR, gearAt, levelInfo, titleFor, totalXpFromTable, type XpTable } from '../../lib/journey.ts';
import { playLevelUp } from '../../lib/sound.ts';
import { HeroPortrait } from '../journey/Hero.tsx';

const KEY = 'cses-roadmap:level';
/** Disparado na janela quando a comemoração fecha; a /jornada usa para a personagem pular no mapa. */
export const LEVEL_UP_EVENT = 'cses:levelup';

const readLevel = () => {
  try {
    const n = Number(localStorage.getItem(KEY));
    return Number.isInteger(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
};
const writeLevel = (n: number) => {
  try {
    localStorage.setItem(KEY, String(n));
  } catch {}
};

const COLORS = ['var(--c-accent)', 'var(--c-ok)', 'var(--c-try)', 'var(--c-hint)', 'var(--c-danger)'];
const PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2 + (i % 3) * 0.21;
  const dist = 130 + ((i * 53) % 110);
  return {
    dx: `${Math.round(Math.cos(angle) * dist)}px`,
    dy: `${Math.round(Math.sin(angle) * dist - 30)}px`,
    rot: `${(i * 97) % 540}deg`,
    delay: `${(i % 5) * 0.03}s`,
    color: COLORS[i % COLORS.length],
    round: i % 2 === 0,
  };
});

export default function LevelUp({ table }: { table: XpTable }) {
  const { state, ready } = useProgress();
  const level = useMemo(() => levelInfo(totalXpFromTable(table, state)).level, [table, state]);
  const [shown, setShown] = useState<{ level: number; gear: string | null } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const known = useRef<number | null>(null);

  useEffect(() => {
    if (!ready) return;
    const prev = known.current ?? readLevel();
    known.current = level;
    writeLevel(level);
    if (prev === null || level <= prev) return;
    const gear = GEAR.find((g) => g.level > prev && g.level <= level)?.name ?? null;
    setLeaving(false);
    setShown({ level, gear });
    void playLevelUp(gear !== null);
  }, [ready, level]);

  const close = useCallback(() => {
    setLeaving(true);
    setTimeout(() => {
      setShown(null);
      window.dispatchEvent(new CustomEvent(LEVEL_UP_EVENT));
    }, 280);
  }, []);

  useEffect(() => {
    if (!shown) return;
    const id = setTimeout(close, 5200);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [shown, close]);

  if (!shown) return null;
  return (
    <div
      role="status"
      onClick={close}
      className={`lv-overlay fixed inset-0 z-50 grid cursor-pointer place-items-center bg-bg/70 p-4 backdrop-blur-sm ${leaving ? 'lv-out' : ''}`}
    >
      <div className="lv-card relative w-full max-w-sm rounded-3xl border border-accent/60 bg-surface px-6 py-8 text-center shadow-2xl">
        <div className="pointer-events-none absolute top-[104px] left-1/2 size-0" aria-hidden="true">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className={`lv-particle absolute block size-2.5 ${p.round ? 'rounded-full' : 'rounded-[2px]'}`}
              style={{ background: p.color, '--dx': p.dx, '--dy': p.dy, '--rot': p.rot, '--delay': p.delay } as React.CSSProperties}
            />
          ))}
        </div>
        <div className="relative mx-auto grid size-36 place-items-center">
          <div className="lv-rays absolute inset-0 rounded-full" aria-hidden="true" />
          <HeroPortrait gear={gearAt(shown.level)} className="relative h-28" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Subiu de nível</p>
        <p className="lv-number mt-1 text-5xl font-semibold tracking-tight tabular-nums">Nível {shown.level}</p>
        <p className="mt-2 text-sm text-muted">{titleFor(shown.level)}</p>
        {shown.gear && (
          <p className="lv-gear mt-4 inline-block rounded-full bg-accent/15 px-3.5 py-1.5 text-sm font-medium text-accent">
            Novo equipamento: {shown.gear}
          </p>
        )}
        <p className="mt-5 text-xs text-faint">Clique ou Esc para continuar</p>
      </div>
    </div>
  );
}
