import { useState } from 'react';
import { VizFrame } from './StepControls.tsx';

// Quantas operações cada complexidade faz para um n, e se cabe em ~1 s.
const NS = [10, 20, 100, 500, 5000, 1e5, 2e5, 1e6, 1e7, 1e9, 1e18];
const CLASSES: { label: string; f: (n: number) => number }[] = [
  { label: 'O(log n)', f: (n) => Math.log2(n) },
  { label: 'O(√n)', f: (n) => Math.sqrt(n) },
  { label: 'O(n)', f: (n) => n },
  { label: 'O(n log n)', f: (n) => n * Math.log2(n) },
  { label: 'O(n√n)', f: (n) => n * Math.sqrt(n) },
  { label: 'O(n²)', f: (n) => n * n },
  { label: 'O(n³)', f: (n) => n ** 3 },
  { label: 'O(2ⁿ)', f: (n) => 2 ** n },
  { label: 'O(n!)', f: (n) => (n > 170 ? Infinity : Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1)) },
];

function fmt(x: number) {
  if (!Number.isFinite(x) || x > 1e300) return '∞ (astronômico)';
  if (x < 1000) return x < 10 ? x.toFixed(1).replace('.', ',') : String(Math.round(x));
  const e = Math.floor(Math.log10(x));
  const m = x / 10 ** e;
  return `${m.toFixed(1).replace('.', ',')}·10^${e}`;
}

function verdict(ops: number) {
  if (ops <= 1e8) return { text: 'passa com folga', cls: 'text-ok' };
  if (ops <= 5e8) return { text: 'apertado: depende da constante', cls: 'text-accent' };
  return { text: 'TLE', cls: 'text-danger' };
}

const nLabel = (n: number) => (n >= 1e5 ? fmt(n).replace(',0', '') : String(n));

export default function LimitsCalculator() {
  const [i, setI] = useState(6);
  const n = NS[i];
  return (
    <VizFrame title="Calculadora de limites">
      <label className="block text-sm text-muted" htmlFor="lim-n">
        Arraste para escolher o limite de <span className="font-mono">n</span> do enunciado:
      </label>
      <div className="mt-2 flex items-center gap-4">
        <input id="lim-n" type="range" min={0} max={NS.length - 1} value={i} onChange={(e) => setI(Number(e.target.value))} className="flex-1 accent-[var(--c-accent)]" />
        <span className="w-24 text-right font-mono text-lg">n = {nLabel(n)}</span>
      </div>
      <table className="mt-5 w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-faint">
            <th className="py-1.5 font-medium">Complexidade</th>
            <th className="py-1.5 font-medium">Operações</th>
            <th className="py-1.5 font-medium">Em ~1 s</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {CLASSES.map((c) => {
            const ops = c.f(n);
            const v = verdict(ops);
            return (
              <tr key={c.label}>
                <td className="py-1.5 font-mono">{c.label}</td>
                <td className="py-1.5 font-mono tabular-nums">{fmt(ops)}</td>
                <td className={`py-1.5 ${v.cls}`}>{v.text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-muted">
        Regra de bolso: C++ faz algo como 10⁸ a 5·10⁸ operações simples por segundo. Acima disso, procure outra ideia, não otimizações de constante.
      </p>
    </VizFrame>
  );
}
