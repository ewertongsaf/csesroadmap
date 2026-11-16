import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Dijkstra com fila de prioridade num grafo pequeno: mostra as distâncias provisórias, os vértices
// fechados e o conteúdo da fila (inclusive as entradas velhas).
const N = 5;
const EDGES: [number, number, number][] = [[1, 2, 7], [1, 3, 2], [3, 2, 3], [2, 4, 1], [3, 4, 8], [4, 5, 2]];
const POS: Record<number, [number, number]> = { 1: [50, 95], 2: [190, 40], 3: [190, 150], 4: [330, 95], 5: [440, 95] };
const ADJ: [number, number][][] = Array.from({ length: N + 1 }, () => []);
for (const [a, b, w] of EDGES) {
  ADJ[a].push([b, w]);
  ADJ[b].push([a, w]);
}
const INF = Infinity;

interface Ev {
  cur: number; // vértice que saiu da fila (0 = nenhum)
  stale: boolean;
  dist: number[];
  closed: boolean[];
  queue: [number, number][]; // (distância, vértice), em ordem de saída
  improved: number[];
  text: string;
}

function simulate(): Ev[] {
  const dist: number[] = Array(N + 1).fill(INF);
  const closed: boolean[] = Array(N + 1).fill(false);
  let queue: [number, number][] = [];
  const sortQ = () => queue.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  const evs: Ev[] = [];
  const snap = (cur: number, stale: boolean, improved: number[], text: string) => evs.push({ cur, stale, dist: [...dist], closed: [...closed], queue: queue.map((q) => [...q] as [number, number]), improved, text });
  dist[1] = 0;
  queue.push([0, 1]);
  snap(0, false, [], 'A cidade 1 começa com tempo 0. As outras ainda não têm caminho conhecido (∞).');
  while (queue.length) {
    const [d, u] = queue.shift()!;
    if (d > dist[u]) {
      snap(u, true, [], `Sai (${d}, ${u}), mas a cidade ${u} já tem tempo ${dist[u]}, menor que ${d}. É uma entrada velha: ignora.`);
      continue;
    }
    closed[u] = true;
    const improved: number[] = [];
    const parts: string[] = [];
    for (const [v, w] of ADJ[u]) {
      if (d + w < dist[v]) {
        parts.push(`${v}: ${dist[v] === INF ? '∞' : dist[v]} → ${d + w}`);
        dist[v] = d + w;
        queue.push([dist[v], v]);
        improved.push(v);
      }
    }
    sortQ();
    snap(u, false, improved, `Sai (${d}, ${u}): o tempo ${d} da cidade ${u} é definitivo. ${parts.length ? `Melhora ${parts.join('; ')}.` : 'Nenhum vizinho melhora.'}`);
  }
  snap(0, false, [], 'A fila esvaziou: todos os tempos são definitivos.');
  return evs;
}

export default function DijkstraViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));

  return (
    <VizFrame title="Dijkstra: fechando a cidade mais próxima" onKey={(d) => clamp(step + d)}>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 490 190" className="w-full max-w-xl min-w-[430px]" role="img" aria-label="Grafo de 5 cidades com tempos nas estradas">
          {EDGES.map(([a, b, w]) => {
            const hot = !ev.stale && ev.cur !== 0 && ((a === ev.cur && ev.improved.includes(b)) || (b === ev.cur && ev.improved.includes(a)));
            const mx = (POS[a][0] + POS[b][0]) / 2;
            const my = (POS[a][1] + POS[b][1]) / 2;
            return (
              <g key={`${a}-${b}`}>
                <line x1={POS[a][0]} y1={POS[a][1]} x2={POS[b][0]} y2={POS[b][1]} stroke={hot ? 'var(--c-accent)' : 'var(--c-line)'} strokeWidth={hot ? 4 : 2} />
                <rect x={mx - 10} y={my - 10} width="20" height="20" rx="5" fill="var(--c-surface)" />
                <text x={mx} y={my + 4.5} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--c-muted)">{w}</text>
              </g>
            );
          })}
          {Array.from({ length: N }, (_, i) => i + 1).map((u) => {
            const cur = u === ev.cur;
            const d = ev.dist[u];
            return (
              <g key={u}>
                {cur && <circle cx={POS[u][0]} cy={POS[u][1]} r="24" fill="none" stroke={ev.stale ? 'var(--c-faint)' : 'var(--c-accent)'} strokeWidth="3" strokeDasharray={ev.stale ? '5 4' : undefined} />}
                <circle cx={POS[u][0]} cy={POS[u][1]} r="18" fill={ev.closed[u] ? 'var(--c-ok)' : 'var(--c-surface-2)'} fillOpacity={ev.closed[u] ? 0.35 : 1} stroke={ev.closed[u] ? 'var(--c-ok)' : ev.improved.includes(u) ? 'var(--c-try)' : 'var(--c-line)'} strokeWidth="2" />
                <text x={POS[u][0]} y={POS[u][1] + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--c-fg)">{u}</text>
                <text x={POS[u][0]} y={POS[u][1] + (POS[u][1] > 100 ? 38 : -26)} textAnchor="middle" fontSize="12" fontWeight="600" fill={ev.improved.includes(u) ? 'var(--c-try)' : 'var(--c-muted)'}>
                  {d === INF ? '∞' : d}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-3 text-xs uppercase tracking-wider text-faint">Fila de prioridade (tempo, cidade): a da esquerda sai primeiro</p>
      <p className="mt-1 min-h-7 font-mono text-sm">
        {ev.queue.length
          ? ev.queue.map(([d, u], i) => (
              <span key={i} className={`mr-2 ${d > ev.dist[u] ? 'text-faint line-through' : ''}`}>({d},{u})</span>
            ))
          : '(vazia)'}
      </p>
      <p className="mt-2 text-xs text-faint">
        O número ao lado de cada cidade é o melhor tempo conhecido. <span className="text-ok">Verde</span>: tempo definitivo. <span className="text-try">Azul</span>: melhorou neste passo. Riscado na fila: entrada velha.
      </p>
      <p className="mt-3 min-h-12 text-[15px]">{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
