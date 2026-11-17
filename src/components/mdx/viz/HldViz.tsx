import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Heavy-light decomposition: cadeias pesadas viram trechos contínuos do vetor; um caminho vira poucos trechos.
const N = 12;
const EDGES: [number, number, number][] = [[1, 2, 4], [2, 3, 1], [3, 4, 3], [4, 5, 2], [5, 6, 5], [6, 7, 1], [3, 8, 2], [8, 9, 6], [5, 10, 3], [10, 11, 2], [1, 12, 7]];
const XS: Record<number, number> = { 1: 200, 2: 200, 12: 330, 3: 200, 4: 150, 8: 300, 5: 150, 9: 300, 6: 100, 10: 230, 7: 100, 11: 230 };
type Op = ['Q' | 'M', number, number];
const OPS: Op[] = [['Q', 7, 9], ['Q', 11, 12], ['M', 8, 1], ['Q', 7, 9], ['M', 5, 8], ['Q', 6, 10], ['Q', 4, 4]];

function decompose() {
  const adj: [number, number][][] = Array.from({ length: N + 1 }, () => []);
  EDGES.forEach(([a, b], i) => {
    adj[a].push([b, i + 1]);
    adj[b].push([a, i + 1]);
  });
  const pai = Array(N + 1).fill(0), prof = Array(N + 1).fill(0), tam = Array(N + 1).fill(0), pes = Array(N + 1).fill(0), acima = Array(N + 1).fill(0);
  const d1 = (v: number, p: number) => {
    pai[v] = p;
    tam[v] = 1;
    for (const [u, id] of adj[v]) if (u !== p) {
      prof[u] = prof[v] + 1;
      acima[u] = id;
      d1(u, v);
      tam[v] += tam[u];
      if (!pes[v] || tam[u] > tam[pes[v]]) pes[v] = u;
    }
  };
  d1(1, 0);
  const cab = Array(N + 1).fill(0), pos = Array(N + 1).fill(0);
  let k = 0;
  const d2 = (v: number, h: number) => {
    cab[v] = h;
    pos[v] = ++k;
    if (pes[v]) d2(pes[v], h);
    for (const [u] of adj[v]) if (u !== pai[v] && u !== pes[v]) d2(u, u);
  };
  d2(1, 1);
  const quem = Array(N + 1).fill(0);
  for (let v = 1; v <= N; v++) quem[pos[v]] = v;
  const baixo = Array(N).fill(0);
  for (let v = 2; v <= N; v++) baixo[acima[v]] = v;
  return { pai, prof, pes, cab, pos, quem, acima, baixo };
}

interface Ev { op: number; trecho: [number, number] | null; a: number | null; b: number | null; val: number[]; cadeia: number | null; text: string; done: boolean }

function simulate(): Ev[] {
  const { pai, prof, cab, pos, quem, acima, baixo } = decompose();
  const custo = [0, ...EDGES.map((e) => e[2])];
  const val = Array(N + 2).fill(0);
  for (let v = 2; v <= N; v++) val[pos[v]] = custo[acima[v]];
  const evs: Ev[] = [];
  const snap = (e: Partial<Ev> & { text: string }) => evs.push({ op: -1, trecho: null, a: null, b: null, cadeia: null, done: false, val: [...val], ...e });
  snap({ text: 'A árvore da aula de LCA. Cada trilha vale o seu custo, guardado no vértice de BAIXO dela (a raiz fica com 0). Traço grosso: a trilha liga um vértice ao seu filho pesado, o de maior subárvore.' });
  for (const h of [1, 8, 10, 12]) {
    const membros = Array.from({ length: N }, (_, i) => i + 1).filter((v) => cab[v] === h).sort((x, y) => pos[x] - pos[y]);
    snap({ cadeia: h, text: `Cadeia que começa no ${h}: ${membros.join(' → ')}. Como a DFS visita o filho pesado primeiro, ela ocupa as posições ${pos[membros[0]]} a ${pos[membros[membros.length - 1]]}, sem buracos.` });
  }
  const mx = (a: number, b: number) => {
    let r = 0;
    for (let i = a; i <= b; i++) r = Math.max(r, val[i]);
    return r;
  };
  OPS.forEach(([t, x, y], op) => {
    if (t === 'M') {
      const v = baixo[x];
      val[pos[v]] = y;
      snap({ op, trecho: [pos[v], pos[v]], text: `A trilha ${x} (do ${pai[v]} ao ${v}) passa a custar ${y}: muda só a posição ${pos[v]}, a do vértice de baixo.`, done: true });
      return;
    }
    let a = x;
    let b = y;
    let res = 0;
    snap({ op, a, b, text: `Trilha mais cara entre ${x} e ${y}. Enquanto os dois estiverem em cadeias diferentes, sobe o da cadeia cujo topo é mais fundo.` });
    while (cab[a] !== cab[b]) {
      if (prof[cab[a]] < prof[cab[b]]) [a, b] = [b, a];
      const m = mx(pos[cab[a]], pos[a]);
      res = Math.max(res, m);
      snap({ op, a, b, trecho: [pos[cab[a]], pos[a]], text: `O ${a} está numa cadeia de topo ${cab[a]} (mais fundo). Consulta o trecho ${pos[cab[a]]}..${pos[a]} (do ${a} até o ${cab[a]}, incluindo a trilha que sai do topo): máximo ${m}. Depois pula para o pai do topo, o ${pai[cab[a]]}.` });
      a = pai[cab[a]];
    }
    if (prof[a] > prof[b]) [a, b] = [b, a];
    if (a !== b) {
      const m = mx(pos[a] + 1, pos[b]);
      res = Math.max(res, m);
      snap({ op, a, b, trecho: [pos[a] + 1, pos[b]], text: `Agora estão na mesma cadeia; o ${a} é o mais alto, o LCA. Consulta ${pos[a] + 1}..${pos[b]}: começa uma posição depois do LCA, porque o valor guardado nele é a trilha acima dele, fora do caminho. Máximo ${m}.` });
    }
    snap({ op, a, b, done: true, text: a === b && x === y ? `Os dois são a mesma clareira: o caminho não tem trilha nenhuma, e a resposta é 0.` : `Resposta: a trilha mais cara do caminho custa ${res}.` });
  });
  return evs;
}

export default function HldViz() {
  const dec = useMemo(decompose, []);
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (k: number) => setStep(Math.max(0, Math.min(evs.length - 1, k)));
  const Y = (v: number) => 26 + dec.prof[v] * 48;
  const noTrecho = (v: number) => ev.trecho !== null && dec.pos[v] >= ev.trecho[0] && dec.pos[v] <= ev.trecho[1];

  return (
    <VizFrame title="Heavy-light: o caminho vira poucos trechos do vetor" onKey={(d) => clamp(step + d)}>
      <div className="mb-3 flex flex-wrap gap-1.5 font-mono text-xs">
        {OPS.map(([t, x, y], i) => (
          <span key={i} className={`rounded-md border px-2 py-1 ${i === ev.op ? 'border-accent bg-accent/20 font-semibold' : i < ev.op ? 'border-line text-faint' : 'border-line text-muted'}`}>
            {t} {x} {y}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 400 336" className="mx-auto w-full min-w-[340px] max-w-md" role="img" aria-label="Árvore de doze clareiras dividida em cadeias">
          {EDGES.map(([a, b, w], i) => {
            const [p, f] = dec.pai[b] === a ? [a, b] : [b, a];
            const pesada = dec.pes[p] === f;
            const hot = noTrecho(f);
            const naCadeia = ev.cadeia !== null && dec.cab[f] === ev.cadeia && dec.cab[p] === ev.cadeia;
            return (
              <g key={i}>
                <line x1={XS[p]} y1={Y(p)} x2={XS[f]} y2={Y(f)} stroke={hot ? 'var(--c-accent)' : naCadeia ? 'var(--c-try)' : 'var(--c-muted)'} strokeWidth={pesada ? 6 : 1.6} strokeOpacity={pesada || hot ? 0.9 : 0.7} strokeDasharray={pesada ? undefined : '4 4'} />
                <rect x={(XS[p] + XS[f]) / 2 + 4} y={(Y(p) + Y(f)) / 2 - 8} width="18" height="14" rx="3" fill="var(--c-surface)" />
                <text x={(XS[p] + XS[f]) / 2 + 13} y={(Y(p) + Y(f)) / 2 + 3} textAnchor="middle" fontSize="10" fill="var(--c-fg)">{ev.val[dec.pos[f]]}</text>
              </g>
            );
          })}
          {Array.from({ length: N }, (_, k) => k + 1).map((v) => {
            const isAB = ev.a === v || ev.b === v;
            const naCadeia = ev.cadeia !== null && dec.cab[v] === ev.cadeia;
            return (
              <g key={v}>
                <circle cx={XS[v]} cy={Y(v)} r="14" fill="var(--c-surface)" />
                <circle cx={XS[v]} cy={Y(v)} r="14" fill={naCadeia ? 'var(--c-try)' : 'var(--c-surface-2)'} fillOpacity={naCadeia ? 0.3 : 1} stroke={isAB ? 'var(--c-accent)' : naCadeia ? 'var(--c-try)' : 'var(--c-line)'} strokeWidth={isAB ? 3 : 1.6} />
                <text x={XS[v]} y={Y(v) + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--c-fg)">{v}</text>
                <text x={XS[v] - 18} y={Y(v) + 4} textAnchor="end" fontSize="9" fill="var(--c-faint)">p{dec.pos[v]}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[440px] table-fixed text-center font-mono text-[11px]">
          <tbody>
            <tr className="text-faint">
              <td className="w-20 py-0.5 text-left">posição</td>
              {Array.from({ length: N }, (_, i) => <td key={i}>{i + 1}</td>)}
            </tr>
            <tr>
              <td className="py-0.5 text-left text-muted">vértice</td>
              {Array.from({ length: N }, (_, i) => {
                const v = dec.quem[i + 1];
                const inicio = dec.cab[v] === v;
                return <td key={i} className={inicio ? 'border-l-2 border-line' : ''}>{v}</td>;
              })}
            </tr>
            <tr>
              <td className="py-0.5 text-left text-muted">custo</td>
              {Array.from({ length: N }, (_, i) => {
                const dentro = ev.trecho !== null && i + 1 >= ev.trecho[0] && i + 1 <= ev.trecho[1];
                return <td key={i} className={dentro ? 'rounded bg-accent/25 font-bold' : ''}>{ev.val[i + 1]}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-faint">
        Traço grosso: trilha pesada (mesma cadeia); tracejado: trilha leve (troca de cadeia). O número em cada trilha é o custo dela, guardado no vértice de baixo. "p" é a posição do vértice no vetor; na tabela, uma barra marca onde começa cada cadeia. <span className="text-accent">Laranja</span>: o trecho consultado agora e os dois vértices que estão subindo.
      </p>
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
