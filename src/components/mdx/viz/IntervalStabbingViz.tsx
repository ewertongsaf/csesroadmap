import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Greedy "furar todos os intervalos com o mínimo de pontos": ordena pelo fim e fura no fim do primeiro não furado.
const INTERVALS: [number, number][] = [
  [1, 4],
  [2, 6],
  [3, 5],
  [7, 9],
  [5, 8],
  [10, 13],
  [8, 11],
  [12, 14],
];
const MAXX = 15;

interface Ev {
  order: number[]; // índices ordenados pelo fim (vazio antes de ordenar)
  at: number | null; // posição em `order` sendo analisada
  points: number[];
  text: string;
}

function simulate(): Ev[] {
  const order = INTERVALS.map((_, i) => i).sort((a, b) => INTERVALS[a][1] - INTERVALS[b][1]);
  const evs: Ev[] = [
    { order: [], at: null, points: [], text: 'Os intervalos na ordem em que vieram. Queremos o mínimo de pontos tal que todo intervalo contenha algum ponto.' },
    { order, at: null, points: [], text: 'Passo 1: ordenar pelo FIM. Quem termina primeiro é o mais "urgente": se ninguém o furar até o fim dele, nunca mais dá.' },
  ];
  const points: number[] = [];
  order.forEach((idx, k) => {
    const [l, r] = INTERVALS[idx];
    const last = points[points.length - 1];
    if (last !== undefined && last >= l) {
      evs.push({ order, at: k, points: [...points], text: `[${l}, ${r}] já contém o ponto ${last}: nada a fazer.` });
    } else {
      points.push(r);
      evs.push({
        order,
        at: k,
        points: [...points],
        text: `[${l}, ${r}] ainda não foi furado. Furar o mais à direita possível (em ${r}) só ajuda os próximos, que terminam depois.`,
      });
    }
  });
  evs.push({ order, at: null, points, text: `Fim: ${points.length} pontos. O argumento de troca no texto prova que nenhuma solução usa menos.` });
  return evs;
}

export default function IntervalStabbingViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const rows = ev.order.length ? ev.order : INTERVALS.map((_, i) => i);
  const unit = 100 / MAXX;

  return (
    <VizFrame title="Greedy: furar intervalos com o mínimo de pontos" onKey={(d) => clamp(step + d)}>
      <div className="relative">
        {ev.points.map((x) => (
          <div key={x} className="absolute top-0 bottom-6 w-px bg-accent" style={{ left: `${x * unit}%` }}>
            <span className="absolute -top-1 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-accent" />
          </div>
        ))}
        <ul className="relative space-y-2 pt-3">
          {rows.map((idx, k) => {
            const [l, r] = INTERVALS[idx];
            const stabbed = ev.points.some((x) => l <= x && x <= r);
            const current = ev.at === k;
            return (
              <li key={idx} className="relative h-6">
                <div
                  className={`absolute h-6 rounded-md border text-center font-mono text-[11px] leading-6 transition-colors ${
                    current ? 'border-accent bg-accent/25' : stabbed ? 'border-ok/60 bg-ok/15' : 'border-line bg-surface-2'
                  }`}
                  style={{ left: `${l * unit}%`, width: `${(r - l) * unit}%` }}
                >
                  [{l}, {r}]
                </div>
              </li>
            );
          })}
        </ul>
        <div className="relative mt-2 h-6 border-t border-line">
          {Array.from({ length: MAXX + 1 }, (_, x) => (
            <span key={x} className="absolute top-1 -translate-x-1/2 text-[10px] tabular-nums text-faint" style={{ left: `${x * unit}%` }}>
              {x}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 min-h-12 text-[15px]">{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
