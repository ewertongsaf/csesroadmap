import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// A tabela da escada sendo preenchida: contagem de caminhos ("formas") ou menor custo ("custo").
type Mode = 'formas' | 'custo';
const COST = [0, 3, 9, 3, 4, 6, 8];
const N: Record<Mode, number> = { formas: 8, custo: 6 };

interface Ev {
  i: number; // casa sendo calculada (-1 = só os casos base)
  from: number[]; // casas lidas
  pick: number | null; // casa escolhida pelo min (modo custo)
  table: (number | null)[];
  text: string;
}

function simulate(mode: Mode): Ev[] {
  const n = N[mode];
  const t: (number | null)[] = Array(n + 1).fill(null);
  const evs: Ev[] = [];
  if (mode === 'formas') {
    t[0] = 1;
    t[1] = 1;
    evs.push({ i: -1, from: [], pick: null, table: [...t], text: 'Casos base: há 1 forma de estar no degrau 0 e 1 forma de chegar ao degrau 1.' });
    for (let i = 2; i <= n; i++) {
      t[i] = t[i - 1]! + t[i - 2]!;
      evs.push({ i, from: [i - 1, i - 2], pick: null, table: [...t], text: `formas[${i}] = formas[${i - 1}] + formas[${i - 2}] = ${t[i - 1]} + ${t[i - 2]} = ${t[i]}. O último passo veio do degrau ${i - 1} ou do ${i - 2}.` });
    }
  } else {
    t[0] = 0;
    evs.push({ i: -1, from: [], pick: null, table: [...t], text: 'Caso base: estar no chão (degrau 0) não custa nada.' });
    for (let i = 1; i <= n; i++) {
      const from = i >= 2 ? [i - 1, i - 2] : [i - 1];
      const pick = i >= 2 && t[i - 2]! < t[i - 1]! ? i - 2 : i - 1;
      t[i] = t[pick]! + COST[i];
      evs.push({
        i,
        from,
        pick,
        table: [...t],
        text:
          i === 1
            ? `custo[1] = custo[0] + c₁ = 0 + ${COST[1]} = ${t[1]}. Só dá para vir do chão.`
            : `custo[${i}] = min(custo[${i - 1}], custo[${i - 2}]) + c = min(${t[i - 1]}, ${t[i - 2]}) + ${COST[i]} = ${t[i]}. Melhor vir do degrau ${pick}.`,
      });
    }
  }
  return evs;
}

export default function DpStairsViz({ mode }: { mode: Mode }) {
  const evs = useMemo(() => simulate(mode), [mode]);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const n = N[mode];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const row = 'grid h-10 w-11 place-items-center rounded-md border font-mono text-sm';

  return (
    <VizFrame title={mode === 'formas' ? 'Tabela: de quantas formas chego a cada degrau' : 'Tabela: menor custo para chegar a cada degrau'} onKey={(d) => clamp(step + d)}>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1">
          {Array.from({ length: n + 1 }, (_, j) => {
            const cur = j === ev.i;
            const read = ev.from.includes(j);
            return (
              <div key={j} className="flex flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-faint">{j === 0 ? 'chão' : `deg. ${j}`}</span>
                {mode === 'custo' && <span className={`${row} border-dashed border-line text-muted`}>{j === 0 ? '–' : COST[j]}</span>}
                <span className={`${row} ${cur ? 'border-accent bg-accent/25 font-semibold' : read ? (ev.pick === null || ev.pick === j ? 'border-try bg-try/15' : 'border-line bg-surface-2 text-muted') : 'border-line'}`}>
                  {ev.table[j] ?? ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-xs text-faint">
        {mode === 'custo' ? 'Linha de cima (tracejada): pedágio de cada degrau. Linha de baixo: a tabela custo.' : 'Cada casa é a soma das duas à esquerda.'}{' '}
        <span className="text-accent">Laranja</span>: casa calculada agora. <span className="text-try">Azul</span>: casa lida.
      </p>
      <p className="mt-3 min-h-12 text-[15px]">{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
