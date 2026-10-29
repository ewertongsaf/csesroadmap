import { useEffect, useMemo, useRef, useState } from 'react';
import { useProgress } from '../../lib/progress/react.ts';
import { statusOf } from '../../lib/progress/selectors.ts';
import { isSolved } from '../../lib/progress/types.ts';
import { score, type SearchItem } from '../../lib/search.ts';

const KIND_LABEL: Record<SearchItem['kind'], string> = {
  page: 'Página',
  milestone: 'Milestone',
  module: 'Módulo',
  problem: 'Problema',
};

export default function CommandK() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [error, setError] = useState(false);
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const { state } = useProgress();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSel(0);
    setTimeout(() => input.current?.focus(), 0);
    if (items === null)
      fetch('/search-index.json')
        .then((r) => r.json())
        .then(setItems)
        .catch(() => setError(true));
  }, [open]);

  const results = useMemo(() => {
    if (!items || !query.trim()) return [];
    return items
      .map((it) => {
        // Conceito de problema não resolvido não entra na busca: seria spoiler do tema.
        const withConcepts = it.kind !== 'problem' || isSolved(statusOf(state, it.id!));
        return { it, s: score(it, query, withConcepts) };
      })
      .filter((r): r is { it: SearchItem; s: number } => r.s !== null)
      .sort((a, b) => a.s - b.s)
      .slice(0, 12)
      .map((r) => r.it);
  }, [items, query, state]);

  const go = (it: SearchItem | undefined) => {
    if (it) window.location.href = it.href;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') go(results[sel]);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm text-muted hover:text-fg"
        aria-label="Buscar (Ctrl+K)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="hidden md:inline">Buscar</span>
        <kbd className="hidden rounded border border-line px-1 font-mono text-[10px] md:inline">Ctrl K</kbd>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 px-4 pt-[12vh]" onMouseDown={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label="Buscar"
            className="mx-auto max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              ref={input}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSel(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Problema, id, milestone, módulo ou conceito…"
              className="w-full border-b border-line bg-transparent px-4 py-3.5 text-base outline-none placeholder:text-faint"
            />
            <ul className="max-h-[50vh] overflow-y-auto p-1.5">
              {error && <li className="px-3 py-2 text-sm text-danger">Não consegui carregar o índice de busca.</li>}
              {!error && query.trim() && results.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted">Nada encontrado. Conceitos de problemas ainda não resolvidos não aparecem na busca.</li>
              )}
              {results.map((it, i) => (
                <li key={it.href + it.title}>
                  <a
                    href={it.href}
                    onMouseEnter={() => setSel(i)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${i === sel ? 'bg-surface-2' : ''}`}
                  >
                    <span className="w-16 shrink-0 text-[11px] uppercase tracking-wide text-faint">{KIND_LABEL[it.kind]}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {it.id !== undefined && <span className="mr-1.5 font-mono text-xs text-faint">{it.id}</span>}
                      {it.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted">{it.sub}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
