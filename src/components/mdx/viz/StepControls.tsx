// Botões padrão das visualizações passo a passo. Setas do teclado funcionam com o foco no bloco.
export function StepControls({ step, total, onStep }: { step: number; total: number; onStep: (s: number) => void }) {
  const btn = 'rounded-md border border-line px-3 py-1.5 text-sm hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-line disabled:hover:text-inherit';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={btn} onClick={() => onStep(0)} disabled={step === 0}>
        ⟲ Início
      </button>
      <button type="button" className={btn} onClick={() => onStep(step - 1)} disabled={step === 0}>
        ← Voltar
      </button>
      <button type="button" className={`${btn} font-semibold`} onClick={() => onStep(step + 1)} disabled={step >= total - 1}>
        Próximo passo →
      </button>
      <span className="ml-auto text-xs tabular-nums text-muted">
        passo {step + 1} de {total}
      </span>
    </div>
  );
}

/** Moldura comum: título, conteúdo e teclas ←/→. */
export function VizFrame({ title, children, onKey }: { title: string; children: React.ReactNode; onKey?: (dir: -1 | 1) => void }) {
  return (
    <figure
      className="not-prose my-8 rounded-2xl border border-line bg-surface p-5 outline-none sm:p-6"
      tabIndex={onKey ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onKey) return;
        if (e.key === 'ArrowRight') onKey(1);
        if (e.key === 'ArrowLeft') onKey(-1);
      }}
    >
      <figcaption className="mb-4 text-xs font-semibold uppercase tracking-wider text-accent">{title}</figcaption>
      {children}
    </figure>
  );
}
