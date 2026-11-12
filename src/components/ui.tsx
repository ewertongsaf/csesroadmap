// Peças visuais pequenas, usadas tanto estáticas (Astro) quanto dentro de ilhas.
import type { Status } from '../lib/progress/types.ts';
import { STATUS_LABEL } from '../lib/progress/types.ts';

export function DifficultyDots({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`Dificuldade ${value}/5`} aria-label={`Dificuldade ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`size-1.5 rounded-full ${i <= value ? 'bg-accent' : 'bg-line'}`} />
      ))}
    </span>
  );
}

const STATUS_STYLE: Record<Status, string> = {
  not_started: 'border-faint/60',
  trying: 'border-try bg-try/25',
  solved: 'border-ok bg-ok',
  solved_with_hint: 'border-hint bg-hint',
};

/** `decorative`: dentro de um controle que já tem o rótulo em texto (não repete o nome para leitores de tela). */
export function StatusDot({ status, mastered = false, decorative = false }: { status: Status; mastered?: boolean; decorative?: boolean }) {
  const a11y = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': mastered && status === 'not_started' ? 'Milestone dominado' : STATUS_LABEL[status] };
  if (mastered && status === 'not_started')
    return <span className="inline-block size-3 shrink-0 rounded-full border-2 border-dashed border-muted" title={decorative ? undefined : 'Milestone dominado'} {...a11y} />;
  return <span className={`inline-block size-3 shrink-0 rounded-full border-2 ${STATUS_STYLE[status]}`} title={decorative ? undefined : STATUS_LABEL[status]} {...a11y} />;
}

export function ProgressBar({ value, total, className = '' }: { value: number; total: number; className?: string }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-surface-2 ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={total}>
      <div className="h-full rounded-full bg-ok transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`inline-block animate-pulse rounded bg-surface-2 ${className}`} />;
}

/** Anel de progresso. `children` vai no centro (número do milestone, porcentagem…). */
export function Ring({ value, total, size = 44, stroke = 4, color = 'var(--c-ok)', children, label }: { value: number; total: number; size?: number; stroke?: number; color?: string; children?: React.ReactNode; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = total === 0 ? 0 : Math.min(1, value / total);
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} role={label ? 'img' : undefined} aria-label={label}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--c-surface-2)" strokeWidth={stroke} />
        {frac > 0 && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * frac} ${c}`} className="transition-[stroke-dasharray] duration-700" />}
      </svg>
      <span className="absolute inset-0 grid place-items-center">{children}</span>
    </span>
  );
}

export function Stars({ value, className = '' }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex tracking-wider ${className}`} role="img" aria-label={`${value} de 3 estrelas`}>
      {[1, 2, 3].map((k) => (
        <span key={k} aria-hidden="true" className={k <= value ? 'text-accent' : 'text-line'}>★</span>
      ))}
    </span>
  );
}

const ICONS = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9.5 20v-6h5v6',
  map: 'M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4L15 6.5 9 4zM9 4v13.5M15 6.5V20',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  chart: 'M4 20V10M10 20V4M16 20v-7M21 20H3',
  check: 'M4 12.5 9.5 18 20 6.5',
  code: 'm8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16',
  gear: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z',
  user: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM4 21a8 8 0 0 1 16 0',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  fire: 'M12 3c1 3.5 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .5 2 1.5 2.5 2 2.5C11 9 10.5 6 12 3z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  bolt: 'M13 3 5 14h6l-1 7 8-11h-6l1-7z',
  list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
} as const;
export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 16, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}
