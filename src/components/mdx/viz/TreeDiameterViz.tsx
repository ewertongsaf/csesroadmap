import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Diâmetro de uma árvore com pesos: DFS a partir de 1, depois da clareira mais longe (A), depois da mais longe de A (B).
// A distância máxima de cada clareira é o maior entre a distância até A e até B.
const N = 8;
const EDGES: [number, number, number][] = [[1, 2, 3], [1, 3, 2], [2, 4, 4], [2, 5, 1], [3, 6, 5], [6, 7, 2], [6, 8, 1]];
const POS: Record<number, [number, number]> = { 1: [250, 34], 2: [140, 108], 3: [360, 108], 4: [80, 186], 5: [200, 186], 6: [360, 186], 7: [300, 262], 8: [420, 262] };

type Linha = (number | null)[];
interface Ev { fase: number; cur: number | null; rows: Linha[]; origem: number | null; caminho: number[]; centro: number | null; text: string; done: boolean }

function adj() {
  const g: [number, number][][] = Array.from({ length: N + 1 }, () => []);
  for (const [a, b, w] of EDGES) {
    g[a].push([b, w]);
    g[b].push([a, w]);
  }
  return g;
}

function simulate(): Ev[] {
  const g = adj();
  const rows: Linha[] = [Array(N + 1).fill(null), Array(N + 1).fill(null), Array(N + 1).fill(null)];
  const evs: Ev[] = [{ fase: -1, cur: null, rows: rows.map((r) => [...r]), origem: null, caminho: [], centro: null, text: 'Oito clareiras e sete trilhas, cada uma com seu comprimento. Entre duas clareiras existe exatamente um caminho. Vamos fazer três buscas em profundidade (DFS) e anotar as distâncias.', done: false }];
  const far = (r: Linha) => {
    let m = 1;
    for (let v = 2; v <= N; v++) if ((r[v] as number) > (r[m] as number)) m = v;
    return m;
  };
  let origem = 1;
  let A = 0;
  for (let fase = 0; fase < 3; fase++) {
    const r = rows[fase];
    const dfs = (v: number, pai: number, d: number, via: number) => {
      r[v] = d;
      evs.push({
        fase, cur: v, rows: rows.map((x) => [...x]), origem, caminho: [], centro: null,
        text: pai === 0 ? `Busca ${fase + 1}, a partir da clareira ${v}: distância 0.` : `Busca ${fase + 1}: da clareira ${pai} vai para a ${v} pela trilha de comprimento ${via}. Distância desde ${origem}: ${d - via} + ${via} = ${d}.`,
        done: false,
      });
      for (const [u, w] of g[v]) if (u !== pai) dfs(u, v, d + w, w);
    };
    dfs(origem, 0, 0, 0);
    const f = far(r);
    if (fase === 0) {
      A = f;
      evs.push({ fase, cur: f, rows: rows.map((x) => [...x]), origem, caminho: [], centro: null, text: `A clareira mais longe de 1 é a ${f}, a ${r[f]} de distância. Ela é uma das pontas do diâmetro: chame-a de A. (Mas 9 ainda não é a resposta.)`, done: false });
      origem = A;
    } else if (fase === 1) {
      const pai: number[] = Array(N + 1).fill(0);
      const p = (v: number, q: number) => {
        pai[v] = q;
        for (const [u] of g[v]) if (u !== q) p(u, v);
      };
      p(A, 0);
      const cam: number[] = [];
      for (let x = f; x; x = pai[x]) cam.push(x);
      evs.push({ fase, cur: f, rows: rows.map((x) => [...x]), origem, caminho: cam, centro: null, text: `A mais longe de A é a ${f}, a ${r[f]} de distância: é o diâmetro, a maior distância entre duas clareiras. O caminho é ${cam.join(' – ')}. Chame a ${f} de B.`, done: false });
      origem = f;
    } else {
      const ecc = Array.from({ length: N + 1 }, (_, v) => (v ? Math.max(rows[1][v] as number, rows[2][v] as number) : 0));
      let c = 1;
      for (let v = 2; v <= N; v++) if (ecc[v] < ecc[c]) c = v;
      const emp = Array.from({ length: N }, (_, k) => k + 1).filter((v) => ecc[v] === ecc[c]);
      evs.push({
        fase: 3, cur: c, rows: rows.map((x) => [...x]), origem: null, caminho: [], centro: c,
        text: `Para cada clareira, a mais longe dela é A ou B: a distância máxima é o maior entre as linhas "de A" e "de B" (${ecc.slice(1).join(', ')}). O menor desses valores é ${ecc[c]}, nas clareiras ${emp.join(' e ')}: o posto de guarda fica na ${c}, a de menor número.`,
        done: true,
      });
    }
  }
  return evs;
}

export default function TreeDiameterViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const eccLinha: (number | null)[] = Array.from({ length: N + 1 }, (_, v) => (v && ev.rows[1][v] !== null && ev.rows[2][v] !== null ? Math.max(ev.rows[1][v] as number, ev.rows[2][v] as number) : null));
  const linhaAtual = ev.fase >= 0 && ev.fase <= 2 ? ev.rows[ev.fase] : ev.fase === 3 ? eccLinha : null;
  const menorExc = ev.fase === 3 ? Math.min(...(eccLinha.slice(1) as number[])) : null;
  const noCaminho = (a: number, b: number) => {
    const i = ev.caminho.indexOf(a);
    return i >= 0 && (ev.caminho[i + 1] === b || ev.caminho[i - 1] === b);
  };
  const titulos = ['de 1', 'de A', 'de B'];
  const ecc = (v: number) => (ev.rows[1][v] !== null && ev.rows[2][v] !== null ? Math.max(ev.rows[1][v] as number, ev.rows[2][v] as number) : null);

  return (
    <VizFrame title="Diâmetro e centro: três buscas na mesma árvore" onKey={(d) => clamp(step + d)}>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 500 296" className="w-full min-w-[420px] max-w-xl" role="img" aria-label="Árvore de oito clareiras com o comprimento de cada trilha">
          {EDGES.map(([a, b, w]) => {
            const [x1, y1] = POS[a];
            const [x2, y2] = POS[b];
            const hot = noCaminho(a, b);
            return (
              <g key={`${a}-${b}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? 'var(--c-accent)' : 'var(--c-line)'} strokeWidth={hot ? 4 : 2} />
                <rect x={(x1 + x2) / 2 - 9} y={(y1 + y2) / 2 - 9} width="18" height="18" rx="4" fill="var(--c-surface)" />
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} textAnchor="middle" fontSize="11" fill="var(--c-muted)">{w}</text>
              </g>
            );
          })}
          {Array.from({ length: N }, (_, k) => k + 1).map((v) => {
            const [x, y] = POS[v];
            const d = linhaAtual ? linhaAtual[v] : null;
            const isCur = ev.cur === v;
            const isOrig = ev.origem === v;
            const isCentro = menorExc !== null && eccLinha[v] === menorExc;
            return (
              <g key={v}>
                <circle cx={x} cy={y} r="17" fill="var(--c-surface)" />
                <circle cx={x} cy={y} r="17" fill={isCentro ? 'var(--c-ok)' : d !== null ? 'var(--c-try)' : 'var(--c-surface-2)'} fillOpacity={isCentro ? 0.3 : d !== null ? 0.25 : 1} stroke={isCur ? 'var(--c-accent)' : isCentro ? 'var(--c-ok)' : d !== null ? 'var(--c-try)' : 'var(--c-line)'} strokeWidth={isCur ? 3.2 : 1.8} />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--c-fg)">{v}</text>
                {isOrig && <text x={x} y={y - 23} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--c-accent)">início</text>}
                {d !== null && (
                  <g>
                    <rect x={x + 13} y={y + 6} width="24" height="16" rx="8" fill="var(--c-surface)" stroke={isCentro ? 'var(--c-ok)' : 'var(--c-try)'} strokeWidth="1.2" />
                    <text x={x + 25} y={y + 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--c-fg)">{d}</text>
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
            {titulos.map((t, i) => (
              <tr key={t} className={ev.fase === i ? 'bg-accent/10' : ''}>
                <td className="py-1 text-left text-muted">{t}</td>
                {Array.from({ length: N }, (_, k) => <td key={k} className="py-1">{ev.rows[i][k + 1] ?? '·'}</td>)}
              </tr>
            ))}
            <tr className={ev.fase === 3 ? 'bg-ok/10' : ''}>
              <td className="py-1 text-left text-muted">máx(A, B)</td>
              {Array.from({ length: N }, (_, k) => <td key={k} className={`py-1 ${ev.centro === k + 1 ? 'font-bold text-ok' : ''}`}>{ecc(k + 1) ?? '·'}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-faint">
        O número em cada trilha é o comprimento; o selo ao lado de cada clareira é a distância desde o início da busca atual (no último passo, a maior distância a partir dela). Borda <span className="text-accent">laranja</span>: clareira visitada neste passo; caminho laranja: o diâmetro. <span className="text-ok">Verde</span>: as clareiras de menor distância máxima (candidatas a posto).
      </p>
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
