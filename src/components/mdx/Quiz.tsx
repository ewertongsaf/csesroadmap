import { useState } from 'react';
import { Inline } from './inline.tsx';

export interface QuizQuestion {
  q: string;
  /** Trecho de código mostrado entre a pergunta e as alternativas (perguntas de "simule"). */
  code?: string;
  options: string[];
  /** Índice da alternativa correta. */
  answer: number;
  /** Por que a correta é correta (e o erro comum das outras). */
  why: string;
}

export default function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const done = picked.filter((p) => p !== null).length;
  const right = picked.filter((p, i) => p === questions[i].answer).length;

  return (
    <div className="not-prose my-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Mini-quiz</p>
        <p className="text-xs tabular-nums text-muted">{done === questions.length ? `${right}/${questions.length} certas` : `${done}/${questions.length} respondidas`}</p>
      </div>
      <ol className="mt-4 space-y-6">
        {questions.map((qq, qi) => {
          const p = picked[qi];
          return (
            <li key={qi}>
              <p className="font-medium">
                {qi + 1}. <Inline text={qq.q} />
              </p>
              {qq.code && (
                <pre className="mt-2.5 overflow-x-auto rounded-lg border border-line bg-bg p-3 font-mono text-[12.5px] leading-relaxed">{qq.code}</pre>
              )}
              <div className="mt-2.5 grid gap-2">
                {qq.options.map((opt, oi) => {
                  const state = p === null ? 'idle' : oi === qq.answer ? 'right' : oi === p ? 'wrong' : 'off';
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={p !== null}
                      onClick={() => setPicked(picked.map((x, i) => (i === qi ? oi : x)))}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        state === 'right'
                          ? 'border-ok bg-ok/10'
                          : state === 'wrong'
                            ? 'border-danger bg-danger/10'
                            : state === 'off'
                              ? 'border-line opacity-60'
                              : 'border-line hover:border-accent/60'
                      }`}
                    >
                      <Inline text={opt} />
                    </button>
                  );
                })}
              </div>
              {p !== null && (
                <p className={`mt-2.5 text-sm ${p === qq.answer ? 'text-ok' : 'text-muted'}`}>
                  {p === qq.answer ? 'Certo. ' : 'Não. '}
                  <span className="text-muted">
                    <Inline text={qq.why} />
                  </span>
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {done > 0 && (
        <button type="button" onClick={() => setPicked(questions.map(() => null))} className="mt-5 text-xs text-muted underline hover:text-fg">
          Refazer
        </button>
      )}
    </div>
  );
}
