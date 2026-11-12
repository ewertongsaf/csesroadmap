import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// DFS contando grupos num grafo pequeno: mostra o vértice atual, a pilha de chamadas e os grupos já fechados.
const N = 8;
const EDGES: [number, number][] = [[1, 2], [1, 3], [2, 4], [3, 4], [5, 6], [6, 7]];
const POS: Record<number, [number, number]> = { 1: [50, 40], 2: [150, 40], 3: [50, 130], 4: [150, 130], 5: [250, 40], 6: [330, 85], 7: [250, 130], 8: [420, 85] };
const ADJ: number[][] = Array.from({ length: N + 1 }, () => []);
for (const [a, b] of EDGES) {
  ADJ[a].push(b);
  ADJ[b].push(a);
}
// Cores dos grupos: enfeite; o número do grupo também aparece no texto.
const GROUP = ['var(--c-try)', 'var(--c-hint)', 'var(--c-ok)'];

interface Ev {
  cur: number; // vértice da chamada no topo (0 = fora da DFS)
  edge: [number, number] | null; // aresta sendo olhada
  group: number[]; // grupo de cada vértice (0 = não visitado)
  stack: number[];
  groups: number;
  biggest: number;
  text: string;
}

function simulate(): Ev[] {
  const group: number[] = Array(N + 1).fill(0);
  const stack: number[] = [];
  const evs: Ev[] = [];
  let groups = 0;
  let biggest = 0;
  const snap = (cur: number, edge: [number, number] | null, text: string) => evs.push({ cur, edge, group: [...group], stack: [...stack], groups, biggest, text });
  snap(0, null, 'Ninguém foi visitado. O laço principal vai tentar começar uma DFS em cada pessoa, de 1 a 8.');
  const dfs = (u: number): number => {
    group[u] = groups;
    stack.push(u);
    snap(u, null, `dfs(${u}): marca ${u} como visitado. Vizinhos de ${u}: ${ADJ[u].length ? ADJ[u].join(', ') : 'nenhum'}.`);
    let size = 1;
    for (const v of ADJ[u]) {
      if (group[v] === 0) {
        snap(u, [u, v], `${u} olha o vizinho ${v}: ainda não visitado. Chama dfs(${v}).`);
        size += dfs(v);
        snap(u, null, `De volta a dfs(${u}), que continua olhando os vizinhos.`);
      } else snap(u, [u, v], `${u} olha o vizinho ${v}: já visitado. Não faz nada.`);
    }
    stack.pop();
    return size;
  };
  for (let u = 1; u <= N; u++) {
    if (group[u] !== 0) {
      snap(0, null, `Laço principal em ${u}: já visitado (pertence ao grupo ${group[u]}). Segue.`);
      continue;
    }
    groups++;
    const size = dfs(u);
    biggest = Math.max(biggest, size);
    snap(0, null, `A DFS que começou em ${u} terminou: o grupo ${groups} tem ${size} ${size === 1 ? 'pessoa' : 'pessoas'}.`);
  }
  snap(0, null, `Fim: ${groups} grupos, e o maior tem ${biggest} pessoas.`);
  return evs;
}

export default function GraphDfsViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const isEdge = (a: number, b: number) => ev.edge !== null && ((ev.edge[0] === a && ev.edge[1] === b) || (ev.edge[0] === b && ev.edge[1] === a));

  return (
    <VizFrame title="DFS contando os grupos de amigos" onKey={(d) => clamp(step + d)}>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 470 170" className="w-full max-w-xl min-w-[420px]" role="img" aria-label="Grafo de 8 pessoas com 6 amizades">
          {EDGES.map(([a, b]) => (
            <line key={`${a}-${b}`} x1={POS[a][0]} y1={POS[a][1]} x2={POS[b][0]} y2={POS[b][1]} stroke={isEdge(a, b) ? 'var(--c-accent)' : 'var(--c-line)'} strokeWidth={isEdge(a, b) ? 4 : 2} />
          ))}
          {Array.from({ length: N }, (_, k) => k + 1).map((u) => {
            const g = ev.group[u];
            const cur = u === ev.cur;
            const onStack = ev.stack.includes(u);
            return (
              <g key={u}>
                {cur && <circle cx={POS[u][0]} cy={POS[u][1]} r="23" fill="none" stroke="var(--c-accent)" strokeWidth="3" />}
                <circle cx={POS[u][0]} cy={POS[u][1]} r="17" fill={g ? GROUP[g - 1] : 'var(--c-surface-2)'} fillOpacity={g ? (onStack ? 0.95 : 0.45) : 1} stroke={g ? GROUP[g - 1] : 'var(--c-line)'} strokeWidth="2" />
                <text x={POS[u][0]} y={POS[u][1] + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--c-fg)">{u}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 grid gap-4 text-sm sm:grid-cols-3">
        <div className="sm:col-span-2">
          <p className="text-xs uppercase tracking-wider text-faint">Pilha de chamadas (a de cima é a que está rodando)</p>
          <p className="mt-1 min-h-7 font-mono">{ev.stack.length ? ev.stack.map((u) => `dfs(${u})`).join(' → ') : '(vazia)'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-faint">Grupos · maior</p>
          <p className="mt-1 font-mono">{ev.groups} · {ev.biggest}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-faint">
        Anel <span className="text-accent">laranja</span>: vértice da chamada atual. Cor cheia: ainda na pilha. Cor clara: chamada já terminou. Cinza: não visitado.
      </p>
      <p className="mt-3 min-h-12 text-[15px]">{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
