import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// DP em árvore + rerooting: na volta da 1ª DFS, P (moradores da subárvore) e C (custo de todos eles irem até v);
// na 2ª DFS, de cima para baixo, o custo de cada clareira sai do custo do pai.
const N = 8;
const POP = [0, 2, 1, 3, 1, 2, 1, 4, 1];
const EDGES: [number, number, number][] = [[1, 2, 3], [1, 3, 2], [2, 4, 4], [2, 5, 1], [3, 6, 5], [6, 7, 2], [6, 8, 1]];
const POS: Record<number, [number, number]> = { 1: [250, 34], 2: [140, 108], 3: [360, 108], 4: [80, 186], 5: [200, 186], 6: [360, 186], 7: [300, 262], 8: [420, 262] };

interface Ev { fase: 0 | 1 | 2 | 3; cur: number | null; edge: [number, number] | null; P: (number | null)[]; C: (number | null)[]; R: (number | null)[]; melhor: number | null; text: string; done: boolean }

function simulate(): Ev[] {
  const g: [number, number][][] = Array.from({ length: N + 1 }, () => []);
  for (const [a, b, w] of EDGES) {
    g[a].push([b, w]);
    g[b].push([a, w]);
  }
  const total = POP.reduce((s, x) => s + x, 0);
  const P: (number | null)[] = Array(N + 1).fill(null);
  const C: (number | null)[] = Array(N + 1).fill(null);
  const R: (number | null)[] = Array(N + 1).fill(null);
  const snap = (e: Omit<Ev, 'P' | 'C' | 'R'>) => ({ ...e, P: [...P], C: [...C], R: [...R] });
  const evs: Ev[] = [snap({ fase: 0, cur: null, edge: null, melhor: null, text: `Cada clareira tem seus moradores (o número embaixo dela), ${total} no total. Primeira busca, a partir da 1: na volta de cada clareira, calcula P (moradores da subárvore) e C (custo de todos eles irem até ela).`, done: false })];
  const desce = (v: number, pai: number) => {
    const filhos = g[v].filter(([u]) => u !== pai);
    for (const [u] of filhos) desce(u, v);
    P[v] = POP[v] + filhos.reduce((s, [u]) => s + (P[u] as number), 0);
    C[v] = filhos.reduce((s, [u, w]) => s + (C[u] as number) + (P[u] as number) * w, 0);
    const txt = filhos.length === 0
      ? `A clareira ${v} é uma folha: P = ${POP[v]} (só os moradores dela) e C = 0 (ninguém precisa andar).`
      : `Clareira ${v}: P = ${POP[v]} + ${filhos.map(([u]) => P[u]).join(' + ')} = ${P[v]}. C soma, para cada filho, o custo dele mais os moradores dele andando a trilha até ${v}: ${filhos.map(([u, w]) => `(${C[u]} + ${P[u]}·${w})`).join(' + ')} = ${C[v]}.`;
    evs.push(snap({ fase: 1, cur: v, edge: null, melhor: null, text: txt, done: false }));
  };
  desce(1, 0);
  R[1] = C[1];
  evs.push(snap({ fase: 2, cur: 1, edge: null, melhor: null, text: `Com a raiz em 1, a subárvore da 1 é o parque inteiro: o custo de todos irem até a 1 é C[1] = ${C[1]}. Agora a segunda busca desce passando a resposta de pai para filho.`, done: false }));
  const sobe = (v: number, pai: number) => {
    for (const [u, w] of g[v]) {
      if (u === pai) continue;
      const pu = P[u] as number;
      R[u] = (R[v] as number) - pu * w + (total - pu) * w;
      evs.push(snap({
        fase: 2, cur: u, edge: [v, u], melhor: null,
        text: `Mudar o encontro da ${v} para a ${u}: os ${pu} moradores da subárvore de ${u} andam ${w} a menos, e os outros ${total - pu} andam ${w} a mais. ${R[v]} − ${pu}·${w} + ${total - pu}·${w} = ${R[u]}.`,
        done: false,
      }));
      sobe(u, v);
    }
  };
  sobe(1, 0);
  let m = 1;
  for (let v = 2; v <= N; v++) if ((R[v] as number) < (R[m] as number)) m = v;
  evs.push(snap({ fase: 3, cur: m, edge: null, melhor: m, text: `Pronto: o custo de cada clareira foi calculado com duas buscas, em vez de uma busca por clareira. O menor é ${R[m]}, na clareira ${m}. Repare que não é a 1, o centro da aula anterior: os moradores pesam para o lado da 7.`, done: true }));
  return evs;
}

export default function RerootViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const inSub = (root: number, v: number) => {
    // v está na subárvore de root (raiz da árvore em 1)?
    const pai: number[] = Array(N + 1).fill(0);
    const ord: number[] = [1];
    for (let i = 0; i < ord.length; i++) for (const [a, b] of EDGES) {
      const x = ord[i];
      const y = a === x ? b : b === x ? a : 0;
      if (y && y !== pai[x]) { pai[y] = x; ord.push(y); }
    }
    for (let x = v; x; x = pai[x]) if (x === root) return true;
    return false;
  };
  const linhas: [string, (number | null)[]][] = [['moradores', POP.map((x, i) => (i ? x : null))], ['P', ev.P], ['C', ev.C], ['custo', ev.R]];

  return (
    <VizFrame title="Rerooting: o custo de cada clareira com duas buscas" onKey={(d) => clamp(step + d)}>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 500 300" className="w-full min-w-[420px] max-w-xl" role="img" aria-label="Árvore de oito clareiras com moradores e comprimentos">
          {EDGES.map(([a, b, w]) => {
            const [x1, y1] = POS[a];
            const [x2, y2] = POS[b];
            const hot = ev.edge && ((ev.edge[0] === a && ev.edge[1] === b) || (ev.edge[0] === b && ev.edge[1] === a));
            return (
              <g key={`${a}-${b}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? 'var(--c-accent)' : 'var(--c-line)'} strokeWidth={hot ? 4 : 2} />
                <rect x={x1 + (x2 - x1) * 0.62 - 9} y={y1 + (y2 - y1) * 0.62 - 9} width="18" height="18" rx="4" fill="var(--c-surface)" />
                <text x={x1 + (x2 - x1) * 0.62} y={y1 + (y2 - y1) * 0.62 + 4} textAnchor="middle" fontSize="11" fill="var(--c-muted)">{w}</text>
              </g>
            );
          })}
          {Array.from({ length: N }, (_, k) => k + 1).map((v) => {
            const [x, y] = POS[v];
            const lado = ev.edge ? (inSub(ev.edge[1], v) ? 'perto' : 'longe') : null;
            const pronto = ev.fase === 1 ? ev.P[v] !== null : ev.fase >= 2 ? ev.R[v] !== null : false;
            const fill = ev.melhor === v ? 'var(--c-ok)' : lado === 'perto' ? 'var(--c-try)' : pronto ? 'var(--c-try)' : 'var(--c-surface-2)';
            const op = ev.melhor === v ? 0.3 : lado === 'perto' ? 0.35 : pronto ? 0.15 : 1;
            const selo = ev.fase === 1 ? ev.C[v] : ev.R[v];
            return (
              <g key={v}>
                <circle cx={x} cy={y} r="17" fill="var(--c-surface)" />
                <circle cx={x} cy={y} r="17" fill={fill} fillOpacity={op} stroke={ev.cur === v ? 'var(--c-accent)' : ev.melhor === v ? 'var(--c-ok)' : pronto ? 'var(--c-try)' : 'var(--c-line)'} strokeWidth={ev.cur === v ? 3.2 : 1.8} strokeDasharray={lado === 'longe' ? '4 3' : undefined} />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--c-fg)">{v}</text>
                <rect x={x - 20} y={y + 20} width="40" height="14" rx="4" fill="var(--c-surface)" />
                <text x={x} y={y + 31} textAnchor="middle" fontSize="10" fill="var(--c-muted)">{POP[v]} mor.</text>
                {selo !== null && (
                  <g>
                    <rect x={x + 20} y={y - 8} width="30" height="16" rx="8" fill="var(--c-surface)" stroke="var(--c-try)" strokeWidth="1.2" />
                    <text x={x + 35} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--c-fg)">{selo}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] table-fixed text-center font-mono text-xs">
          <thead>
            <tr className="text-faint">
              <th className="w-24 py-1 text-left font-semibold">clareira</th>
              {Array.from({ length: N }, (_, k) => <th key={k} className="py-1 font-semibold">{k + 1}</th>)}
            </tr>
          </thead>
          <tbody>
            {linhas.map(([t, r], i) => (
              <tr key={t} className={(ev.fase === 1 && (i === 1 || i === 2)) || (ev.fase >= 2 && i === 3) ? 'bg-accent/10' : ''}>
                <td className="py-1 text-left text-muted">{t}</td>
                {Array.from({ length: N }, (_, k) => <td key={k} className={`py-1 ${ev.cur === k + 1 && i > 0 ? 'font-bold' : ''} ${ev.melhor === k + 1 && i === 3 ? 'text-ok' : ''}`}>{r[k + 1] ?? '·'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-faint">
        Selo ao lado da clareira: C na primeira busca, o custo total na segunda. Na segunda busca, a trilha <span className="text-accent">laranja</span> é a que o ponto de encontro atravessa: as clareiras em <span className="text-try">azul</span> ficam mais perto, as tracejadas ficam mais longe. <span className="text-ok">Verde</span>: o melhor ponto de encontro.
      </p>
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
