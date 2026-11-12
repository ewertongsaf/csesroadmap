import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// A linha da mochila sendo atualizada, casa por casa. Dá para trocar o sentido do laço e ver o item repetir.
const ITEMS = [
  { name: 'Fotos', t: 6, v: 8 },
  { name: 'Músicas', t: 4, v: 10 },
  { name: 'Filme', t: 7, v: 11 },
  { name: 'Livros', t: 2, v: 6 },
];
const C = 10;

interface Ev {
  item: number; // -1 = início
  c: number;
  src: number;
  table: number[];
  changed: boolean;
  text: string;
}

function simulate(backward: boolean): Ev[] {
  const m: number[] = Array(C + 1).fill(0);
  const evs: Ev[] = [{ item: -1, c: -1, src: -1, table: [...m], changed: false, text: 'Sem nenhum arquivo considerado, toda capacidade vale 0.' }];
  ITEMS.forEach((it, k) => {
    const cs: number[] = [];
    if (backward) for (let c = C; c >= it.t; c--) cs.push(c);
    else for (let c = it.t; c <= C; c++) cs.push(c);
    for (const c of cs) {
      const take = m[c - it.t] + it.v;
      const changed = take > m[c];
      const text = `${it.name} (${it.t} GB, nota ${it.v}), capacidade ${c}: não levar = ${m[c]}; levar = melhor[${c - it.t}] + ${it.v} = ${m[c - it.t]} + ${it.v} = ${take}. ${changed ? `Fica ${take}.` : `Fica ${m[c]}.`}`;
      if (changed) m[c] = take;
      evs.push({ item: k, c, src: c - it.t, table: [...m], changed, text });
    }
  });
  return evs;
}

export default function KnapsackViz() {
  const [backward, setBackward] = useState(true);
  const evs = useMemo(() => simulate(backward), [backward]);
  const [step, setStep] = useState(0);
  const ev = evs[Math.min(step, evs.length - 1)];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const final = evs[evs.length - 1].table[C];

  return (
    <VizFrame title="A linha da mochila, uma casa por vez" onKey={(d) => clamp(step + d)}>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Laço das capacidades:</span>
        {([[true, 'de trás para a frente'], [false, 'para a frente']] as const).map(([b, label]) => (
          <button
            key={label}
            type="button"
            aria-pressed={backward === b}
            onClick={() => {
              setBackward(b);
              setStep(0);
            }}
            className={`rounded-md border px-2.5 py-1 ${backward === b ? 'border-accent bg-accent/15 font-medium' : 'border-line text-muted hover:text-fg'}`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted">resultado final: <span className={`font-semibold tabular-nums ${backward ? 'text-ok' : 'text-danger'}`}>{final}</span></span>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
        {ITEMS.map((it, k) => (
          <span key={it.name} className={`rounded-md border px-2 py-1 ${k === ev.item ? 'border-accent bg-accent/15 font-medium' : k < ev.item ? 'border-line text-faint' : 'border-line text-muted'}`}>
            {it.name} · {it.t} GB · nota {it.v}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1">
          {ev.table.map((v, c) => (
            <div key={c} className="flex flex-col items-center gap-1">
              <span className="text-[10px] tabular-nums text-faint">{c}</span>
              <span className={`grid h-10 w-10 place-items-center rounded-md border font-mono text-sm ${c === ev.c ? `border-accent bg-accent/25 ${ev.changed ? 'font-semibold' : ''}` : c === ev.src ? 'border-try bg-try/15' : 'border-line'}`}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-faint">
        <span className="text-accent">Laranja</span>: capacidade sendo atualizada. <span className="text-try">Azul</span>: a casa lida, <code>melhor[c − tamanho]</code>.
        {!backward && ' Para a frente, a casa azul pode já conter o arquivo atual: ele é levado mais de uma vez.'}
      </p>
      <p className="mt-3 min-h-16 text-[15px]">{ev.text}</p>
      <div className="mt-3">
        <StepControls step={Math.min(step, evs.length - 1)} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
