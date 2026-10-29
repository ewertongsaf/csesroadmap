import { useMemo, useState } from 'react';
import { Marked } from 'marked';
import { useProgress } from '../../lib/progress/react.ts';
import { statusOf } from '../../lib/progress/selectors.ts';
import { setCode, setNotes, setStatus } from '../../lib/progress/store.ts';
import { STATUS_LABEL, type Status } from '../../lib/progress/types.ts';
import { StatusDot } from '../ui.tsx';

// Notas podem vir de um JSON importado: HTML cru vira texto, nunca é interpretado.
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const notesMd = new Marked({ gfm: true, breaks: true });
notesMd.use({ renderer: { html: ({ text }) => escapeHtml(text) } });

const ORDER: Status[] = ['not_started', 'trying', 'solved', 'solved_with_hint'];

export function StatusPicker({ id }: { id: number }) {
  const { state, ready } = useProgress();
  const status = statusOf(state, id);
  const hints = state.problems[id]?.hintsRevealed ?? 0;
  const [forced, setForced] = useState(false);

  const choose = (s: Status) => {
    // Revelou dica? "Resolvido" vira "resolvido com dica", a menos que você corrija explicitamente.
    setForced(false);
    setStatus(id, s === 'solved' && hints > 0 ? 'solved_with_hint' : s);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Status">
        {ORDER.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={ready && status === s}
            disabled={!ready}
            onClick={() => choose(s)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              ready && status === s ? 'border-fg/40 bg-surface-2 text-fg' : 'border-line text-muted hover:text-fg'
            }`}
          >
            <StatusDot status={s} decorative />
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      {ready && status === 'solved_with_hint' && hints > 0 && !forced && (
        <p className="mt-2 text-xs text-muted">
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
    </div>
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
