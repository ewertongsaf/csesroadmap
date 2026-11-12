import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// BFS num tabuleiro: a "onda" de distâncias crescendo a partir de uma ou de duas fontes, com a fila à vista.
const MAPS: Record<'uma' | 'duas', string[]> = {
  uma: ['S..#.', '.#...', '.#.#.', '...#.'],
  duas: ['S..#.', '.#...', '.#.#.', '...#S'],
};
const DL = [-1, 1, 0, 0];
const DC = [0, 0, -1, 1];

interface Ev {
  cur: [number, number] | null;
  fresh: string[]; // casas descobertas neste passo
  dist: number[][];
  queue: [number, number][];
  text: string;
}
const k = (l: number, c: number) => `${l},${c}`;

function simulate(map: string[]): Ev[] {
  const R = map.length;
  const C = map[0].length;
  const dist = map.map((r) => [...r].map(() => -1));
  const queue: [number, number][] = [];
  for (let l = 0; l < R; l++) for (let c = 0; c < C; c++) if (map[l][c] === 'S') { dist[l][c] = 0; queue.push([l, c]); }
  const snap = (cur: [number, number] | null, fresh: string[], text: string): Ev => ({ cur, fresh, dist: dist.map((r) => [...r]), queue: queue.map((q) => [...q] as [number, number]), text });
  const evs: Ev[] = [snap(null, queue.map(([l, c]) => k(l, c)), queue.length === 1 ? 'A fonte entra na fila com distância 0.' : `As ${queue.length} fontes entram na fila juntas, todas com distância 0.`)];
  while (queue.length) {
    const [l, c] = queue.shift()!;
    const fresh: string[] = [];
    for (let d = 0; d < 4; d++) {
      const nl = l + DL[d];
      const nc = c + DC[d];
      if (nl < 0 || nl >= R || nc < 0 || nc >= C || map[nl][nc] === '#' || dist[nl][nc] !== -1) continue;
      dist[nl][nc] = dist[l][c] + 1;
      queue.push([nl, nc]);
      fresh.push(k(nl, nc));
    }
    evs.push(snap([l, c], fresh, `Sai da fila a casa (${l}, ${c}), distância ${dist[l][c]}. ${fresh.length ? `Vizinhas novas: ${fresh.length}, que recebem distância ${dist[l][c] + 1} e entram no fim da fila.` : 'Nenhuma vizinha nova.'}`));
  }
  evs.push(snap(null, [], 'A fila esvaziou: toda casa alcançável tem a menor distância até a fonte mais próxima.'));
  return evs;
}

export default function BfsGridViz({ fontes = 'uma' }: { fontes?: 'uma' | 'duas' }) {
  const map = MAPS[fontes];
  const evs = useMemo(() => simulate(map), [map]);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const inQueue = new Set(ev.queue.map(([l, c]) => k(l, c)));

  return (
    <VizFrame title={fontes === 'uma' ? 'BFS no tabuleiro: a onda saindo de uma fonte' : 'BFS com duas fontes ao mesmo tempo'} onKey={(d) => clamp(step + d)}>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-max flex-col gap-1">
          {map.map((row, l) => (
            <div key={l} className="flex gap-1">
              {[...row].map((ch, c) => {
                const id = k(l, c);
                const cur = ev.cur !== null && ev.cur[0] === l && ev.cur[1] === c;
                const d = ev.dist[l][c];
                const cls =
                  ch === '#'
                    ? 'border-transparent bg-faint/45 text-muted'
                    : cur
                      ? 'border-accent bg-accent/25 font-semibold'
                      : ev.fresh.includes(id)
                        ? 'border-ok bg-ok/20 font-semibold'
                        : inQueue.has(id)
                          ? 'border-try bg-try/15'
                          : d >= 0
                            ? 'border-line bg-surface-2'
                            : 'border-line';
                return (
                  <span key={c} className={`grid h-10 w-11 place-items-center rounded-md border font-mono text-sm ${cls}`}>
                    {ch === '#' ? '#' : d >= 0 ? d : ''}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs uppercase tracking-wider text-faint">Fila (a da esquerda sai primeiro)</p>
      <p className="mt-1 min-h-7 font-mono text-sm">{ev.queue.length ? ev.queue.map(([l, c]) => `(${l},${c})`).join(' ') : '(vazia)'}</p>
      <p className="mt-2 text-xs text-faint">
        <span className="text-accent">Laranja</span>: casa que saiu da fila agora. <span className="text-ok">Verde</span>: descobertas neste passo. <span className="text-try">Azul</span>: esperando na fila. <code>#</code>: parede.
      </p>
      <p className="mt-3 min-h-12 text-[15px]">{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
