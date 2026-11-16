import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Union-find (por tamanho, com compressão) numa sequência de ligações e perguntas.
// Os vértices ficam em linha; cada arco vai de um vértice para o seu pai.
const N = 6;
const OPS: ['L' | 'P', number, number][] = [['L', 1, 2], ['L', 3, 4], ['P', 1, 3], ['L', 2, 3], ['P', 1, 4], ['L', 5, 6], ['P', 4, 6], ['L', 6, 1], ['P', 4, 6], ['L', 2, 5]];
const X = (u: number) => 45 + (u - 1) * 72;
const Y = 120;

interface Ev {
  op: number; // índice da operação (-1 = início)
  pai: number[];
  tam: number[];
  touched: number[]; // vértices cujo pai mudou neste passo
  asked: number[];
  text: string;
  answer: boolean | null;
}

function simulate(): Ev[] {
  const pai = Array.from({ length: N + 1 }, (_, i) => i);
  const tam: number[] = Array(N + 1).fill(1);
  const evs: Ev[] = [{ op: -1, pai: [...pai], tam: [...tam], touched: [], asked: [], text: 'Cada computador começa sozinho: é a raiz do próprio grupo.', answer: null }];
  let touched: number[] = [];
  const acha = (x: number): number => {
    if (pai[x] === x) return x;
    const r = acha(pai[x]);
    if (pai[x] !== r) {
      pai[x] = r;
      touched.push(x);
    }
    return r;
  };
  OPS.forEach(([t, a, b], i) => {
    touched = [];
    const ra = acha(a);
    const rb = acha(b);
    const comp = touched.length ? ` No caminho, ${touched.join(' e ')} ${touched.length > 1 ? 'foram pendurados' : 'foi pendurado'} direto na raiz.` : '';
    if (t === 'P') {
      evs.push({ op: i, pai: [...pai], tam: [...tam], touched: [...touched], asked: [a, b], text: `Pergunta ${a} e ${b}: a raiz de ${a} é ${ra} e a de ${b} é ${rb}. ${ra === rb ? 'Mesma raiz: conectados.' : 'Raízes diferentes: não conectados.'}${comp}`, answer: ra === rb });
    } else if (ra === rb) {
      evs.push({ op: i, pai: [...pai], tam: [...tam], touched: [...touched], asked: [a, b], text: `Liga ${a} e ${b}: os dois já têm a raiz ${ra}. Nada muda.${comp}`, answer: null });
    } else {
      const [big, small] = tam[ra] >= tam[rb] ? [ra, rb] : [rb, ra];
      const sb = tam[big];
      const ss = tam[small];
      pai[small] = big;
      tam[big] += tam[small];
      touched.push(small);
      evs.push({ op: i, pai: [...pai], tam: [...tam], touched: [...touched], asked: [a, b], text: `Liga ${a} e ${b}: raízes ${ra} e ${rb}. O grupo de ${small} (tamanho ${ss}) entra debaixo do de ${big} (tamanho ${sb}), que passa a ter ${sb + ss}.${comp}`, answer: null });
    }
  });
  return evs;
}

export default function DsuViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));

  return (
    <VizFrame title="Union-find: ligando e perguntando" onKey={(d) => clamp(step + d)}>
      <div className="mb-3 flex flex-wrap gap-1.5 font-mono text-xs">
        {OPS.map(([t, a, b], i) => (
          <span key={i} className={`rounded-md border px-2 py-1 ${i === ev.op ? 'border-accent bg-accent/20 font-semibold' : i < ev.op ? 'border-line text-faint' : 'border-line text-muted'}`}>
            {t} {a} {b}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 450 160" className="w-full max-w-xl min-w-[400px]" role="img" aria-label="Seis computadores e o pai de cada um">
          <defs>
            <marker id="dsu-seta" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" fill="var(--c-muted)" />
            </marker>
          </defs>
          {Array.from({ length: N }, (_, k) => k + 1).filter((u) => ev.pai[u] !== u).map((u) => {
            const p = ev.pai[u];
            const h = 22 + Math.abs(u - p) * 16;
            const hot = ev.touched.includes(u);
            return <path key={u} d={`M${X(u)},${Y - 19} Q${(X(u) + X(p)) / 2},${Y - 19 - h * 1.6} ${X(p) + (u > p ? 7 : -7)},${Y - 20}`} fill="none" stroke={hot ? 'var(--c-accent)' : 'var(--c-muted)'} strokeWidth={hot ? 3 : 1.8} markerEnd="url(#dsu-seta)" />;
          })}
          {Array.from({ length: N }, (_, k) => k + 1).map((u) => {
            const root = ev.pai[u] === u;
            const asked = ev.asked.includes(u);
            return (
              <g key={u}>
                {asked && <circle cx={X(u)} cy={Y} r="24" fill="none" stroke="var(--c-accent)" strokeWidth="3" />}
                <circle cx={X(u)} cy={Y} r="18" fill={root ? 'var(--c-try)' : 'var(--c-surface-2)'} fillOpacity={root ? 0.3 : 1} stroke={root ? 'var(--c-try)' : 'var(--c-line)'} strokeWidth="2" />
                <text x={X(u)} y={Y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--c-fg)">{u}</text>
                {root && <text x={X(u)} y={Y + 36} textAnchor="middle" fontSize="11" fill="var(--c-muted)">tam {ev.tam[u]}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-2 font-mono text-sm">
        <span className="mr-2 text-xs uppercase tracking-wider text-faint">pai</span>
        {Array.from({ length: N }, (_, k) => k + 1).map((u) => (
          <span key={u} className={`mr-2 ${ev.touched.includes(u) ? 'font-semibold text-accent' : ''}`}>{ev.pai[u]}</span>
        ))}
      </p>
      <p className="mt-2 text-xs text-faint">
        Cada seta vai de um computador para o seu pai. <span className="text-try">Azul</span>: raiz de um grupo, com o tamanho embaixo. <span className="text-accent">Laranja</span>: os dois da operação atual e as setas que mudaram. L = liga, P = pergunta.
      </p>
      <p className={`mt-3 min-h-16 text-[15px] ${ev.answer === true ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
