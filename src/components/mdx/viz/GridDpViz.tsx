import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Tabela de duas dimensões sendo preenchida: o tabuleiro de moedas ou a transformação de palavras.
type Mode = 'moedas' | 'palavras';
const GRID = [
  [1, 4, 8, 6],
  [6, 9, 1, 8],
  [3, 4, 1, 5],
];
const A = 'casa';
const B = 'saco';

interface Ev {
  i: number;
  j: number;
  read: [number, number][];
  pick: [number, number] | null;
  table: (number | null)[][];
  text: string;
}
const key = (i: number, j: number) => `${i},${j}`;

function simulate(mode: Mode): Ev[] {
  const evs: Ev[] = [];
  if (mode === 'moedas') {
    const n = GRID.length;
    const m = GRID[0].length;
    const t: (number | null)[][] = GRID.map((r) => r.map(() => null));
    evs.push({ i: -1, j: -1, read: [], pick: null, table: t.map((r) => [...r]), text: 'A tabela começa vazia. Vamos preencher linha por linha, da esquerda para a direita.' });
    for (let i = 0; i < n; i++)
      for (let j = 0; j < m; j++) {
        const up = i > 0 ? t[i - 1][j]! : null;
        const left = j > 0 ? t[i][j - 1]! : null;
        const read: [number, number][] = [];
        if (up !== null) read.push([i - 1, j]);
        if (left !== null) read.push([i, j - 1]);
        const pick: [number, number] | null = up === null && left === null ? null : left === null || (up !== null && up > left) ? [i - 1, j] : [i, j - 1];
        const before = pick ? t[pick[0]][pick[1]]! : 0;
        t[i][j] = before + GRID[i][j];
        const text =
          pick === null
            ? `Casa inicial: vale as próprias moedas, ${GRID[i][j]}.`
            : read.length === 1
              ? `Só dá para vir ${up !== null ? 'de cima' : 'da esquerda'}: ${before} + ${GRID[i][j]} = ${t[i][j]}.`
              : `De cima vem ${up}, da esquerda vem ${left}. O maior é ${before}: ${before} + ${GRID[i][j]} = ${t[i][j]}.`;
        evs.push({ i, j, read, pick, table: t.map((r) => [...r]), text });
      }
  } else {
    const n = A.length;
    const m = B.length;
    const t: (number | null)[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(null));
    for (let i = 0; i <= n; i++) t[i][0] = i;
    for (let j = 0; j <= m; j++) t[0][j] = j;
    evs.push({ i: -1, j: -1, read: [], pick: null, table: t.map((r) => [...r]), text: 'Casos base: transformar em palavra vazia custa apagar tudo; partir da vazia custa inserir tudo.' });
    for (let i = 1; i <= n; i++)
      for (let j = 1; j <= m; j++) {
        const x = A[i - 1];
        const y = B[j - 1];
        if (x === y) {
          t[i][j] = t[i - 1][j - 1];
          evs.push({ i, j, read: [[i - 1, j - 1]], pick: [i - 1, j - 1], table: t.map((r) => [...r]), text: `"${x}" e "${y}" são iguais: a letra fica parada. Copia a diagonal: ${t[i][j]}.` });
        } else {
          const up = t[i - 1][j]!;
          const left = t[i][j - 1]!;
          const pick: [number, number] = up <= left ? [i - 1, j] : [i, j - 1];
          t[i][j] = 1 + Math.min(up, left);
          evs.push({
            i,
            j,
            read: [[i - 1, j], [i, j - 1]],
            pick,
            table: t.map((r) => [...r]),
            text: `"${x}" e "${y}" são diferentes: apagar "${x}" (cima: ${up}) ou inserir "${y}" (esquerda: ${left}). 1 + min(${up}, ${left}) = ${t[i][j]}.`,
          });
        }
      }
  }
  return evs;
}

export default function GridDpViz({ mode }: { mode: Mode }) {
  const evs = useMemo(() => simulate(mode), [mode]);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const read = new Set(ev.read.map(([i, j]) => key(i, j)));
  const pick = ev.pick ? key(ev.pick[0], ev.pick[1]) : '';
  const cell = 'grid h-10 w-11 place-items-center rounded-md border font-mono text-sm';
  const head = 'grid h-10 w-11 place-items-center text-sm font-semibold text-muted';

  return (
    <VizFrame title={mode === 'moedas' ? 'A tabela do tabuleiro, casa por casa' : `Transformando "${A}" em "${B}", casa por casa`} onKey={(d) => clamp(step + d)}>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-max flex-col gap-1">
          {mode === 'palavras' && (
            <div className="flex gap-1">
              <span className={head} />
              {['∅', ...B].map((ch, j) => (
                <span key={j} className={`${head} ${j === ev.j ? 'text-accent' : ''}`}>{ch}</span>
              ))}
            </div>
          )}
          {ev.table.map((r, i) => (
            <div key={i} className="flex gap-1">
              {mode === 'palavras' && <span className={`${head} ${i === ev.i ? 'text-accent' : ''}`}>{i === 0 ? '∅' : A[i - 1]}</span>}
              {r.map((v, j) => {
                const k = key(i, j);
                const cur = i === ev.i && j === ev.j;
                return (
                  <span key={j} className={`${cell} relative ${cur ? 'border-accent bg-accent/25 font-semibold' : k === pick ? 'border-try bg-try/15' : read.has(k) ? 'border-line bg-surface-2 text-muted' : 'border-line'}`}>
                    {v ?? ''}
                    {mode === 'moedas' && <span className="absolute top-0.5 right-1 text-[9px] text-faint">{GRID[i][j]}</span>}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-faint">
        {mode === 'moedas' && 'O número pequeno no canto é a quantidade de moedas da casa. '}
        <span className="text-accent">Laranja</span>: casa calculada agora. <span className="text-try">Azul</span>: a vizinha escolhida.
      </p>
      <p className="mt-3 min-h-12 text-[15px]">{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
