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
