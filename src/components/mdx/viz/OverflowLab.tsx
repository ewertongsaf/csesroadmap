import { useState } from 'react';
import { VizFrame } from './StepControls.tsx';

// Mostra o valor exato e o que int / long long / módulo guardam de fato (BigInt simula o hardware).
const MOD = 1_000_000_007n;

function parse(s: string): bigint | null {
  const t = s.trim().replace(/[_\s.]/g, '');
  if (/^-?\d+$/.test(t)) return BigInt(t);
  const e = /^(-?\d+)e(\d+)$/i.exec(t); // aceita 1e9
  return e ? BigInt(e[1]) * 10n ** BigInt(e[2]) : null;
}

const fmt = (x: bigint) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export default function OverflowLab() {
  const [a, setA] = useState('100000');
  const [b, setB] = useState('100000');
  const [op, setOp] = useState<'*' | '+'>('*');
  const A = parse(a);
  const B = parse(b);

  const rows = (() => {
    if (A === null || B === null) return null;
    const exact = op === '*' ? A * B : A + B;
    const as32 = BigInt.asIntN(32, op === '*' ? BigInt.asIntN(32, A) * BigInt.asIntN(32, B) : BigInt.asIntN(32, A) + BigInt.asIntN(32, B));
    const as64 = BigInt.asIntN(64, exact);
    const mod = ((exact % MOD) + MOD) % MOD;
    return [
      { label: 'Valor exato', value: exact, note: '' },
      { label: 'int (32 bits)', value: as32, note: as32 === exact ? 'ok' : 'OVERFLOW: deu a volta' },
      { label: 'long long (64 bits)', value: as64, note: as64 === exact ? 'ok' : 'OVERFLOW: deu a volta' },
      { label: 'mod 10⁹+7', value: mod, note: '' },
    ];
  })();

  const input = 'w-full rounded-lg border border-line bg-bg px-3 py-2 font-mono text-sm outline-none focus:border-accent/60';
  return (
    <VizFrame title="Laboratório de overflow">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <input aria-label="a" className={input} value={a} onChange={(e) => setA(e.target.value)} />
        <select aria-label="operação" value={op} onChange={(e) => setOp(e.target.value as '*' | '+')} className="rounded-lg border border-line bg-bg px-2 py-2 font-mono">
          <option value="*">×</option>
          <option value="+">+</option>
        </select>
        <input aria-label="b" className={input} value={b} onChange={(e) => setB(e.target.value)} />
      </div>
      {rows ? (
        <dl className="mt-5 divide-y divide-line text-sm">
          {rows.map((r) => (
            <div key={r.label} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2">
              <dt className="text-muted">{r.label}</dt>
              <dd className="font-mono tabular-nums">
                {fmt(r.value)}
                {r.note && <span className={`ml-3 font-sans text-xs ${r.note === 'ok' ? 'text-ok' : 'text-danger'}`}>{r.note}</span>}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-sm text-danger">Digite inteiros (aceita 1e9).</p>
      )}
      <p className="mt-4 text-xs text-muted">
        Em C++, <code>a * b</code> com <code>a</code> e <code>b</code> do tipo <code>int</code> é calculado em 32 bits <em>antes</em> de ser guardado,
        mesmo que o destino seja <code>long long</code>. Teste 100000 × 100000.
      </p>
    </VizFrame>
  );
}
