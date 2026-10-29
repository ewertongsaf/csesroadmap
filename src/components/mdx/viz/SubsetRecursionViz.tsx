import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Árvore de recursão de "gerar subconjuntos" (pega / não pega), com a pilha `atual` e o desfazer.
const ITEMS = ['a', 'b', 'c'];
const N = ITEMS.length;

const CODE = [
  'void gera(int i) {',
  '    if (i == n) {',
  '        processa(atual); return;',
  '    }',
  '    gera(i + 1);       // sem a[i]',
  '    atual.pb(a[i]);    // com a[i]',
  '    gera(i + 1);',
  '    atual.pop_back();  // desfaz',
  '}',
];

interface Ev {
  node: string; // caminho de bits até o nó: '' raiz, '0' = não pegou a, '1' = pegou a…
  line: number;
  cur: string[];
  out: string[][];
  text: string;
}

function simulate(): Ev[] {
  const evs: Ev[] = [];
  const out: string[][] = [];
  const cur: string[] = [];
  const go = (i: number, node: string) => {
    if (i === N) {
      out.push([...cur]);
      evs.push({ node, line: 2, cur: [...cur], out: out.map((o) => [...o]), text: `i == n: processa {${cur.join(', ') || '∅'}}` });
      return;
    }
    evs.push({ node, line: 0, cur: [...cur], out: out.map((o) => [...o]), text: `gera(${i}): decidir sobre ${ITEMS[i]}. Primeiro sem ele.` });
    go(i + 1, `${node}0`);
    cur.push(ITEMS[i]);
    evs.push({ node, line: 5, cur: [...cur], out: out.map((o) => [...o]), text: `Voltou do ramo "sem ${ITEMS[i]}". Agora pega ${ITEMS[i]}: push.` });
    go(i + 1, `${node}1`);
    cur.pop();
    evs.push({ node, line: 7, cur: [...cur], out: out.map((o) => [...o]), text: `Terminou os dois ramos de ${ITEMS[i]}: pop_back desfaz a escolha antes de voltar.` });
  };
  go(0, '');
  return evs;
}

// Layout da árvore: folhas igualmente espaçadas, pais centralizados.
const W = 520;
const LEVEL_H = 62;
function pos(node: string) {
  const depth = node.length;
  const idx = node === '' ? 0 : parseInt(node, 2);
  const slots = 2 ** depth;
  return { x: ((idx + 0.5) / slots) * W, y: 24 + depth * LEVEL_H };
}

const allNodes = (() => {
  const r: string[] = [''];
  for (let d = 1; d <= N; d++) for (let k = 0; k < 2 ** d; k++) r.push(k.toString(2).padStart(d, '0'));
  return r;
})();

export default function SubsetRecursionViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const visited = new Set(evs.slice(0, step + 1).map((e) => e.node));
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));

  return (
    <VizFrame title="Recursão: gerar subconjuntos de {a, b, c}" onKey={(d) => clamp(step + d)}>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        <pre className="overflow-x-auto rounded-lg border border-line bg-bg p-3 font-mono text-[12.5px] leading-6">
          {CODE.map((l, i) => (
            <div key={i} className={i === ev.line ? '-mx-3 bg-accent/20 px-3 text-fg' : 'text-muted'}>
              {l}
            </div>
          ))}
        </pre>
        <svg viewBox={`0 0 ${W} ${24 + N * LEVEL_H + 30}`} className="w-full" role="img" aria-label="Árvore de recursão">
          {allNodes
            .filter((n) => n !== '')
            .map((n) => {
              const p = pos(n);
              const q = pos(n.slice(0, -1));
              const on = visited.has(n);
              return (
                <g key={`e${n}`}>
                  <line x1={q.x} y1={q.y} x2={p.x} y2={p.y} stroke={on ? 'var(--c-muted)' : 'var(--c-line)'} strokeWidth={on ? 1.6 : 1} />
                  <text x={(p.x + q.x) / 2 + (n.endsWith('1') ? 6 : -6)} y={(p.y + q.y) / 2} fontSize={10} textAnchor={n.endsWith('1') ? 'start' : 'end'} fill="var(--c-faint)">
                    {n.endsWith('1') ? `+${ITEMS[n.length - 1]}` : `−${ITEMS[n.length - 1]}`}
                  </text>
                </g>
              );
            })}
          {allNodes.map((n) => {
            const p = pos(n);
            const cur = n === ev.node;
            const on = visited.has(n);
            const leafSet = n.length === N ? `{${[...n].map((b, i) => (b === '1' ? ITEMS[i] : '')).join('') || '∅'}}` : '';
            return (
              <g key={`n${n}`}>
                <circle cx={p.x} cy={p.y} r={cur ? 11 : 8} fill={cur ? 'var(--c-accent)' : on ? 'var(--c-surface-2)' : 'var(--c-bg)'} stroke={cur ? 'var(--c-accent)' : on ? 'var(--c-muted)' : 'var(--c-line)'} strokeWidth={1.5} />
                {leafSet && (
                  <text x={p.x} y={p.y + 26} fontSize={11} textAnchor="middle" fill={on ? 'var(--c-fg)' : 'var(--c-faint)'} fontFamily="var(--font-mono)">
                    {leafSet}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-4 min-h-12 text-[15px]">{ev.text}</p>
      <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
        <p>
          <span className="text-muted">atual = </span>
          <span className="font-mono">[{ev.cur.join(', ')}]</span>
        </p>
        <p className="truncate">
          <span className="text-muted">processados: </span>
          <span className="font-mono">{ev.out.map((o) => `{${o.join('') || '∅'}}`).join(' ') || '—'}</span>
        </p>
      </div>
      <div className="mt-4">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
