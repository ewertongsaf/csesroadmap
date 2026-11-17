import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Euler tour: a DFS numera os funcionários na ordem em que entra neles; a equipe de v vira o trecho ent[v]..sai[v].
// Depois, cada bônus é uma soma num trecho (duas casas do vetor de diferenças) e cada pergunta, uma soma de prefixo.
const N = 8;
const PAI = [0, 0, 1, 1, 2, 2, 3, 6, 6];
const SAL = [0, 10, 7, 8, 5, 4, 6, 3, 2];
const POS: Record<number, [number, number]> = { 1: [220, 30], 2: [110, 95], 3: [330, 95], 4: [60, 165], 5: [160, 165], 6: [330, 165], 7: [280, 235], 8: [380, 235] };
type Op = ['B', number, number] | ['Q', number, 0];
const OPS: Op[] = [['Q', 7, 0], ['B', 3, 5], ['Q', 7, 0], ['B', 2, 2], ['B', 1, 1], ['Q', 5, 0], ['Q', 6, 0], ['Q', 1, 0]];

interface Ev { op: number; cur: number | null; ent: (number | null)[]; sai: (number | null)[]; ordem: number[]; dif: number[]; faixa: [number, number] | null; prefixo: number | null; text: string; done: boolean }

function simulate(): Ev[] {
  const filhos: number[][] = Array.from({ length: N + 1 }, () => []);
  for (let v = 2; v <= N; v++) filhos[PAI[v]].push(v);
  const ent: (number | null)[] = Array(N + 1).fill(null);
  const sai: (number | null)[] = Array(N + 1).fill(null);
  const ordem: number[] = [];
  const dif: number[] = Array(N + 2).fill(0);
  const evs: Ev[] = [];
  const snap = (e: Partial<Ev> & { text: string }) => evs.push({ op: -1, cur: null, faixa: null, prefixo: null, done: false, ent: [...ent], sai: [...sai], ordem: [...ordem], dif: [...dif], ...e });
  snap({ text: 'Uma empresa com 8 funcionários; o 1 é o diretor. A equipe de alguém é ele mais todos abaixo dele. Uma DFS a partir do 1 vai dar a cada funcionário uma posição numa fila.' });
  let rel = 0;
  const dfs = (v: number) => {
    ent[v] = ++rel;
    ordem.push(v);
    snap({ cur: v, text: `A DFS entra no funcionário ${v}: ele ganha a posição ${rel}.` });
    for (const u of filhos[v]) dfs(u);
    sai[v] = rel;
    snap({ cur: v, faixa: [ent[v] as number, rel], text: `A DFS sai do ${v}: toda a equipe dele foi numerada logo depois dele, nas posições ${ent[v]} a ${rel}. Anota sai[${v}] = ${rel}.` });
  };
  dfs(1);
  OPS.forEach(([t, v, x], op) => {
    const a = ent[v] as number;
    const b = sai[v] as number;
    if (t === 'B') {
      dif[a] += x;
      dif[b + 1] -= x;
      snap({ op, cur: v, faixa: [a, b], text: `Bônus de ${x} para a equipe do ${v}: é o trecho de posições ${a} a ${b}. No vetor de diferenças, +${x} na posição ${a} e −${x} na posição ${b + 1}${b + 1 > N ? ' (fora da fila, então não faz nada)' : ''}.` });
    } else {
      let s = 0;
      for (let i = 1; i <= a; i++) s += dif[i];
      snap({ op, cur: v, prefixo: a, done: true, text: `Salário do ${v}: ${SAL[v]} de base mais a soma das diferenças das posições 1 a ${a} (a posição dele), que dá ${s}. Resposta: ${SAL[v] + s}.` });
    }
  });
  return evs;
}

export default function EulerViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (k: number) => setStep(Math.max(0, Math.min(evs.length - 1, k)));
  const naFaixa = (v: number) => ev.faixa !== null && ev.ent[v] !== null && (ev.ent[v] as number) >= ev.faixa[0] && (ev.ent[v] as number) <= ev.faixa[1];

  return (
    <VizFrame title="Euler tour: cada equipe vira um trecho da fila" onKey={(d) => clamp(step + d)}>
      <div className="mb-3 flex flex-wrap gap-1.5 font-mono text-xs">
        {OPS.map(([t, v, x], i) => (
          <span key={i} className={`rounded-md border px-2 py-1 ${i === ev.op ? 'border-accent bg-accent/20 font-semibold' : i < ev.op ? 'border-line text-faint' : 'border-line text-muted'}`}>
            {t} {v}{t === 'B' ? ` ${x}` : ''}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 440 268" className="mx-auto w-full min-w-[380px] max-w-lg" role="img" aria-label="Hierarquia de oito funcionários">
          {Array.from({ length: N - 1 }, (_, k) => k + 2).map((v) => (
            <line key={v} x1={POS[v][0]} y1={POS[v][1]} x2={POS[PAI[v]][0]} y2={POS[PAI[v]][1]} stroke="var(--c-line)" strokeWidth="2" />
          ))}
          {Array.from({ length: N }, (_, k) => k + 1).map((v) => {
            const [x, y] = POS[v];
            const dentro = naFaixa(v);
            const cur = ev.cur === v;
            return (
              <g key={v}>
                <circle cx={x} cy={y} r="16" fill="var(--c-surface)" />
                <circle cx={x} cy={y} r="16" fill={dentro ? 'var(--c-try)' : 'var(--c-surface-2)'} fillOpacity={dentro ? 0.3 : 1} stroke={cur ? 'var(--c-accent)' : dentro ? 'var(--c-try)' : 'var(--c-line)'} strokeWidth={cur ? 3.2 : 1.6} />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--c-fg)">{v}</text>
                {ev.ent[v] !== null && (
                  <g>
                    <rect x={x + 18} y={y - 8} width="38" height="16" rx="8" fill="var(--c-surface)" stroke="var(--c-line)" strokeWidth="1" />
                    <text x={x + 37} y={y + 4} textAnchor="middle" fontSize="10" fill="var(--c-fg)">{ev.ent[v]}{ev.sai[v] !== null ? `..${ev.sai[v]}` : ''}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[380px] table-fixed text-center font-mono text-xs">
          <thead>
            <tr className="text-faint">
              <th className="w-28 py-1 text-left font-semibold">posição</th>
              {Array.from({ length: N + 1 }, (_, k) => <th key={k} className="py-1 font-semibold">{k + 1}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1 text-left text-muted">funcionário</td>
              {Array.from({ length: N + 1 }, (_, k) => {
                const dentro = ev.faixa && k + 1 >= ev.faixa[0] && k + 1 <= ev.faixa[1];
                return <td key={k} className={`py-1 ${dentro ? 'rounded bg-try/25 font-bold' : ''}`}>{ev.ordem[k] ?? '·'}</td>;
              })}
            </tr>
            <tr>
              <td className="py-1 text-left text-muted">diferenças</td>
              {Array.from({ length: N + 1 }, (_, k) => {
                const noPrefixo = ev.prefixo !== null && k + 1 <= ev.prefixo;
                return <td key={k} className={`py-1 ${noPrefixo ? 'rounded bg-accent/20 font-bold' : ''} ${k === N ? 'text-faint' : ''}`}>{ev.dif[k + 1]}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-faint">
        Ao lado de cada funcionário: a posição dele e, quando a DFS sai dele, o fim do trecho da equipe. <span className="text-try">Azul</span>: o trecho da equipe em foco. Na linha de diferenças, o fundo <span className="text-accent">laranja</span> marca as casas somadas numa pergunta. A posição 9 só serve para o "−x" de quem termina na 8.
      </p>
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
