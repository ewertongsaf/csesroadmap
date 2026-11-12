import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// O vetor "fim" da LIS evoluindo, com a busca binária de cada elemento. Dá para alternar entre
// "nunca cai" (upper_bound) e "estritamente crescente" (lower_bound).
const ARR = [5, 2, 2, 7, 3, 3, 8, 3];

interface Ev {
  i: number;
  pos: number;
  extended: boolean;
  fim: number[];
  text: string;
}

function simulate(strict: boolean): Ev[] {
  const fim: number[] = [];
  const evs: Ev[] = [{ i: -1, pos: -1, extended: false, fim: [], text: 'O vetor fim começa vazio.' }];
  ARR.forEach((x, i) => {
    let pos = fim.findIndex((v) => (strict ? v >= x : v > x));
    const extended = pos === -1;
    if (extended) pos = fim.length;
    const old = fim[pos];
    fim[pos] = x;
    const cond = strict ? `≥ ${x}` : `> ${x}`;
    evs.push({
      i,
      pos,
      extended,
      fim: [...fim],
      text: extended
        ? `Nota ${x}: nenhum valor de fim é ${cond}. Ela estende a maior sequência: agora existe uma de tamanho ${fim.length}.`
        : `Nota ${x}: o primeiro valor ${cond} está na posição ${pos} (era ${old}). Troca: agora há uma sequência de tamanho ${pos + 1} terminando em ${x}${old === x ? ' (nada muda)' : `, melhor que terminar em ${old}`}.`,
    });
  });
  return evs;
}

export default function LisViz() {
  const [strict, setStrict] = useState(false);
  const evs = useMemo(() => simulate(strict), [strict]);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const cell = 'grid h-10 w-10 place-items-center rounded-md border font-mono text-sm';

  return (
    <VizFrame title="O vetor fim, elemento por elemento" onKey={(d) => clamp(step + d)}>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Versão:</span>
        {([[false, 'nunca cai (upper_bound)'], [true, 'estritamente crescente (lower_bound)']] as const).map(([b, label]) => (
          <button
            key={label}
            type="button"
            aria-pressed={strict === b}
            onClick={() => {
              setStrict(b);
              setStep(0);
            }}
            className={`rounded-md border px-2.5 py-1 ${strict === b ? 'border-accent bg-accent/15 font-medium' : 'border-line text-muted hover:text-fg'}`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted">resposta final: <span className="font-semibold tabular-nums text-fg">{evs[evs.length - 1].fim.length}</span></span>
      </div>
      <p className="text-xs uppercase tracking-wider text-faint">Notas</p>
      <div className="mt-1 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1">
          {ARR.map((v, j) => (
            <span key={j} className={`${cell} ${j === ev.i ? 'border-accent bg-accent/25 font-semibold' : j < ev.i ? 'border-line text-faint' : 'border-line'}`}>{v}</span>
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs uppercase tracking-wider text-faint">fim (posição k = melhor final para tamanho k + 1)</p>
      <div className="mt-1 flex min-h-10 flex-wrap gap-1">
        {ev.fim.length === 0 && <span className="self-center text-sm text-faint">(vazio)</span>}
        {ev.fim.map((v, k) => (
          <span key={k} className={`${cell} ${k === ev.pos ? (ev.extended ? 'border-ok bg-ok/20 font-semibold' : 'border-try bg-try/15 font-semibold') : 'border-line'}`}>{v}</span>
        ))}
      </div>
      <p className="mt-2 text-xs text-faint">
        <span className="text-accent">Laranja</span>: nota sendo processada. <span className="text-ok">Verde</span>: acrescentou no fim. <span className="text-try">Azul</span>: trocou um valor.
      </p>
      <p className="mt-3 min-h-16 text-[15px]">{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
