import { useProgress } from '../../lib/progress/react.ts';
import { revealHint } from '../../lib/progress/store.ts';

const LEVEL = ['Observação', 'Direção', 'Ideia do algoritmo'];

/** Dicas reveladas uma por vez; quantas foram abertas fica salvo no progresso. */
export default function HintLadder({ id, hints }: { id: number; hints: string[] }) {
  const { state, ready } = useProgress();
  const revealed = Math.min(state.problems[id]?.hintsRevealed ?? 0, hints.length);

  if (hints.length === 0)
    return <p className="text-sm text-muted">As dicas deste problema ainda não foram escritas. Elas chegam junto com os módulos do milestone.</p>;

  return (
    <ol className="space-y-3">
      {hints.map((html, i) => {
        const open = ready && i < revealed;
        const isNext = ready && i === revealed;
        return (
          <li key={i} className={`rounded-xl border p-4 ${open ? 'border-line bg-surface' : 'border-dashed border-line'}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Dica {i + 1} · {LEVEL[i + (3 - hints.length)] ?? LEVEL[i]}
              </span>
              {!open && (
                <button
                  type="button"
                  disabled={!isNext}
                  onClick={() => revealHint(id, i + 1)}
                  className="rounded-md border border-line px-2.5 py-1 text-xs hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isNext ? 'Revelar' : `Revele a dica ${i} antes`}
                </button>
              )}
            </div>
            {open && <div className="prose-cp mt-2 text-[15px]" dangerouslySetInnerHTML={{ __html: html }} />}
          </li>
        );
      })}
    </ol>
  );
}
