import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Fenwick tree de 8 posições: cada bloco é desenhado sobre as posições que ele soma.
// Os passos seguem os eventos do exemplo da aula, um bloco visitado por vez.
const N = 8;
const INICIAL = [0, 3, 1, 4, 1, 5, 9, 2, 6];
const OPS: ['S' | 'A', number, number][] = [['S', 1, 7], ['A', 3, 2], ['S', 1, 7], ['S', 4, 7], ['A', 6, -4], ['S', 4, 7], ['S', 3, 3]];
const low = (i: number) => i & -i;
const CW = 52; // largura de uma posição
const X0 = 16;
const nivel = (i: number) => Math.log2(low(i)); // 0 para blocos de 1 posição, 3 para o de 8
const ROW_Y = (lv: number) => 16 + (3 - lv) * 38;
const A_Y = 16 + 4 * 38 + 6;

interface Ev {
  op: number;
  a: number[];
  bit: number[];
  cur: number | null; // bloco visitado neste passo
  plus: number[]; // blocos já somados
  minus: number[]; // blocos já subtraídos
  range: [number, number] | null; // posições envolvidas na operação
  text: string;
  done: boolean;
}

function simulate(): Ev[] {
  const a = [...INICIAL];
  const bit: number[] = Array(N + 1).fill(0);
  for (let k = 1; k <= N; k++) for (let i = k; i <= N; i += low(i)) bit[i] += a[k];
  const evs: Ev[] = [{ op: -1, a: [...a], bit: [...bit], cur: null, plus: [], minus: [], range: null, text: 'Cada barra é um bloco: bit[i] guarda a soma das posições que a barra cobre. O bloco termina na posição i.', done: false }];
  const bloco = (i: number) => (low(i) === 1 ? `a posição ${i}` : `as posições ${i - low(i) + 1} a ${i}`);
  OPS.forEach(([t, p, q], op) => {
    const snap = (cur: number | null, plus: number[], minus: number[], range: [number, number], text: string, done = false) =>
      evs.push({ op, a: [...a], bit: [...bit], cur, plus: [...plus], minus: [...minus], range, text, done });
    if (t === 'A') {
      a[p] += q;
      const sinal = q >= 0 ? `+${q}` : `${q}`;
      const vis: number[] = [];
      for (let i = p; i <= N; i += low(i)) {
        bit[i] += q;
        vis.push(i);
        const prox = i + low(i);
        snap(i, vis, [], [p, p], `Atualiza a posição ${p} (${sinal}): bit[${i}] cobre ${bloco(i)}, que inclui a ${p}. Passa a valer ${bit[i]}. ${prox <= N ? `Próximo: ${i} + ${low(i)} = ${prox}.` : `${i} + ${low(i)} = ${prox} passa de ${N}: acabou.`}`, prox > N);
      }
    } else {
      let s = 0;
      const plus: number[] = [];
      for (let i = q; i > 0; i -= low(i)) {
        s += bit[i];
        plus.push(i);
        const prox = i - low(i);
        snap(i, plus, [], [p, q], `Soma de ${p} a ${q}. Primeiro soma(${q}): bit[${i}] = ${bit[i]} cobre ${bloco(i)}. Acumulado: ${s}. ${prox > 0 ? `Próximo: ${i} − ${low(i)} = ${prox}.` : `${i} − ${low(i)} = 0: soma(${q}) = ${s}.`}`);
      }
      let m = 0;
      const minus: number[] = [];
      for (let i = p - 1; i > 0; i -= low(i)) {
        m += bit[i];
        minus.push(i);
        const prox = i - low(i);
        snap(i, plus, minus, [p, q], `Agora soma(${p - 1}), a parte que sobra à esquerda: bit[${i}] = ${bit[i]} cobre ${bloco(i)}. Acumulado: ${m}. ${prox > 0 ? `Próximo: ${i} − ${low(i)} = ${prox}.` : `Chegou a 0: soma(${p - 1}) = ${m}.`}`);
      }
      snap(null, plus, minus, [p, q], p === 1 ? `soma(0) não visita ninguém e vale 0. Resposta: ${s} − 0 = ${s}.` : `Resposta: soma(${q}) − soma(${p - 1}) = ${s} − ${m} = ${s - m}.`, true);
    }
  });
  return evs;
}

export default function FenwickViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const idx = Array.from({ length: N }, (_, k) => k + 1);

  return (
    <VizFrame title="Fenwick tree: quais blocos cada operação visita" onKey={(d) => clamp(step + d)}>
      <div className="mb-3 flex flex-wrap gap-1.5 font-mono text-xs">
        {OPS.map(([t, p, q], i) => (
          <span key={i} className={`rounded-md border px-2 py-1 ${i === ev.op ? 'border-accent bg-accent/20 font-semibold' : i < ev.op ? 'border-line text-faint' : 'border-line text-muted'}`}>
            {t} {p} {q}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${X0 * 2 + CW * N} 226`} className="w-full max-w-xl min-w-[420px]" role="img" aria-label="Os oito blocos da Fenwick tree sobre o vetor">
          {idx.map((i) => {
            const lv = nivel(i);
            const x = X0 + (i - low(i)) * CW + 3;
            const w = low(i) * CW - 6;
            const isCur = ev.cur === i;
            const isMinus = ev.minus.includes(i);
            const isPlus = ev.plus.includes(i) && !isMinus;
            const stroke = isCur ? 'var(--c-accent)' : isMinus ? 'var(--c-muted)' : isPlus ? 'var(--c-try)' : 'var(--c-line)';
            const fill = isMinus ? 'var(--c-surface-2)' : isPlus || isCur ? 'var(--c-try)' : 'var(--c-surface-2)';
            return (
              <g key={i}>
                <rect x={x} y={ROW_Y(lv)} width={w} height="30" rx="7" fill={fill} fillOpacity={isPlus || (isCur && !isMinus) ? 0.25 : 1} stroke={stroke} strokeWidth={isCur ? 3 : 1.8} strokeDasharray={isMinus ? '5 4' : undefined} />
                <text x={x + w - 9} y={ROW_Y(lv) + 25} textAnchor="end" fontSize="13" fontWeight="700" fill="var(--c-fg)">{ev.bit[i]}</text>
                <text x={x + 7} y={ROW_Y(lv) + 11} fontSize="8.5" fill="var(--c-muted)">bit[{i}]</text>
              </g>
            );
          })}
          {idx.map((i) => {
            const inRange = ev.range && i >= ev.range[0] && i <= ev.range[1];
            return (
              <g key={i}>
                <rect x={X0 + (i - 1) * CW + 3} y={A_Y} width={CW - 6} height="30" rx="5" fill={inRange ? 'var(--c-accent)' : 'none'} fillOpacity={inRange ? 0.18 : 1} stroke={inRange ? 'var(--c-accent)' : 'var(--c-line)'} strokeWidth="1.5" />
                <text x={X0 + (i - 1) * CW + CW / 2} y={A_Y + 20} textAnchor="middle" fontSize="14" fill="var(--c-fg)">{ev.a[i]}</text>
                <text x={X0 + (i - 1) * CW + CW / 2} y={A_Y + 46} textAnchor="middle" fontSize="10" fill="var(--c-muted)">{i}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-2 text-xs text-faint">
        Embaixo, o vetor (posições 1 a 8). Em cima, os blocos. <span className="text-accent">Laranja</span>: o bloco visitado agora e as posições da operação. <span className="text-try">Azul</span>: blocos já somados. Tracejado: blocos subtraídos.
      </p>
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
