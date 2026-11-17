import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Binary lifting: up[v][k] = ancestral 2^k passos acima. Mostra os saltos a partir de uma clareira
// e dois LCAs completos (igualar profundidades; depois saltar do maior para o menor).
const N = 12;
const EDGES: [number, number, number][] = [[1, 2, 4], [2, 3, 1], [3, 4, 3], [4, 5, 2], [5, 6, 5], [6, 7, 1], [3, 8, 2], [8, 9, 6], [5, 10, 3], [10, 11, 2], [1, 12, 7]];
const LOG = 3;
const XS: Record<number, number> = { 1: 200, 2: 200, 12: 330, 3: 200, 4: 150, 8: 300, 5: 150, 9: 300, 6: 100, 10: 230, 7: 100, 11: 230 };

type Cell = [number, number]; // [linha k, vértice]
interface Ev { a: number | null; b: number | null; salto: [number, number] | null; cells: Cell[]; text: string; done: boolean; titulo: string }

function build() {
  const g: [number, number][][] = Array.from({ length: N + 1 }, () => []);
  for (const [a, b, w] of EDGES) {
    g[a].push([b, w]);
    g[b].push([a, w]);
  }
  const prof = Array(N + 1).fill(0);
  const dist = Array(N + 1).fill(0);
  const up: number[][] = Array.from({ length: N + 1 }, () => Array(LOG).fill(1));
  const dfs = (v: number, p: number) => {
    up[v][0] = p;
    for (let k = 1; k < LOG; k++) up[v][k] = up[up[v][k - 1]][k - 1];
    for (const [u, w] of g[v]) if (u !== p) {
      prof[u] = prof[v] + 1;
      dist[u] = dist[v] + w;
      dfs(u, v);
    }
  };
  dfs(1, 1);
  return { prof, dist, up };
}

function simulate(): Ev[] {
  const { prof, dist, up } = build();
  const evs: Ev[] = [{ a: null, b: null, salto: null, cells: [], titulo: 'tabela', text: 'Cada clareira guarda seus ancestrais a 1, 2 e 4 passos acima (tabela embaixo). A raiz é pai de si mesma, então um salto que passaria dela para nela.', done: false }];
  // saltos a partir de 7
  for (let k = 0; k < LOG; k++) {
    evs.push({ a: 7, b: null, salto: [7, up[7][k]], cells: [[k, 7]], titulo: 'saltos de 7', text: `up[7][${k}] = ${up[7][k]}: subir ${1 << k} ${k ? 'passos' : 'passo'} a partir da 7 leva à ${up[7][k]}.${k > 0 ? ` Repare que é o mesmo que dar dois saltos de ${1 << (k - 1)}: da 7 para a ${up[7][k - 1]}, e da ${up[7][k - 1]} para a ${up[up[7][k - 1]][k - 1]}.` : ''}`, done: false });
  }
  const lca = (a0: number, b0: number) => {
    let a = a0;
    let b = b0;
    if (prof[a] < prof[b]) [a, b] = [b, a];
    const diff = prof[a] - prof[b];
    evs.push({ a, b, salto: null, cells: [], titulo: `LCA(${a0}, ${b0})`, text: `LCA de ${a0} e ${b0}. A ${a} está na profundidade ${prof[a]} e a ${b} na ${prof[b]}: primeiro a ${a} sobe ${diff} ${diff === 1 ? 'passo' : 'passos'} para igualar.`, done: false });
    for (let k = 0; k < LOG; k++) if ((diff >> k) & 1) {
      const o = a;
      a = up[a][k];
      evs.push({ a, b, salto: [o, a], cells: [[k, o]], titulo: `LCA(${a0}, ${b0})`, text: `${diff} em binário tem o bit ${k} ligado: salta ${1 << k} (up[${o}][${k}] = ${a}).`, done: false });
    }
    if (a === b) {
      evs.push({ a, b, salto: null, cells: [], titulo: `LCA(${a0}, ${b0})`, text: `Os dois já se encontraram: o LCA é a ${a}.`, done: true });
      return a;
    }
    for (let k = LOG - 1; k >= 0; k--) {
      const ua = up[a][k];
      const ub = up[b][k];
      if (ua !== ub) {
        const oa = a;
        const ob = b;
        a = ua;
        b = ub;
        evs.push({ a, b, salto: [oa, a], cells: [[k, oa], [k, ob]], titulo: `LCA(${a0}, ${b0})`, text: `Salto de ${1 << k}: up[${oa}][${k}] = ${ua} e up[${ob}][${k}] = ${ub} são diferentes. Os dois ainda não se encontraram, então pulam juntos.`, done: false });
      } else {
        evs.push({ a, b, salto: null, cells: [[k, a], [k, b]], titulo: `LCA(${a0}, ${b0})`, text: `Salto de ${1 << k}: up[${a}][${k}] = up[${b}][${k}] = ${ua}. Pular cairia num ancestral comum, talvez acima do mais baixo: não pula.`, done: false });
      }
    }
    const c = up[a][0];
    evs.push({ a: c, b: c, salto: null, cells: [[0, a]], titulo: `LCA(${a0}, ${b0})`, text: `Os dois pararam logo abaixo do encontro (${a} e ${b}). O LCA é o pai deles: ${c}. Distância: ${dist[a0]} + ${dist[b0]} − 2·${dist[c]} = ${dist[a0] + dist[b0] - 2 * dist[c]}.`, done: true });
    return c;
  };
  lca(9, 7);
  lca(11, 12);
  return evs;
}

export default function LiftViz() {
  const { prof, dist, up } = useMemo(build, []);
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const Y = (v: number) => 26 + prof[v] * 50;
  const hot = (k: number, v: number) => ev.cells.some(([kk, vv]) => kk === k && vv === v);

  return (
    <VizFrame title="Binary lifting: saltos de 1, 2 e 4 passos até o LCA" onKey={(d) => clamp(step + d)}>
      <p className="mb-2 font-mono text-xs text-muted">{ev.titulo}</p>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 400 352" className="mx-auto w-full min-w-[340px] max-w-md" role="img" aria-label="Árvore de doze clareiras organizada por profundidade">
          <defs>
            <marker id="lift-seta" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" fill="var(--c-accent)" />
            </marker>
          </defs>
          {EDGES.map(([a, b, w]) => (
            <g key={`${a}-${b}`}>
              <line x1={XS[a]} y1={Y(a)} x2={XS[b]} y2={Y(b)} stroke="var(--c-line)" strokeWidth="2" />
              <text x={(XS[a] + XS[b]) / 2 + 8} y={(Y(a) + Y(b)) / 2 + 4} fontSize="10" fill="var(--c-muted)">{w}</text>
            </g>
          ))}
          {ev.salto && ev.salto[0] !== ev.salto[1] && (
            <path d={`M${XS[ev.salto[0]] - 20},${Y(ev.salto[0])} C${Math.min(XS[ev.salto[0]], XS[ev.salto[1]]) - 70},${Y(ev.salto[0])} ${Math.min(XS[ev.salto[0]], XS[ev.salto[1]]) - 70},${Y(ev.salto[1])} ${XS[ev.salto[1]] - 20},${Y(ev.salto[1])}`} fill="none" stroke="var(--c-accent)" strokeWidth="2.5" markerEnd="url(#lift-seta)" />
          )}
          {Array.from({ length: N }, (_, k) => k + 1).map((v) => {
            const isA = ev.a === v;
            const isB = ev.b === v;
            return (
              <g key={v}>
                <circle cx={XS[v]} cy={Y(v)} r="15" fill="var(--c-surface)" />
                <circle cx={XS[v]} cy={Y(v)} r="15" fill={isA || isB ? 'var(--c-try)' : 'var(--c-surface-2)'} fillOpacity={isA || isB ? 0.3 : 1} stroke={isA ? 'var(--c-accent)' : isB ? 'var(--c-try)' : 'var(--c-line)'} strokeWidth={isA || isB ? 3 : 1.6} />
                <text x={XS[v]} y={Y(v) + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--c-fg)">{v}</text>
              </g>
            );
          })}
          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
            <text key={d} x="392" y={26 + d * 50 + 4} textAnchor="end" fontSize="10" fill="var(--c-faint)">prof {d}</text>
          ))}
        </svg>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[460px] table-fixed text-center font-mono text-[11px]">
          <thead>
            <tr className="text-faint">
              <th className="w-16 py-0.5 text-left font-semibold">v</th>
              {Array.from({ length: N }, (_, k) => <th key={k} className="py-0.5 font-semibold">{k + 1}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr><td className="py-0.5 text-left text-muted">prof</td>{Array.from({ length: N }, (_, k) => <td key={k}>{prof[k + 1]}</td>)}</tr>
            <tr><td className="py-0.5 text-left text-muted">dist</td>{Array.from({ length: N }, (_, k) => <td key={k}>{dist[k + 1]}</td>)}</tr>
            {[0, 1, 2].map((kk) => (
              <tr key={kk}>
                <td className="py-0.5 text-left text-muted">up[·][{kk}]</td>
                {Array.from({ length: N }, (_, k) => <td key={k} className={hot(kk, k + 1) ? 'rounded bg-accent/25 font-bold' : ''}>{up[k + 1][kk]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-faint">
        Borda <span className="text-accent">laranja</span> e <span className="text-try">azul</span>: as duas clareiras que estão subindo. Seta: o salto deste passo. Na tabela, as casas consultadas ficam destacadas. "dist" soma os comprimentos até a raiz.
      </p>
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
