import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Bellman-Ford estrada por estrada, rodada por rodada. Um botão acrescenta a estrada que fecha um ciclo negativo.
const N = 5;
const BASE: [number, number, number][] = [[4, 5, 1], [2, 4, 2], [3, 2, -3], [1, 2, 4], [1, 3, 5]];
const EXTRA: [number, number, number] = [5, 3, -1];
const INF = Infinity;
const show = (x: number) => (x === INF ? '∞' : String(x));

interface Ev {
  round: number;
  edge: number; // índice da estrada olhada (-1 = fora)
  improved: boolean;
  dist: number[];
  text: string;
  verdict: 'none' | 'done' | 'cycle';
}

function simulate(edges: [number, number, number][]): Ev[] {
  const dist: number[] = Array(N + 1).fill(INF);
  dist[1] = 0;
  const evs: Ev[] = [{ round: 0, edge: -1, improved: false, dist: [...dist], text: 'A cidade 1 começa com custo 0. As outras, com ∞.', verdict: 'none' }];
  for (let round = 1; round <= N; round++) {
    let changed = false;
    edges.forEach(([a, b, w], i) => {
      let text: string;
      let improved = false;
      if (dist[a] === INF) text = `Rodada ${round}, estrada ${a}→${b} (${w}): ainda não sei chegar à cidade ${a}. Pula.`;
      else if (dist[a] + w < dist[b]) {
        text = `Rodada ${round}, estrada ${a}→${b} (${w}): ${dist[a]} + (${w}) = ${dist[a] + w}, melhor que ${show(dist[b])}. Atualiza a cidade ${b}.`;
        dist[b] = dist[a] + w;
        improved = true;
        changed = true;
      } else text = `Rodada ${round}, estrada ${a}→${b} (${w}): ${dist[a]} + (${w}) = ${dist[a] + w}, que não é melhor que ${show(dist[b])}.`;
      evs.push({ round, edge: i, improved, dist: [...dist], text, verdict: 'none' });
    });
    if (!changed) {
      evs.push({ round, edge: -1, improved: false, dist: [...dist], text: `A rodada ${round} não melhorou nada: os custos são definitivos.`, verdict: 'done' });
      return evs;
    }
    if (round === N) evs.push({ round, edge: -1, improved: false, dist: [...dist], text: `A rodada ${N} (a de teste) ainda melhorou alguém. Um caminho mínimo usa no máximo ${N - 1} estradas, então isso só acontece com um ciclo de soma negativa.`, verdict: 'cycle' });
  }
  return evs;
}

export default function BellmanFordViz() {
  const [cycle, setCycle] = useState(false);
  const edges = useMemo(() => (cycle ? [...BASE, EXTRA] : BASE), [cycle]);
  const evs = useMemo(() => simulate(edges), [edges]);
  const [step, setStep] = useState(0);
  const ev = evs[Math.min(step, evs.length - 1)];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const cell = 'grid h-10 w-11 place-items-center rounded-md border font-mono text-sm';

  return (
    <VizFrame title="Bellman-Ford: todas as estradas, rodada após rodada" onKey={(d) => clamp(step + d)}>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Grafo:</span>
        {([[false, 'sem ciclo negativo'], [true, 'com a estrada 5→3 (−1)']] as const).map(([b, label]) => (
          <button
            key={label}
            type="button"
            aria-pressed={cycle === b}
            onClick={() => {
              setCycle(b);
              setStep(0);
            }}
            className={`rounded-md border px-2.5 py-1 ${cycle === b ? 'border-accent bg-accent/15 font-medium' : 'border-line text-muted hover:text-fg'}`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs tabular-nums text-muted">rodada {ev.round} de {N}</span>
      </div>
      <p className="text-xs uppercase tracking-wider text-faint">Estradas, na ordem em que são olhadas</p>
      <div className="mt-1 flex flex-wrap gap-1.5 font-mono text-sm">
        {edges.map(([a, b, w], i) => (
          <span key={i} className={`rounded-md border px-2 py-1 ${i === ev.edge ? (ev.improved ? 'border-ok bg-ok/20 font-semibold' : 'border-accent bg-accent/20') : 'border-line text-muted'}`}>
            {a}→{b} ({w})
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs uppercase tracking-wider text-faint">Menor custo conhecido até cada cidade</p>
      <div className="mt-1 flex gap-1">
        {Array.from({ length: N }, (_, k) => k + 1).map((u) => {
          const hit = ev.edge >= 0 && edges[ev.edge][1] === u && ev.improved;
          const from = ev.edge >= 0 && edges[ev.edge][0] === u;
          return (
            <div key={u} className="flex flex-col items-center gap-1">
              <span className="text-[10px] tabular-nums text-faint">cid. {u}</span>
              <span className={`${cell} ${hit ? 'border-ok bg-ok/20 font-semibold' : from ? 'border-try bg-try/15' : 'border-line'}`}>{show(ev.dist[u])}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-faint">
        <span className="text-accent">Laranja</span>: estrada olhada sem efeito. <span className="text-ok">Verde</span>: melhorou. <span className="text-try">Azul</span>: cidade de onde a estrada sai.
      </p>
      <p className={`mt-3 min-h-16 text-[15px] ${ev.verdict === 'cycle' ? 'font-medium text-danger' : ev.verdict === 'done' ? 'font-medium text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={Math.min(step, evs.length - 1)} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
