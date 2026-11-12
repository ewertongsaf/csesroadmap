import { useEffect, useMemo, useState } from 'react';
import { Marked } from 'marked';
import { useProgress } from '../../lib/progress/react.ts';
import { statusOf } from '../../lib/progress/selectors.ts';
import { setCode, setNotes, setStatus } from '../../lib/progress/store.ts';
import { STATUS_LABEL, isSolved, type Status } from '../../lib/progress/types.ts';
import { problemXp } from '../../lib/journey.ts';
import { problemPath } from '../../lib/trail.ts';
import { StatusDot } from '../ui.tsx';

// Notas podem vir de um JSON importado: HTML cru vira texto, nunca é interpretado.
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const notesMd = new Marked({ gfm: true, breaks: true });
notesMd.use({ renderer: { html: ({ text }) => escapeHtml(text) } });

const ORDER: Status[] = ['not_started', 'trying', 'solved', 'solved_with_hint'];

const ACTIVE: Record<Status, string> = {
  not_started: 'border-fg/40 bg-surface-2 text-fg',
  trying: 'border-try bg-try/15 text-fg',
  solved: 'border-ok bg-ok/15 text-fg',
  solved_with_hint: 'border-hint bg-hint/15 text-fg',
};

export function StatusPicker({ id, difficulty, nextHref, nextTitle }: { id: number; difficulty: number; nextHref?: string; nextTitle?: string }) {
  const { state, ready } = useProgress();
  const status = statusOf(state, id);
  const hints = state.problems[id]?.hintsRevealed ?? 0;
  const [forced, setForced] = useState(false);
  const [gain, setGain] = useState<number | null>(null);

  useEffect(() => {
    if (gain === null) return;
    const t = setTimeout(() => setGain(null), 1700);
    return () => clearTimeout(t);
  }, [gain]);

  const choose = (s: Status) => {
    // Revelou dica? "Resolvido" vira "resolvido com dica", a menos que você corrija explicitamente.
    setForced(false);
    const final = s === 'solved' && hints > 0 ? 'solved_with_hint' : s;
    if (isSolved(final) && !isSolved(status)) setGain(problemXp(difficulty, final === 'solved_with_hint'));
    setStatus(id, final);
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Como está este problema?</p>
        <p className="relative text-xs tabular-nums text-muted">
          vale <span className="font-semibold text-accent">+{problemXp(difficulty, false)} XP</span>
          <span className="text-faint"> ({problemXp(difficulty, true)} com dica)</span>
          {gain !== null && (
            <span role="status" className="xp-pop pointer-events-none absolute -top-8 right-0 rounded-full bg-accent px-3 py-1 text-sm font-semibold whitespace-nowrap text-accent-fg shadow-lg">
              +{gain} XP
            </span>
          )}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Status">
        {ORDER.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={ready && status === s}
            disabled={!ready}
            onClick={() => choose(s)}
            className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-sm whitespace-nowrap transition-colors sm:text-[13px] ${
              ready && status === s ? `${ACTIVE[s]} font-medium` : 'border-line text-muted hover:bg-surface-2 hover:text-fg'
            }`}
          >
            <StatusDot status={s} decorative />
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      {ready && status === 'solved_with_hint' && hints > 0 && !forced && (
        <p className="mt-3 text-xs text-muted">
          Marcado como "com dica" porque você revelou {hints} {hints === 1 ? 'dica' : 'dicas'}.{' '}
          <button
            type="button"
            className="underline hover:text-fg"
            onClick={() => {
              setForced(true);
              setStatus(id, 'solved');
            }}
          >
            Resolvi sem usar a dica
          </button>
        </p>
      )}
      {ready && isSolved(status) && nextHref && (
        <a href={nextHref} className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-ok/10 px-3.5 py-2.5 text-sm hover:bg-ok/15">
          <span className="min-w-0 truncate">Resolvido. Próximo da trilha: <span className="font-medium">{nextTitle}</span></span>
          <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );
}

/** Tirinha com todos os problemas do milestone: mostra onde este está e o status dos vizinhos. */
export function MilestoneStrip({ current, items }: { current: number; items: { id: number; title: string }[] }) {
  const { state, ready } = useProgress();
  const color: Record<Status, string> = { not_started: 'bg-line', trying: 'bg-try', solved: 'bg-ok', solved_with_hint: 'bg-hint' };
  return (
    <ol className="flex flex-wrap gap-1" aria-label="Problemas deste milestone">
      {items.map((it, i) => {
        const st = ready ? statusOf(state, it.id) : 'not_started';
        const here = it.id === current;
        return (
          <li key={it.id}>
            <a
              href={problemPath(it.id)}
              title={`${i + 1}. ${it.title} (${STATUS_LABEL[st]})`}
              aria-label={`${i + 1}. ${it.title}: ${STATUS_LABEL[st]}`}
              aria-current={here ? 'page' : undefined}
              className={`block h-2.5 rounded-full transition-all hover:opacity-80 ${color[st]} ${here ? 'w-7 ring-2 ring-fg/70 ring-offset-2 ring-offset-bg' : 'w-4'}`}
            />
          </li>
        );
      })}
    </ol>
  );
}

export function NotesAndCode({ id }: { id: number }) {
  const { state, ready } = useProgress();
  const p = state.problems[id];
  const notes = p?.notes ?? '';
  const code = p?.code ?? '';
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => (preview ? notesMd.parse(notes, { async: false }) : ''), [preview, notes]);

  const onCodeKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const t = e.currentTarget;
    const { selectionStart: a, selectionEnd: b } = t;
    setCode(id, `${code.slice(0, a)}    ${code.slice(b)}`);
    requestAnimationFrame(() => t.setSelectionRange(a + 4, a + 4));
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Notas</h2>
          <div className="flex rounded-md border border-line p-0.5 text-xs">
            {['Editar', 'Visualizar'].map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setPreview(i === 1)}
                className={`rounded px-2 py-1 ${preview === (i === 1) ? 'bg-surface-2 text-fg' : 'text-muted'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {preview ? (
          <div
            className="prose-cp mt-3 min-h-32 rounded-lg border border-line bg-surface p-4 text-sm"
            dangerouslySetInnerHTML={{ __html: html || '<p class="text-faint">Sem notas ainda.</p>' }}
          />
        ) : (
          <textarea
            value={notes}
            disabled={!ready}
            onChange={(e) => setNotes(id, e.target.value)}
            placeholder="Observações, a ideia que destravou, o que errou… (markdown)"
            className="mt-3 min-h-32 w-full resize-y rounded-lg border border-line bg-surface p-3 text-sm outline-none focus:border-accent/60"
          />
        )}
      </section>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Meu código</h2>
          <button
            type="button"
            disabled={!code}
            onClick={async () => {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="rounded-md border border-line px-2 py-1 text-xs text-muted hover:text-fg disabled:opacity-40"
          >
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <textarea
          value={code}
          disabled={!ready}
          spellCheck={false}
          onKeyDown={onCodeKey}
          onChange={(e) => setCode(id, e.target.value)}
          placeholder="Cole aqui sua solução aceita."
          className="mt-3 min-h-56 w-full resize-y rounded-lg border border-line bg-surface p-3 font-mono text-[13px] leading-relaxed outline-none focus:border-accent/60"
        />
      </section>
    </div>
  );
}
