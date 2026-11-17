import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Centroid decomposition: a árvore é cortada no centroide, nível por nível. Cada vértice guarda a distância até os
// seus centroides ancestrais (no máximo log n). Abrir um posto e perguntar o mais próximo só olham esses ancestrais.
const N = 12;
const EDGES: [number, number][] = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [3, 8], [8, 9], [5, 10], [10, 11], [1, 12]];
const PROF: Record<number, number> = { 1: 0, 2: 1, 12: 1, 3: 2, 4: 3, 8: 3, 5: 4, 9: 4, 6: 5, 10: 5, 7: 6, 11: 6 };
const XS: Record<number, number> = { 1: 200, 2: 200, 12: 330, 3: 200, 4: 150, 8: 300, 5: 150, 9: 300, 6: 100, 10: 230, 7: 100, 11: 230 };
type Op = ['A' | 'Q', number];
const OPS: Op[] = [['Q', 9], ['A', 7], ['Q', 9], ['Q', 11], ['A', 9], ['Q', 8], ['Q', 12]];
const INF = 1e9;

function decompose() {
  const adj: number[][] = Array.from({ length: N + 1 }, () => []);
  for (const [a, b] of EDGES) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const rem = Array(N + 1).fill(false);
  const tam = Array(N + 1).fill(0);
  const nivel = Array(N + 1).fill(-1);
  const acima: [number, number][][] = Array.from({ length: N + 1 }, () => []);
  const calc = (v: number, p: number): number => {
    tam[v] = 1;
    for (const u of adj[v]) if (u !== p && !rem[u]) tam[v] += calc(u, v);
    return tam[v];
  };
  const cen = (v: number, p: number, tot: number): number => {
    for (const u of adj[v]) if (u !== p && !rem[u] && tam[u] > Math.floor(tot / 2)) return cen(u, v, tot);
    return v;
  };
  const marca = (v: number, p: number, c: number, d: number) => {
    acima[v].push([c, d]);
    for (const u of adj[v]) if (u !== p && !rem[u]) marca(u, v, c, d + 1);
  };
  const pedacos: { lv: number; c: number; membros: number[] }[] = [];
  const membrosDe = (v: number, p: number, out: number[]) => {
    out.push(v);
    for (const u of adj[v]) if (u !== p && !rem[u]) membrosDe(u, v, out);
    return out;
  };
  const dec = (v: number, lv: number) => {
    const tot = calc(v, 0);
    const c = cen(v, 0, tot);
    pedacos.push({ lv, c, membros: membrosDe(c, 0, []) });
    nivel[c] = lv;
    marca(c, 0, c, 0);
    rem[c] = true;
    for (const u of adj[c]) if (!rem[u]) dec(u, lv + 1);
  };
  dec(1, 0);
  return { nivel, acima, pedacos };
}

interface Ev { op: number; revelados: number[]; pedaco: number[]; foco: number | null; ancs: [number, number][]; melhor: number[]; abertos: boolean[]; text: string; done: boolean }

function simulate(): Ev[] {
  const { nivel, acima, pedacos } = decompose();
  const melhor = Array(N + 1).fill(INF);
  const abertos = Array(N + 1).fill(false);
  const evs: Ev[] = [];
  const todos = pedacos.map((p) => p.c);
  const snap = (e: Partial<Ev> & { text: string }) => evs.push({ op: -1, revelados: todos, pedaco: [], foco: null, ancs: [], done: false, melhor: [...melhor], abertos: [...abertos], ...e });
  snap({ revelados: [], text: 'O parque de 12 clareiras. A decomposição corta a árvore no centroide (o vértice que deixa pedaços de no máximo metade do tamanho) e repete em cada pedaço que sobra.' });
  const ordem = [...pedacos].sort((x, y) => x.lv - y.lv);
  ordem.forEach((p, i) => {
    const pedaco = p.membros.slice().sort((a, b) => a - b);
    snap({ revelados: ordem.slice(0, i + 1).map((x) => x.c), pedaco, foco: p.c, text: pedaco.length === 1 ? `Nível ${p.lv}: o pedaço é só a clareira ${p.c}, que é o próprio centroide.` : `Nível ${p.lv}: no pedaço ${pedaco.join(', ')} (${pedaco.length} clareiras), o centroide é o ${p.c}. Tirando ele, nenhum pedaço restante tem mais de ${Math.floor(pedaco.length / 2)}.` });
  });
  const abre = (v: number) => {
    abertos[v] = true;
    for (const [c, d] of acima[v]) melhor[c] = Math.min(melhor[c], d);
  };
  abre(1);
  snap({ foco: 1, ancs: acima[1], text: `Cada clareira guarda a distância até os seus centroides ancestrais (os de cima na hierarquia de cortes). O posto inicial da clareira 1 atualiza "melhor" nesses ancestrais: ${acima[1].map(([c, d]) => `melhor[${c}] = ${d}`).join(', ')}.` });
  OPS.forEach(([t, v], op) => {
    if (t === 'A') {
      abre(v);
      snap({ op, foco: v, ancs: acima[v], done: true, text: `Abre um posto na ${v}. Para cada centroide ancestral c, melhor[c] passa a ser o menor entre o que era e a distância da ${v} até c: ${acima[v].map(([c]) => `melhor[${c}] = ${melhor[c]}`).join(', ')}.` });
    } else {
      let r = INF;
      const partes = acima[v].map(([c, d]) => {
        r = Math.min(r, d + melhor[c]);
        return `via ${c}: ${d} + ${melhor[c] >= INF ? '∞' : melhor[c]}`;
      });
      snap({ op, foco: v, ancs: acima[v], done: true, text: `Posto mais próximo da ${v}: o caminho até ele passa por algum centroide ancestral. ${partes.join('; ')}. O menor é ${r}.` });
    }
  });
  void nivel;
  return evs;
}

export default function CentroidViz() {
  const dec = useMemo(decompose, []);
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (k: number) => setStep(Math.max(0, Math.min(evs.length - 1, k)));
  const Y = (v: number) => 26 + PROF[v] * 46;
  const ancSet = new Set(ev.ancs.map(([c]) => c));

  return (
    <VizFrame title="Centroid decomposition: poucos ancestrais para cada vértice" onKey={(d) => clamp(step + d)}>
      <div className="mb-3 flex flex-wrap gap-1.5 font-mono text-xs">
        {OPS.map(([t, v], i) => (
          <span key={i} className={`rounded-md border px-2 py-1 ${i === ev.op ? 'border-accent bg-accent/20 font-semibold' : i < ev.op ? 'border-line text-faint' : 'border-line text-muted'}`}>
            {t} {v}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 400 324" className="mx-auto w-full min-w-[340px] max-w-md" role="img" aria-label="Árvore de doze clareiras com o nível de cada centroide">
          {EDGES.map(([a, b]) => {
            const noPedaco = ev.pedaco.includes(a) && ev.pedaco.includes(b);
            return <line key={`${a}-${b}`} x1={XS[a]} y1={Y(a)} x2={XS[b]} y2={Y(b)} stroke={noPedaco ? 'var(--c-try)' : 'var(--c-line)'} strokeWidth={noPedaco ? 3 : 2} />;
          })}
          {Array.from({ length: N }, (_, k) => k + 1).map((v) => {
            const lv = dec.nivel[v];
            const mostrado = ev.revelados.includes(v);
            const anc = ancSet.has(v) || ev.pedaco.includes(v);
            const foco = ev.foco === v;
            const aberto = ev.abertos[v];
            return (
              <g key={v}>
                <circle cx={XS[v]} cy={Y(v)} r="15" fill="var(--c-surface)" />
                <circle cx={XS[v]} cy={Y(v)} r="15" fill={anc ? 'var(--c-try)' : aberto ? 'var(--c-ok)' : 'var(--c-surface-2)'} fillOpacity={anc || aberto ? 0.3 : 1} stroke={foco ? 'var(--c-accent)' : anc ? 'var(--c-try)' : aberto ? 'var(--c-ok)' : 'var(--c-line)'} strokeWidth={foco ? 3.2 : 1.6} />
                <text x={XS[v]} y={Y(v) + 5} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--c-fg)">{v}</text>
                {mostrado && (
                  <g>
                    <rect x={XS[v] + 16} y={Y(v) - 21} width="22" height="14" rx="7" fill="var(--c-surface)" stroke="var(--c-line)" strokeWidth="1" />
                    <text x={XS[v] + 27} y={Y(v) - 11} textAnchor="middle" fontSize="9" fill="var(--c-muted)">n{lv}</text>
                  </g>
                )}
                {aberto && (
                  <g>
                    <circle cx={XS[v] - 24} cy={Y(v)} r="8" fill="var(--c-ok)" />
                    <text x={XS[v] - 24} y={Y(v) + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--c-accent-fg)">P</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {ev.ancs.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] table-fixed text-center font-mono text-xs">
            <tbody>
              <tr className="text-faint"><td className="w-40 py-0.5 text-left">centroide ancestral</td>{ev.ancs.map(([c]) => <td key={c}>{c}</td>)}</tr>
              <tr><td className="py-0.5 text-left text-muted">distância da {ev.foco}</td>{ev.ancs.map(([c, d]) => <td key={c}>{d}</td>)}</tr>
              <tr><td className="py-0.5 text-left text-muted">melhor[c]</td>{ev.ancs.map(([c]) => <td key={c}>{ev.melhor[c] >= INF ? '∞' : ev.melhor[c]}</td>)}</tr>
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-xs text-faint">
        "n0", "n1"…: o nível em que a clareira foi escolhida como centroide. <span className="text-try">Azul</span>: o pedaço sendo cortado ou, nos eventos, os centroides ancestrais da clareira em foco (borda <span className="text-accent">laranja</span>). <span className="text-ok">Verde</span> e selo P: postos abertos. melhor[c] é a menor distância de c até um posto aberto do pedaço de c.
      </p>
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
