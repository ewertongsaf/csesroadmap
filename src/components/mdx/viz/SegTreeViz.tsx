import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Segment tree de mínimo sobre 8 posições. Os passos seguem os eventos do exemplo da aula:
// na consulta, cada nó visitado é classificado (fora, dentro, parcial); na mudança, o caminho desce e os mínimos são refeitos na volta.
const N = 8;
const INICIAL = [0, 5, 3, 8, 6, 2, 7, 4, 6];
const OPS: ['Q' | 'M', number, number][] = [['Q', 1, 8], ['Q', 3, 4], ['M', 5, 9], ['Q', 3, 7], ['M', 2, 7], ['Q', 1, 4]];
const W = 496;
const LEVEL_Y = [26, 80, 134, 188];

type Kind = 'fora' | 'dentro' | 'parcial' | 'caminho' | 'refeito';
interface Ev {
  op: number;
  t: number[];
  cur: number | null;
  marks: Record<number, Kind>;
  range: [number, number] | null;
  text: string;
  done: boolean;
}

// posição de cada nó no desenho: nível = floor(log2(no)); os 2^nível nós do nível dividem a largura
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
  for (let i = 1; i <= N; i++) t[N + i - 1] = INICIAL[i];
  for (let no = N - 1; no >= 1; no--) t[no] = Math.min(t[2 * no], t[2 * no + 1]);
  const evs: Ev[] = [{ op: -1, t: [...t], cur: null, marks: {}, range: null, text: 'Embaixo, as folhas: os 8 preços. Cada nó de cima guarda o menor valor entre os seus dois filhos. A raiz guarda o menor de todos.', done: false }];
  const nome = (no: number) => {
    const [l, r] = trecho(no);
    return l === r ? `nó ${no} (posição ${l})` : `nó ${no} (posições ${l} a ${r})`;
  };
  OPS.forEach(([tipo, p, q], op) => {
    const marks: Record<number, Kind> = {};
    const snap = (cur: number | null, range: [number, number], text: string, done = false) => evs.push({ op, t: [...t], cur, marks: { ...marks }, range, text, done });
    if (tipo === 'Q') {
      const usados: number[] = [];
      const consulta = (no: number): number => {
        const [l, r] = trecho(no);
        if (q < l || r < p) {
          marks[no] = 'fora';
          snap(no, [p, q], `Menor de ${p} a ${q}: o ${nome(no)} está todo fora do trecho. Não contribui e ninguém abaixo dele é visitado.`);
          return Infinity;
        }
        if (p <= l && r <= q) {
          marks[no] = 'dentro';
          usados.push(t[no]);
          snap(no, [p, q], `Menor de ${p} a ${q}: o ${nome(no)} está todo dentro do trecho. Usa o valor pronto, ${t[no]}, sem descer.`);
          return t[no];
        }
        marks[no] = 'parcial';
        snap(no, [p, q], `Menor de ${p} a ${q}: o ${nome(no)} está só em parte dentro do trecho. Pergunta aos dois filhos.`);
        const e = consulta(2 * no);
        const d = consulta(2 * no + 1);
        return Math.min(e, d);
      };
      const r = consulta(1);
      snap(null, [p, q], usados.length === 1 ? `Resposta: ${r}.` : `Resposta: o menor entre ${usados.join(', ')} é ${r}.`, true);
    } else {
      const caminho: number[] = [];
      let no = 1;
      while (no < N) {
        const [l, r] = trecho(no);
        const m = (l + r) >> 1;
        caminho.push(no);
        marks[no] = 'caminho';
        snap(no, [p, p], `Posição ${p} passa a valer ${q}: no ${nome(no)}, a posição ${p} fica na metade ${p <= m ? 'esquerda' : 'direita'}. Desce.`);
        no = p <= m ? 2 * no : 2 * no + 1;
      }
      const antes = t[no];
      t[no] = q;
      marks[no] = 'refeito';
      snap(no, [p, p], `Chegou à folha da posição ${p}: troca ${antes} por ${q}. Agora volta refazendo os mínimos.`);
      for (let i = caminho.length - 1; i >= 0; i--) {
        const c = caminho[i];
        const old = t[c];
        t[c] = Math.min(t[2 * c], t[2 * c + 1]);
        marks[c] = 'refeito';
        snap(c, [p, p], `O ${nome(c)} refaz a conta: menor entre ${t[2 * c]} e ${t[2 * c + 1]} é ${t[c]}${old === t[c] ? ' (não mudou)' : ` (era ${old})`}.${i === 0 ? ' Fim: só 4 nós foram tocados.' : ''}`, i === 0);
      }
    }
  });
  return evs;
}

const COR: Record<Kind, { stroke: string; fill: string; op: number; dash?: string }> = {
  fora: { stroke: 'var(--c-muted)', fill: 'var(--c-surface-2)', op: 1, dash: '4 4' },
  dentro: { stroke: 'var(--c-try)', fill: 'var(--c-try)', op: 0.28 },
  parcial: { stroke: 'var(--c-accent)', fill: 'var(--c-accent)', op: 0.14 },
  caminho: { stroke: 'var(--c-accent)', fill: 'var(--c-accent)', op: 0.14 },
  refeito: { stroke: 'var(--c-try)', fill: 'var(--c-try)', op: 0.28 },
};

export default function SegTreeViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const nodes = Array.from({ length: 2 * N - 1 }, (_, k) => k + 1);

  return (
    <VizFrame title="Segment tree: quais nós cada operação visita" onKey={(d) => clamp(step + d)}>
      <div className="mb-3 flex flex-wrap gap-1.5 font-mono text-xs">
        {OPS.map(([t, p, q], i) => (
          <span key={i} className={`rounded-md border px-2 py-1 ${i === ev.op ? 'border-accent bg-accent/20 font-semibold' : i < ev.op ? 'border-line text-faint' : 'border-line text-muted'}`}>
            {t} {p} {q}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} 232`} className="w-full max-w-2xl min-w-[440px]" role="img" aria-label="Árvore de 15 nós sobre os 8 preços">
          {nodes.filter((no) => no > 1).map((no) => {
            const a = pos(no);
            const b = pos(no >> 1);
            return <line key={no} x1={a.x} y1={a.y - 14} x2={b.x} y2={b.y + 14} stroke="var(--c-line)" strokeWidth="1.5" />;
          })}
          {nodes.map((no) => {
            const { x, y, lv } = pos(no);
            const kind = ev.marks[no];
            const c = kind ? COR[kind] : { stroke: 'var(--c-line)', fill: 'var(--c-surface-2)', op: 1, dash: undefined };
            const isCur = ev.cur === no;
            const leaf = lv === 3;
            const [l] = trecho(no);
            const inRange = leaf && ev.range && l >= ev.range[0] && l <= ev.range[1];
            const w = leaf ? 40 : 46;
            return (
              <g key={no}>
                <rect x={x - w / 2} y={y - 14} width={w} height="28" rx={leaf ? 5 : 14} fill={c.fill} fillOpacity={c.op} stroke={c.stroke} strokeWidth={isCur ? 3.2 : 1.8} strokeDasharray={c.dash} />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--c-fg)" opacity={kind === 'fora' ? 0.55 : 1}>{ev.t[no]}</text>
                <text x={x + w / 2 + 3} y={y - 7} fontSize="8.5" fill="var(--c-muted)">{no}</text>
                {leaf && <text x={x} y={y + 30} textAnchor="middle" fontSize="10" fontWeight={inRange ? 700 : 400} fill={inRange ? 'var(--c-accent)' : 'var(--c-muted)'}>{l}</text>}
                {leaf && inRange && <rect x={x - w / 2} y={y + 34} width={w} height="3" rx="1.5" fill="var(--c-accent)" />}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-2 text-xs text-faint">
        O número pequeno ao lado é o índice do nó; embaixo das folhas, a posição no vetor (as da operação atual ficam sublinhadas). <span className="text-accent">Laranja</span>: nó parcial ou no caminho. <span className="text-try">Azul</span>: valor usado na resposta ou refeito. Tracejado: nó fora do trecho. Borda grossa: o nó deste passo.
      </p>
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
