import { useState } from 'react';
import { VizFrame } from './StepControls.tsx';

// Laboratório de containers da STL: o leitor faz operações e vê o conteúdo e o resultado.
// Simula o comportamento de set, multiset, map<int,int> e priority_queue<int> (máximo no topo).
type Mode = 'set' | 'multiset' | 'map' | 'pq';

interface LogLine {
  code: string;
  result: string;
}

const TITLE: Record<Mode, string> = {
  set: 'Laboratório: set<int>',
  multiset: 'Laboratório: multiset<int>',
  map: 'Laboratório: map<int, int>',
  pq: 'Laboratório: priority_queue<int>',
};

const INITIAL: Record<Mode, number[]> = {
  set: [1, 3, 5, 8],
  multiset: [3, 5, 5, 8],
  map: [],
  pq: [4, 9, 1],
};

export default function ContainerPlayground({ mode }: { mode: Mode }) {
  const name = mode === 'map' ? 'm' : mode === 'pq' ? 'pq' : 's';
  const [items, setItems] = useState<number[]>(() => [...INITIAL[mode]].sort((a, b) => a - b));
  const [freq, setFreq] = useState<Map<number, number>>(() => new Map([[3, 2], [7, 1]]));
  const [value, setValue] = useState('5');
  const [log, setLog] = useState<LogLine[]>([]);
  const [mark, setMark] = useState<number | null>(null); // índice apontado por lower/upper_bound (items.length = end())

  const x = Number(value);
  const valid = value.trim() !== '' && Number.isInteger(x);
  const push = (code: string, result: string) => setLog((l) => [{ code, result }, ...l].slice(0, 8));

  const ops: { label: string; run: () => void }[] = (() => {
    if (mode === 'map')
      return [
        {
          label: `${name}[x]++`,
          run: () => {
            const n = new Map(freq);
            const before = n.get(x);
            n.set(x, (before ?? 0) + 1);
            setFreq(n);
            push(`m[${x}]++`, before === undefined ? `a chave ${x} não existia: foi criada com 0 e virou 1` : `${before} → ${before + 1}`);
          },
        },
        {
          label: 'cout << m[x]',
          run: () => {
            const n = new Map(freq);
            const before = n.get(x);
            if (before === undefined) n.set(x, 0);
            setFreq(n);
            push(`cout << m[${x}]`, before === undefined ? `0, e a chave ${x} foi CRIADA só por ter sido consultada` : String(before));
          },
        },
        { label: 'm.count(x)', run: () => push(`m.count(${x})`, `${freq.has(x) ? 1 : 0} (não cria a chave)`) },
        {
          label: 'm.erase(x)',
          run: () => {
            const n = new Map(freq);
            const had = n.delete(x);
            setFreq(n);
            push(`m.erase(${x})`, had ? `removeu a chave ${x}` : 'nada a remover');
          },
        },
      ];
    if (mode === 'pq')
      return [
        {
          label: 'pq.push(x)',
          run: () => {
            setItems([...items, x].sort((a, b) => a - b));
            push(`pq.push(${x})`, 'ok');
          },
        },
        { label: 'pq.top()', run: () => push('pq.top()', items.length ? String(items[items.length - 1]) : 'ERRO: fila vazia (comportamento indefinido)') },
        {
          label: 'pq.pop()',
          run: () => {
            if (!items.length) return push('pq.pop()', 'ERRO: fila vazia (comportamento indefinido)');
            push('pq.pop()', `removeu o ${items[items.length - 1]} (pop não devolve o valor)`);
            setItems(items.slice(0, -1));
          },
        },
        { label: 'pq.size()', run: () => push('pq.size()', String(items.length)) },
      ];
    const isMulti = mode === 'multiset';
    const lb = () => items.findIndex((v) => v >= x);
    const ub = () => items.findIndex((v) => v > x);
    const at = (i: number) => (i === -1 ? items.length : i);
    const show = (i: number) => (i === items.length ? 'end() (não existe)' : `aponta para o ${items[i]}`);
    return [
      {
        label: `${name}.insert(x)`,
        run: () => {
          if (!isMulti && items.includes(x)) return push(`s.insert(${x})`, `${x} já estava: nada muda`);
          setItems([...items, x].sort((a, b) => a - b));
          setMark(null);
          push(`${name}.insert(${x})`, 'ok');
        },
      },
      {
        label: `${name}.erase(x)`,
        run: () => {
          const n = items.filter((v) => v !== x).length;
          const removed = items.length - n;
          setItems(items.filter((v) => v !== x));
          setMark(null);
          push(`${name}.erase(${x})`, removed === 0 ? 'nada a remover' : `removeu ${removed} ${removed === 1 ? 'cópia' : 'cópias'}${isMulti && removed > 1 ? ': TODAS!' : ''}`);
        },
      },
      ...(isMulti
        ? [
            {
              label: 's.erase(s.find(x))',
              run: () => {
                const i = items.indexOf(x);
                if (i === -1) return push(`s.erase(s.find(${x}))`, 'ERRO: find devolveu end(), e apagar end() é comportamento indefinido');
                setItems(items.filter((_, j) => j !== i));
                setMark(null);
                push(`s.erase(s.find(${x}))`, 'removeu UMA cópia');
              },
            },
          ]
        : []),
      { label: `${name}.count(x)`, run: () => push(`${name}.count(${x})`, String(items.filter((v) => v === x).length)) },
      {
        label: `${name}.lower_bound(x)`,
        run: () => {
          const i = at(lb());
          setMark(i);
          push(`${name}.lower_bound(${x})`, `primeiro ≥ ${x}: ${show(i)}`);
        },
      },
      {
        label: `${name}.upper_bound(x)`,
        run: () => {
          const i = at(ub());
          setMark(i);
          push(`${name}.upper_bound(${x})`, `primeiro > ${x}: ${show(i)}`);
        },
      },
    ];
  })();

  const btn = 'rounded-md border border-line px-2.5 py-1.5 font-mono text-xs hover:border-accent hover:text-accent disabled:opacity-40';
  return (
    <VizFrame title={TITLE[mode]}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-muted">
          x =
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="numeric"
            className="w-20 rounded-lg border border-line bg-bg px-2 py-1 font-mono text-fg outline-none focus:border-accent/60"
          />
        </label>
        {ops.map((o) => (
          <button key={o.label} type="button" disabled={!valid} onClick={o.run} className={btn}>
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs uppercase tracking-wider text-faint">
          {mode === 'pq' ? 'Conteúdo (o topo é o maior, à direita)' : mode === 'map' ? 'Conteúdo (chave → valor, ordenado pela chave)' : 'Conteúdo (sempre em ordem)'}
        </p>
        <div className="flex min-h-11 flex-wrap items-center gap-1.5 font-mono text-sm">
          {mode === 'map' ? (
            [...freq.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => (
              <span key={k} className="rounded-md border border-line bg-surface-2 px-2 py-1">
                {k} → {v}
              </span>
            ))
          ) : (
            <>
              {items.map((v, i) => (
                <span
                  key={`${v}-${i}`}
                  className={`rounded-md border px-2.5 py-1 ${
                    i === mark ? 'border-accent bg-accent/25' : mode === 'pq' && i === items.length - 1 ? 'border-ok/60 bg-ok/10' : 'border-line bg-surface-2'
                  }`}
                >
                  {v}
                </span>
              ))}
              {mode !== 'pq' && (
                <span className={`rounded-md border border-dashed px-2 py-1 text-xs ${mark === items.length ? 'border-accent text-accent' : 'border-line text-faint'}`}>end()</span>
              )}
            </>
          )}
          {mode !== 'map' && items.length === 0 && <span className="text-faint">(vazio)</span>}
        </div>
      </div>

      <ol className="mt-5 space-y-1 font-mono text-[12.5px]">
        {log.length === 0 && <li className="font-sans text-sm text-faint">Escolha um x e clique numa operação. As mais recentes aparecem em cima.</li>}
        {log.map((l, i) => (
          <li key={log.length - i} className={i === 0 ? 'text-fg' : 'text-muted'}>
            <span className="text-accent">{l.code}</span> <span className="font-sans">→ {l.result}</span>
          </li>
        ))}
      </ol>
    </VizFrame>
  );
}
