import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Lazy propagation: segment tree de máximo com soma em trecho. Cada nó guarda o máximo do seu trecho
// e uma pendência (quanto os filhos ainda devem receber). Os passos seguem os eventos do exemplo da aula.
const N = 8;
const INICIAL = [0, 2, 6, 1, 8, 3, 5, 4, 7];
type Op = ['S', number, number, number] | ['Q', number, number, 0];
const OPS: Op[] = [['Q', 1, 8, 0], ['S', 1, 4, 3], ['Q', 3, 6, 0], ['S', 5, 8, -2], ['S', 2, 7, 4], ['Q', 5, 8, 0], ['Q', 1, 2, 0]];
const W = 496;
const LEVEL_Y = [34, 92, 150, 208];

type Kind = 'fora' | 'dentro' | 'parcial' | 'empurra' | 'refaz';
interface Ev { op: number; t: number[]; p: number[]; cur: number | null; marks: Record<number, Kind>; dias: number[]; text: string; done: boolean }

function pos(no: number) {
  const lv = Math.floor(Math.log2(no));
  const k = no - (1 << lv);
  return { x: (W / (1 << lv)) * (k + 0.5), y: LEVEL_Y[lv], lv };
}
function trecho(no: number): [number, number] {
  const lv = Math.floor(Math.log2(no));
  const size = N >> lv;
  const k = no - (1 << lv);
  return [k * size + 1, (k + 1) * size];
}
const nome = (no: number) => {
  const [l, r] = trecho(no);
  return l === r ? `nó ${no} (dia ${l})` : `nó ${no} (dias ${l} a ${r})`;
};
const sinal = (x: number) => (x >= 0 ? `+${x}` : `${x}`);

function simulate(): Ev[] {
  const t: number[] = Array(2 * N).fill(0);
  const p: number[] = Array(2 * N).fill(0);
  const dias = [...INICIAL];
  for (let i = 1; i <= N; i++) t[N + i - 1] = INICIAL[i];
  for (let no = N - 1; no >= 1; no--) t[no] = Math.max(t[2 * no], t[2 * no + 1]);
  const evs: Ev[] = [{ op: -1, t: [...t], p: [...p], cur: null, marks: {}, dias: [...dias], text: 'Cada nó guarda o maior valor do seu trecho, como na aula de segment tree. Agora ele também pode guardar uma pendência (o selo laranja): quanto os filhos dele ainda devem receber.', done: false }];
  const aplica = (no: number, x: number) => {
    t[no] += x;
    p[no] += x;
  };
  OPS.forEach(([tipo, a, b, x], op) => {
    const marks: Record<number, Kind> = {};
    let fora: number[] = []; // nós fora do trecho: marcados, mas sem passo próprio (são citados no passo seguinte)
    const snap = (cur: number | null, text: string, done = false) => {
      const nota = fora.length ? ` (${fora.length > 1 ? `Os nós ${fora.join(' e ')} estavam inteiros` : `O nó ${fora[0]} estava inteiro`} fora do trecho e ${fora.length > 1 ? 'foram pulados' : 'foi pulado'}.)` : '';
      fora = [];
      evs.push({ op, t: [...t], p: [...p], cur, marks: { ...marks }, dias: [...dias], text: text + nota, done });
    };
    const empurra = (no: number, ctx: string) => {
      if (no >= N || p[no] === 0) return;
      const v = p[no];
      aplica(2 * no, v);
      aplica(2 * no + 1, v);
      p[no] = 0;
      marks[2 * no] = 'empurra';
      marks[2 * no + 1] = 'empurra';
      snap(no, `${ctx} Antes de descer, o ${nome(no)} empurra a pendência ${sinal(v)} para os dois filhos: cada um soma ${sinal(v)} no seu máximo e passa a dever ${sinal(v)} aos próprios filhos.`);
    };
    if (tipo === 'S') {
      for (let i = a; i <= b; i++) dias[i] += x;
      const soma = (no: number) => {
        const [l, r] = trecho(no);
        const ctx = `Soma ${sinal(x)} nos dias ${a} a ${b}:`;
        if (b < l || r < a) {
          marks[no] = 'fora';
          fora.push(no);
          return;
        }
        if (a <= l && r <= b) {
          aplica(no, x);
          marks[no] = 'dentro';
          snap(no, `${ctx} o ${nome(no)} está todo dentro. O máximo dele recebe ${sinal(x)} e vira ${t[no]}${no < N ? `, e a pendência anota ${sinal(x)} para os filhos. Ninguém abaixo é visitado agora` : ''}.`);
          return;
        }
        marks[no] = 'parcial';
        snap(no, `${ctx} o ${nome(no)} está só em parte dentro. Vai descer.`);
        empurra(no, ctx);
        soma(2 * no);
        soma(2 * no + 1);
        const antes = t[no];
        t[no] = Math.max(t[2 * no], t[2 * no + 1]);
        marks[no] = 'refaz';
        snap(no, `${ctx} de volta ao ${nome(no)}: refaz o máximo, maior entre ${t[2 * no]} e ${t[2 * no + 1]} = ${t[no]}${antes === t[no] ? '' : ` (era ${antes})`}.`, no === 1);
      };
      soma(1);
    } else {
      const consulta = (no: number): number => {
        const [l, r] = trecho(no);
        const ctx = `Maior valor dos dias ${a} a ${b}:`;
        if (b < l || r < a) {
          marks[no] = 'fora';
          fora.push(no);
          return -Infinity;
        }
        if (a <= l && r <= b) {
          marks[no] = 'dentro';
          snap(no, `${ctx} o ${nome(no)} está todo dentro. O máximo guardado nele, ${t[no]}, já conta tudo o que foi somado ao trecho.`);
          return t[no];
        }
        marks[no] = 'parcial';
        snap(no, `${ctx} o ${nome(no)} está só em parte dentro. Vai descer.`);
        empurra(no, ctx);
        const e = consulta(2 * no);
        const d = consulta(2 * no + 1);
        return Math.max(e, d);
      };
      const r = consulta(1);
      snap(null, `Resposta de Q ${a} ${b}: ${r}. Confira nas temperaturas de verdade, embaixo das folhas.`, true);
    }
  });
  return evs;
}

const COR: Record<Kind, { stroke: string; fill: string; op: number; dash?: string }> = {
  fora: { stroke: 'var(--c-muted)', fill: 'var(--c-surface-2)', op: 1, dash: '4 4' },
  dentro: { stroke: 'var(--c-try)', fill: 'var(--c-try)', op: 0.28 },
  parcial: { stroke: 'var(--c-accent)', fill: 'var(--c-accent)', op: 0.12 },
  empurra: { stroke: 'var(--c-accent)', fill: 'var(--c-accent)', op: 0.25 },
  refaz: { stroke: 'var(--c-try)', fill: 'var(--c-try)', op: 0.18 },
};

export default function LazyViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const nodes = Array.from({ length: 2 * N - 1 }, (_, k) => k + 1);

  return (
    <VizFrame title="Lazy propagation: somando num trecho sem descer até as folhas" onKey={(d) => clamp(step + d)}>
      <div className="mb-3 flex flex-wrap gap-1.5 font-mono text-xs">
        {OPS.map(([t, a, b, x], i) => (
          <span key={i} className={`rounded-md border px-2 py-1 ${i === ev.op ? 'border-accent bg-accent/20 font-semibold' : i < ev.op ? 'border-line text-faint' : 'border-line text-muted'}`}>
            {t} {a} {b}{t === 'S' ? ` ${x}` : ''}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} 252`} className="w-full min-w-[440px] max-w-2xl" role="img" aria-label="Árvore de máximos com pendências, sobre as temperaturas de 8 dias">
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
            const pend = !leaf && ev.p[no] !== 0;
            return (
              <g key={no}>
                <rect x={x - w / 2} y={y - 14} width={w} height="28" rx={leaf ? 5 : 14} fill={c.fill} fillOpacity={c.op} stroke={ev.cur === no ? 'var(--c-accent)' : c.stroke} strokeWidth={ev.cur === no ? 3.2 : 1.8} strokeDasharray={c.dash} />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--c-fg)" opacity={kind === 'fora' ? 0.55 : 1}>{ev.t[no]}</text>
                {pend && (
                  <g>
                    <rect x={x + w / 2 - 12} y={y - 26} width="28" height="16" rx="8" fill="var(--c-accent)" />
                    <text x={x + w / 2 + 2} y={y - 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--c-accent-fg)">{sinal(ev.p[no])}</text>
                  </g>
                )}
                {leaf && <text x={x} y={y + 30} textAnchor="middle" fontSize="10" fill="var(--c-muted)">dia {no - N + 1}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 grid grid-cols-8 gap-1 text-center">
        {ev.dias.slice(1).map((d, i) => (
          <div key={i} className="min-w-0">
            <div className="font-mono text-sm">{d}</div>
            <div className="text-[10px] text-muted">real</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-faint">
        Embaixo, a temperatura real de cada dia, para conferir. Nas folhas, o valor guardado pode estar atrasado: ele só é corrigido quando alguém desce até lá. Selo <span className="text-accent">laranja</span>: pendência do nó. Borda grossa: o nó deste passo. <span className="text-try">Azul</span>: nó usado inteiro ou refeito. Tracejado: nó fora do trecho.
      </p>
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
