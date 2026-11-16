import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Kruskal: os trechos em ordem de custo, cada um aceito (liga dois grupos) ou recusado (fecharia um ciclo).
const N = 5;
const EDGES: [number, number, number][] = [[2, 3, 1], [1, 3, 2], [4, 5, 3], [1, 2, 4], [2, 4, 5], [3, 4, 8], [3, 5, 10]]; // já em ordem de custo
const POS: Record<number, [number, number]> = { 1: [60, 45], 2: [200, 45], 3: [130, 150], 4: [330, 60], 5: [400, 155] };
const GROUP = ['var(--c-try)', 'var(--c-hint)', 'var(--c-ok)', 'var(--c-accent)', 'var(--c-danger)'];

interface Ev {
  edge: number; // trecho olhado (-1 = início ou fim)
  status: ('pending' | 'in' | 'out')[];
  comp: number[]; // grupo de cada bairro
  total: number;
  text: string;
}

function simulate(): Ev[] {
  const comp = Array.from({ length: N + 1 }, (_, i) => i);
  const status: Ev['status'] = EDGES.map(() => 'pending');
  let total = 0;
  let used = 0;
  const evs: Ev[] = [{ edge: -1, status: [...status], comp: [...comp], total, text: 'Cada bairro é um grupo sozinho. Os trechos estão em ordem de custo, do mais barato para o mais caro.' }];
  EDGES.forEach(([a, b, w], i) => {
    if (comp[a] !== comp[b]) {
      const from = comp[b];
      const to = comp[a];
      for (let u = 1; u <= N; u++) if (comp[u] === from) comp[u] = to;
      status[i] = 'in';
      total += w;
      used++;
      evs.push({ edge: i, status: [...status], comp: [...comp], total, text: `Trecho ${a}–${b} (custo ${w}): liga dois grupos diferentes. Entra. Total: ${total}.${used === N - 1 ? ' Com 4 trechos, os 5 bairros já estão ligados.' : ''}` });
    } else {
      status[i] = 'out';
      evs.push({ edge: i, status: [...status], comp: [...comp], total, text: `Trecho ${a}–${b} (custo ${w}): os dois bairros já estão no mesmo grupo. Fecharia um ciclo. Fica de fora.` });
    }
  });
  evs.push({ edge: -1, status: [...status], comp: [...comp], total, text: `Fim: 4 trechos escolhidos, custo total ${total}.` });
  return evs;
}

export default function KruskalViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));

  return (
    <VizFrame title="Kruskal: do trecho mais barato ao mais caro" onKey={(d) => clamp(step + d)}>
      <div className="mb-3 flex flex-wrap gap-1.5 font-mono text-xs">
        {EDGES.map(([a, b, w], i) => (
          <span
            key={i}
            className={`rounded-md border px-2 py-1 ${i === ev.edge ? 'border-accent bg-accent/20 font-semibold' : ev.status[i] === 'in' ? 'border-ok/60 text-ok' : ev.status[i] === 'out' ? 'border-line text-faint line-through' : 'border-line text-muted'}`}
          >
            {a}–{b} ({w})
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 460 200" className="w-full max-w-xl min-w-[400px]" role="img" aria-label="Cinco bairros e sete trechos possíveis, com custos">
          {EDGES.map(([a, b, w], i) => {
            const st = ev.status[i];
            const cur = i === ev.edge;
            const mx = (POS[a][0] + POS[b][0]) / 2;
            const my = (POS[a][1] + POS[b][1]) / 2;
            return (
              <g key={i} opacity={st === 'out' && !cur ? 0.35 : 1}>
                <line x1={POS[a][0]} y1={POS[a][1]} x2={POS[b][0]} y2={POS[b][1]} stroke={cur ? 'var(--c-accent)' : st === 'in' ? 'var(--c-ok)' : 'var(--c-line)'} strokeWidth={cur || st === 'in' ? 4 : 2} strokeDasharray={st === 'out' ? '5 5' : undefined} />
                <rect x={mx - 11} y={my - 10} width="22" height="20" rx="5" fill="var(--c-surface)" />
                <text x={mx} y={my + 4.5} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--c-muted)">{w}</text>
              </g>
            );
          })}
          {Array.from({ length: N }, (_, k) => k + 1).map((u) => (
            <g key={u}>
              <circle cx={POS[u][0]} cy={POS[u][1]} r="18" fill={GROUP[ev.comp[u] - 1]} fillOpacity="0.3" stroke={GROUP[ev.comp[u] - 1]} strokeWidth="2.5" />
              <text x={POS[u][0]} y={POS[u][1] + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--c-fg)">{u}</text>
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-2 text-xs text-faint">
        Bairros da mesma cor estão no mesmo grupo. <span className="text-ok">Verde</span>: trecho escolhido. Tracejado: recusado. <span className="text-accent">Laranja</span>: trecho sendo decidido.
        <span className="ml-2 font-semibold tabular-nums text-fg">Custo até agora: {ev.total}</span>
      </p>
      <p className="mt-3 min-h-12 text-[15px]">{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
