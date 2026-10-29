import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Busca binária como "primeiro índice onde o predicado vira verdadeiro", com o invariante lo=F, hi=T.
const ARR = [2, 3, 5, 5, 8, 13, 13, 13, 21, 34, 34, 55, 89, 144, 233, 377];

interface Ev {
  lo: number;
  hi: number;
  mid: number | null;
  text: string;
}

function simulate(target: number): Ev[] {
  const pred = (i: number) => ARR[i] >= target;
  let lo = -1;
  let hi = ARR.length; // sentinelas: pred(-1) = falso, pred(n) = verdadeiro
  const evs: Ev[] = [{ lo, hi, mid: null, text: `Invariante: pred(lo) é falso e pred(hi) é verdadeiro. Começamos com sentinelas lo = −1 e hi = ${hi}.` }];
  while (hi - lo > 1) {
    const mid = lo + (hi - lo) / 2 | 0;
    const ok = pred(mid);
    evs.push({ lo, hi, mid, text: `mid = ${mid}: a[${mid}] = ${ARR[mid]} ${ok ? '≥' : '<'} ${target}, pred(mid) é ${ok ? 'verdadeiro → hi = mid' : 'falso → lo = mid'}.` });
    if (ok) hi = mid;
    else lo = mid;
  }
  evs.push({
    lo,
    hi,
    mid: null,
    text:
      hi === ARR.length
        ? `hi − lo = 1: acabou. hi = n, então nenhum elemento é ≥ ${target} (é o lower_bound devolvendo end()).`
        : `hi − lo = 1: acabou. hi = ${hi} é o primeiro índice com a[i] ≥ ${target}: exatamente o que lower_bound devolve.`,
  });
  return evs;
}

export default function BinarySearchViz() {
  const [target, setTarget] = useState(13);
  const evs = useMemo(() => simulate(target), [target]);
  const [step, setStep] = useState(0);
  const ev = evs[Math.min(step, evs.length - 1)];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));

  return (
    <VizFrame title="Busca binária: primeiro i com a[i] ≥ alvo" onKey={(d) => clamp(step + d)}>
      <label className="flex items-center gap-3 text-sm text-muted">
        alvo =
        <input
          type="number"
          value={target}
          onChange={(e) => {
            setTarget(Number(e.target.value));
            setStep(0);
          }}
          className="w-24 rounded-lg border border-line bg-bg px-2 py-1 font-mono text-fg outline-none focus:border-accent/60"
        />
      </label>
      <div className="mt-5 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1">
          {ARR.map((v, i) => {
            const decided = i <= ev.lo ? 'F' : i >= ev.hi ? 'T' : null;
            return (
              <div key={i} className="flex w-9 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-faint">{i}</span>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-md border font-mono text-sm ${
                    i === ev.mid ? 'border-accent bg-accent/25' : decided === 'F' ? 'border-line bg-surface-2 text-faint' : decided === 'T' ? 'border-ok/50 bg-ok/10' : 'border-line'
                  }`}
                >
                  {v}
                </span>
                <span className={`text-[11px] font-semibold ${decided === 'T' ? 'text-ok' : decided === 'F' ? 'text-faint' : 'text-transparent'}`}>{decided ?? '·'}</span>
                <span className="h-4 text-[10px] font-semibold text-accent">{i === ev.mid ? 'mid' : ''}</span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-2 font-mono text-sm text-muted">
        lo = {ev.lo}, hi = {ev.hi}
        {ev.mid !== null && `, mid = ${ev.mid}`} <span className="font-sans text-xs">(F = já sabemos que é falso, T = verdadeiro)</span>
      </p>
      <p className="mt-3 min-h-12 text-[15px]">{ev.text}</p>
      <div className="mt-3">
        <StepControls step={Math.min(step, evs.length - 1)} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
