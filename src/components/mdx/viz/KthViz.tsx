import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Árvore de contagens sobre os valores 1 a 8: cada nó guarda quantas notas guardadas caem no seu trecho de valores.
// K k desce comparando k com a quantidade do filho esquerdo; C x soma os nós que cobrem os valores menores que x.
const N = 8;
const OPS: ['I' | 'R' | 'K' | 'C', number][] = [['I', 5], ['I', 2], ['I', 8], ['I', 3], ['K', 2], ['C', 6], ['R', 3], ['K', 2], ['I', 1], ['I', 5], ['K', 4], ['C', 5]];
const W = 496;
const LEVEL_Y = [26, 80, 134, 188];

type Kind = 'caminho' | 'usado' | 'pulado' | 'achou';
interface Ev {
  op: number;
  t: number[];
  cur: number | null;
  marks: Record<number, Kind>;
  text: string;
  done: boolean;
}

function pos(no: number) {
  const lv = Math.floor(Math.log2(no));
  const k = no - (1 << lv);
  const slot = W / (1 << lv);
  return { x: slot * (k + 0.5), y: LEVEL_Y[lv], lv };
}
function trecho(no: number): [number, number] {
  const lv = Math.floor(Math.log2(no));
  const size = N >> lv;
  const k = no - (1 << lv);
  return [k * size + 1, (k + 1) * size];
}

function simulate(): Ev[] {
  const t: number[] = Array(2 * N).fill(0);
  const evs: Ev[] = [{ op: -1, t: [...t], cur: null, marks: {}, text: 'Cada folha é um valor possível (1 a 8) e guarda quantas notas iguais a ele existem. Cada nó de cima guarda a soma dos filhos: quantas notas caem naquele trecho de valores.', done: false }];
  const lista = () => {
    const out: number[] = [];
    for (let v = 1; v <= N; v++) for (let c = 0; c < t[N + v - 1]; c++) out.push(v);
    return out.join(', ');
  };
  OPS.forEach(([tipo, x], op) => {
    const marks: Record<number, Kind> = {};
    const snap = (cur: number | null, text: string, done = false) => evs.push({ op, t: [...t], cur, marks: { ...marks }, text, done });
    if (tipo === 'I' || tipo === 'R') {
      const d = tipo === 'I' ? 1 : -1;
      for (let no = N + x - 1; no >= 1; no >>= 1) {
        t[no] += d;
        marks[no] = 'usado';
      }
      snap(N + x - 1, `${tipo === 'I' ? 'Entra' : 'Sai'} uma nota ${x}: a folha do valor ${x} e os três nós acima dela ${tipo === 'I' ? 'ganham' : 'perdem'} 1. Notas guardadas: ${lista()}.`, true);
    } else if (tipo === 'K') {
      let no = 1;
      let k = x;
      while (no < N) {
        const [l, r] = trecho(no);
        const esq = t[2 * no];
        marks[no] = 'caminho';
        if (esq >= k) {
          snap(no, `${x}ª menor nota: no nó dos valores ${l} a ${r}, procuramos a ${k}ª. A metade esquerda tem ${esq} ${esq === 1 ? 'nota' : 'notas'}, o bastante: a resposta está lá.`);
          no = 2 * no;
        } else {
          marks[2 * no] = 'pulado';
          snap(no, `${x}ª menor nota: no nó dos valores ${l} a ${r}, procuramos a ${k}ª. A metade esquerda só tem ${esq}. Pula essas ${esq} e procura a ${k - esq}ª na direita.`);
          k -= esq;
          no = 2 * no + 1;
        }
      }
      marks[no] = 'achou';
      snap(no, `Chegou a uma folha: a ${x}ª menor nota é ${no - N + 1}. (Notas guardadas: ${lista()}.)`, true);
    } else {
      const usados: number[] = [];
      const conta = (no: number): number => {
        const [l, r] = trecho(no);
        if (x - 1 < l) return 0;
        if (r <= x - 1) {
          marks[no] = 'usado';
          usados.push(t[no]);
          return t[no];
        }
        marks[no] = 'caminho';
        return conta(2 * no) + conta(2 * no + 1);
      };
      const r = conta(1);
      snap(null, `Quantas notas são menores que ${x}? É a soma das quantidades dos valores 1 a ${x - 1}, uma consulta de trecho comum: ${usados.length > 1 ? `${usados.join(' + ')} = ${r}` : r}.`, true);
    }
  });
  return evs;
}

const COR: Record<Kind, { stroke: string; fill: string; op: number; dash?: string }> = {
  caminho: { stroke: 'var(--c-accent)', fill: 'var(--c-accent)', op: 0.14 },
  usado: { stroke: 'var(--c-try)', fill: 'var(--c-try)', op: 0.28 },
  pulado: { stroke: 'var(--c-muted)', fill: 'var(--c-surface-2)', op: 1, dash: '4 4' },
  achou: { stroke: 'var(--c-ok)', fill: 'var(--c-ok)', op: 0.28 },
};

export default function KthViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const nodes = Array.from({ length: 2 * N - 1 }, (_, k) => k + 1);

  return (
    <VizFrame title="Árvore de contagens: achando a k-ésima menor nota" onKey={(d) => clamp(step + d)}>
      <div className="mb-3 flex flex-wrap gap-1.5 font-mono text-xs">
        {OPS.map(([t, x], i) => (
          <span key={i} className={`rounded-md border px-2 py-1 ${i === ev.op ? 'border-accent bg-accent/20 font-semibold' : i < ev.op ? 'border-line text-faint' : 'border-line text-muted'}`}>
            {t} {x}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} 228`} className="w-full max-w-2xl min-w-[440px]" role="img" aria-label="Árvore de contagens sobre os valores de 1 a 8">
          {nodes.filter((no) => no > 1).map((no) => {
            const a = pos(no);
            const b = pos(no >> 1);
            return <line key={no} x1={a.x} y1={a.y - 14} x2={b.x} y2={b.y + 14} stroke="var(--c-line)" strokeWidth="1.5" />;
          })}
          {nodes.map((no) => {
            const { x, y, lv } = pos(no);
            const kind = ev.marks[no];
            const c = kind ? COR[kind] : { stroke: 'var(--c-line)', fill: 'var(--c-surface-2)', op: 1, dash: undefined };
            const leaf = lv === 3;
            const w = leaf ? 40 : 46;
            const [l, r] = trecho(no);
            return (
              <g key={no}>
                <rect x={x - w / 2} y={y - 14} width={w} height="28" rx={leaf ? 5 : 14} fill={c.fill} fillOpacity={c.op} stroke={c.stroke} strokeWidth={ev.cur === no ? 3.2 : 1.8} strokeDasharray={c.dash} />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--c-fg)" opacity={ev.t[no] === 0 ? 0.4 : 1}>{ev.t[no]}</text>
                {!leaf && <text x={x + w / 2 + 3} y={y - 5} fontSize="8.5" fill="var(--c-muted)">{l}–{r}</text>}
                {leaf && <text x={x} y={y + 30} textAnchor="middle" fontSize="10" fill="var(--c-muted)">valor {l}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-2 text-xs text-faint">
        I = entra uma nota, R = sai, K = k-ésima menor, C = quantas menores. Ao lado de cada nó, o trecho de valores de que ele cuida. <span className="text-accent">Laranja</span>: caminho da descida. Tracejado: metade pulada inteira. <span className="text-try">Azul</span>: nós alterados ou somados. <span className="text-ok">Verde</span>: a resposta.
      </p>
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
