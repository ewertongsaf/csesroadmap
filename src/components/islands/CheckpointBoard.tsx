import { useState } from 'react';
import { useProgress } from '../../lib/progress/react.ts';
import { statusOf } from '../../lib/progress/selectors.ts';
import { setGuess } from '../../lib/progress/store.ts';
import { csesUrl, problemPath } from '../../lib/trail.ts';
import { StatusDot } from '../ui.tsx';

export interface CheckpointItem {
  id: number;
  title: string;
  /** Rótulos de conceito, mostrados só depois de "revelar técnica". */
  concepts: string[];
  /** De onde veio: "Inédito" ou "Revisão · milestone N". */
  origin: string;
}

export default function CheckpointBoard({ items }: { items: CheckpointItem[] }) {
  const { state, ready } = useProgress();
  const [shown, setShown] = useState<Set<number>>(new Set());

  return (
    <ol className="space-y-4">
      {items.map((it, i) => {
        const revealed = shown.has(it.id);
        const guess = state.checkpointGuesses[it.id] ?? '';
        return (
          <li key={it.id} className="rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs tabular-nums text-faint">{i + 1}</span>
              <StatusDot status={ready ? statusOf(state, it.id) : 'not_started'} />
              <a href={csesUrl(it.id)} target="_blank" rel="noreferrer" className="font-semibold hover:underline underline-offset-4">
                {it.title} ↗
              </a>
              <a href={problemPath(it.id)} className="ml-auto text-xs text-muted hover:text-fg">página do problema</a>
            </div>
            <label className="mt-4 block text-xs text-muted" htmlFor={`guess-${it.id}`}>
              Qual técnica você usaria? Escreva antes de revelar.
            </label>
            <input
              id={`guess-${it.id}`}
              value={guess}
              disabled={!ready}
              onChange={(e) => setGuess(it.id, e.target.value)}
              placeholder="ex.: busca binária na resposta + greedy"
              className="mt-1.5 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent/60"
            />
            <div className="mt-3">
              {revealed ? (
                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                  {it.concepts.map((c) => (
                    <span key={c} className="rounded-md bg-surface-2 px-2 py-0.5">{c}</span>
                  ))}
                  <span className="ml-1 text-xs text-faint">{it.origin}</span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!guess.trim()}
                  onClick={() => setShown(new Set(shown).add(it.id))}
                  className="rounded-md border border-line px-2.5 py-1 text-xs hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                  title={guess.trim() ? undefined : 'Escreva um palpite primeiro'}
                >
                  Revelar técnica
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
