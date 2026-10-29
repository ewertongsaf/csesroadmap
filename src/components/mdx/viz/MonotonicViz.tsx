import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Pilha monotônica (próximo maior à direita) e deque monotônica (máximo da janela), passo a passo.
type Mode = 'stack' | 'deque';

const DATA: Record<Mode, { arr: number[]; k?: number; title: string }> = {
  stack: { arr: [73, 74, 75, 71, 69, 72, 76, 73], title: 'Pilha monotônica: próximo dia mais quente' },
  deque: { arr: [4, 2, 12, 3, 8, 5, 1, 7], k: 3, title: 'Deque monotônica: máximo de cada janela (k = 3)' },
};

interface Ev {
  i: number; // posição sendo processada (-1 = início)
  box: number[]; // índices na pilha/deque, do fundo/frente para o topo/fundo
  answers: (number | null)[];
  text: string;
}

function simulate(mode: Mode): Ev[] {
  const { arr, k = 0 } = DATA[mode];
  const n = arr.length;
  const ans: (number | null)[] = Array(mode === 'stack' ? n : n - k + 1).fill(null);
  const box: number[] = [];
  const evs: Ev[] = [{ i: -1, box: [], answers: [...ans], text: 'Começamos com a estrutura vazia.' }];
  for (let i = 0; i < n; i++) {
    const x = arr[i];
    if (mode === 'stack') {
      const popped: string[] = [];
      while (box.length && arr[box[box.length - 1]] < x) {
        const j = box.pop()!;
        ans[j] = i - j;
        popped.push(`dia ${j} (${arr[j]}°) espera ${i - j}`);
      }
      box.push(i);
      evs.push({
        i,
        box: [...box],
        answers: [...ans],
        text: popped.length
          ? `${x}° é mais quente que o topo: desempilha ${popped.join('; ')}. Depois empilha o dia ${i}.`
          : `${x}° não é mais quente que o topo: o dia ${i} só entra na pilha, esperando.`,
      });
    } else {
      const back: number[] = [];
      while (box.length && arr[box[box.length - 1]] <= x) back.push(arr[box.pop()!]);
      box.push(i);
      let front: number | null = null;
      if (box[0] <= i - k) front = arr[box.shift()!];
      if (i >= k - 1) ans[i - k + 1] = arr[box[0]];
      const parts = [
        back.length ? `${back.join(', ')} sai${back.length > 1 ? 'em' : ''} por trás (≤ ${x}: nunca mais serão máximo)` : `nada sai por trás`,
        front !== null ? `${front} sai pela frente (saiu da janela)` : '',
        i >= k - 1 ? `máximo da janela = frente = ${arr[box[0]]}` : `a janela ainda não tem ${k} elementos`,
      ].filter(Boolean);
      evs.push({ i, box: [...box], answers: [...ans], text: `Entra ${x}: ${parts.join('; ')}.` });
    }
  }
  return evs;
}

export default function MonotonicViz({ mode }: { mode: Mode }) {
  const evs = useMemo(() => simulate(mode), [mode]);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const { arr, k = 0, title } = DATA[mode];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const inWindow = (j: number) => mode === 'deque' && ev.i >= 0 && j <= ev.i && j > ev.i - k;

  return (
    <VizFrame title={title} onKey={(d) => clamp(step + d)}>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1">
          {arr.map((v, j) => (
            <div key={j} className="flex w-11 flex-col items-center gap-1">
              <span className="text-[10px] tabular-nums text-faint">{j}</span>
              <span
                className={`grid h-10 w-10 place-items-center rounded-md border font-mono text-sm ${
                  j === ev.i ? 'border-accent bg-accent/25' : ev.box.includes(j) ? 'border-try bg-try/15' : inWindow(j) ? 'border-line bg-surface-2' : j < ev.i ? 'border-line text-faint' : 'border-line'
                }`}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-faint">{mode === 'stack' ? 'Pilha (fundo → topo)' : 'Deque (frente → fundo)'}</p>
          <p className="mt-1 min-h-7 font-mono">{ev.box.length ? ev.box.map((j) => `${arr[j]}`).join('  ') : '(vazia)'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-faint">{mode === 'stack' ? 'Dias de espera' : 'Máximos das janelas'}</p>
          <p className="mt-1 font-mono">{ev.answers.map((a) => (a === null ? '·' : a)).join(' ')}</p>
        </div>
      </div>
      <p className="mt-3 min-h-12 text-[15px]">{step === 0 ? ev.text : ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
