import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Ordenação topológica pela fila (Kahn) com os tempos de início e fim de cada tarefa.
const N = 6;
const DUR = [0, 3, 2, 4, 1, 2, 3];
const EDGES: [number, number][] = [[1, 3], [2, 3], [2, 4], [3, 5], [4, 5], [4, 6]];
const POS: Record<number, [number, number]> = { 1: [55, 45], 2: [55, 150], 3: [205, 45], 4: [205, 150], 5: [355, 45], 6: [355, 150] };

interface Ev {
  cur: number;
  left: number[]; // dependências que faltam
  done: boolean[];
  start: number[];
  end: (number | null)[];
  queue: number[];
  order: number[];
  hot: number[]; // sucessores tocados neste passo
  text: string;
}

function simulate(): Ev[] {
  const adj: number[][] = Array.from({ length: N + 1 }, () => []);
  const left: number[] = Array(N + 1).fill(0);
  for (const [a, b] of EDGES) {
    adj[a].push(b);
    left[b]++;
  }
  const done: boolean[] = Array(N + 1).fill(false);
  const start: number[] = Array(N + 1).fill(0);
  const end: (number | null)[] = Array(N + 1).fill(null);
  const queue: number[] = [];
  const order: number[] = [];
  const evs: Ev[] = [];
  const snap = (cur: number, hot: number[], text: string) => evs.push({ cur, left: [...left], done: [...done], start: [...start], end: [...end], queue: [...queue], order: [...order], hot, text });
  for (let u = 1; u <= N; u++) if (left[u] === 0) queue.push(u);
  snap(0, [], `As tarefas ${queue.join(' e ')} não dependem de ninguém: entram na fila e podem começar no instante 0.`);
  while (queue.length) {
    const u = queue.shift()!;
    done[u] = true;
    order.push(u);
    end[u] = start[u] + DUR[u];
    const freed: number[] = [];
    for (const v of adj[u]) {
      start[v] = Math.max(start[v], end[u]!);
      if (--left[v] === 0) {
        queue.push(v);
        freed.push(v);
      }
    }
    snap(u, adj[u], `Tarefa ${u}: começa em ${start[u]}, dura ${DUR[u]}, termina em ${end[u]}. ${adj[u].length ? `Avisa ${adj[u].join(' e ')}` : 'Ninguém depende dela'}${freed.length ? `; ${freed.join(' e ')} ${freed.length > 1 ? 'ficam liberadas' : 'fica liberada'}.` : '.'}`);
  }
  snap(0, [], `Todas as ${N} tarefas foram feitas. A última termina no instante ${Math.max(...(end.filter((x) => x !== null) as number[]))}.`);
  return evs;
}

export default function TopoViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));

  return (
    <VizFrame title="Fazendo as tarefas na ordem das dependências" onKey={(d) => clamp(step + d)}>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 420 200" className="w-full max-w-xl min-w-[400px]" role="img" aria-label="Seis tarefas e suas dependências">
          <defs>
            <marker id="topo-seta" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" fill="var(--c-faint)" />
            </marker>
          </defs>
          {EDGES.map(([a, b]) => {
            const [x1, y1] = POS[a];
            const [x2, y2] = POS[b];
            const len = Math.hypot(x2 - x1, y2 - y1);
            const ux = (x2 - x1) / len;
            const uy = (y2 - y1) / len;
            const hot = a === ev.cur;
            return <line key={`${a}-${b}`} x1={x1 + ux * 22} y1={y1 + uy * 22} x2={x2 - ux * 24} y2={y2 - uy * 24} stroke={hot ? 'var(--c-accent)' : 'var(--c-line)'} strokeWidth={hot ? 3.5 : 2} markerEnd="url(#topo-seta)" />;
          })}
          {Array.from({ length: N }, (_, k) => k + 1).map((u) => {
            const [x, y] = POS[u];
            const cur = u === ev.cur;
            const inQueue = ev.queue.includes(u);
            return (
              <g key={u}>
                {cur && <circle cx={x} cy={y} r="25" fill="none" stroke="var(--c-accent)" strokeWidth="3" />}
                <circle cx={x} cy={y} r="19" fill={ev.done[u] ? 'var(--c-ok)' : inQueue ? 'var(--c-try)' : 'var(--c-surface-2)'} fillOpacity={ev.done[u] ? 0.35 : inQueue ? 0.25 : 1} stroke={ev.done[u] ? 'var(--c-ok)' : inQueue ? 'var(--c-try)' : 'var(--c-line)'} strokeWidth="2" />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--c-fg)">{u}</text>
                <text x={x} y={y - 27} textAnchor="middle" fontSize="11" fill="var(--c-muted)">
                  {ev.done[u] ? `${ev.start[u]} → ${ev.end[u]}` : `dura ${DUR[u]} · faltam ${ev.left[u]}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-faint">Fila (liberadas, esperando a vez)</p>
          <p className="mt-1 min-h-7 font-mono">{ev.queue.length ? ev.queue.join('  ') : '(vazia)'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-faint">Ordem em que foram feitas</p>
          <p className="mt-1 min-h-7 font-mono">{ev.order.length ? ev.order.join('  ') : '(nenhuma)'}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-faint">
        A seta a → b quer dizer "a antes de b". <span className="text-try">Azul</span>: liberada, na fila. <span className="text-ok">Verde</span>: feita, com início → fim. Cinza: ainda faltam dependências.
      </p>
      <p className="mt-3 min-h-12 text-[15px]">{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
