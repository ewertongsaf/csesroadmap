import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Grafo funcional: cada cidade encaminha a carta para uma cidade fixa e cobra um pedágio.
// Parte 1: perguntas (x, k) com saltos de 2^j e somas. Parte 2: tartaruga e lebre de Floyd a partir da 7.
const N = 8;
const SUC = [0, 2, 3, 4, 5, 3, 1, 6, 4];
const PED = [0, 5, 1, 2, 4, 3, 6, 2, 7];
const POS: Record<number, [number, number]> = { 7: [40, 150], 6: [115, 150], 1: [190, 150], 2: [265, 150], 3: [345, 150], 4: [420, 92], 5: [420, 208], 8: [500, 50] };
const J = 4;

interface Ev { parte: string; carta: number | null; salto: [number, number] | null; cells: [number, number][]; t: number | null; l: number | null; ciclo: boolean; text: string; done: boolean }

function tabela() {
  const up: number[][] = [SUC.slice()];
  const s: number[][] = [PED.slice()];
  for (let j = 1; j < J; j++) {
    up.push(Array(N + 1).fill(0));
    s.push(Array(N + 1).fill(0));
    for (let v = 1; v <= N; v++) {
      const m = up[j - 1][v];
      up[j][v] = up[j - 1][m];
      s[j][v] = s[j - 1][v] + s[j - 1][m];
    }
  }
  return { up, s };
}

function simulate(): Ev[] {
  const { up, s } = tabela();
  const base = { salto: null, cells: [], t: null, l: null, ciclo: false, done: false };
  const evs: Ev[] = [{ ...base, parte: 'grafo', carta: null, text: 'Cada cidade tem exatamente uma seta de saída: para onde ela encaminha a carta. O número pequeno é o pedágio cobrado quando a carta sai dela. Toda carta acaba presa no ciclo 3 → 4 → 5 → 3.' }];
  const pergunta = (x0: number, k: number) => {
    let x = x0;
    let pago = 0;
    evs.push({ ...base, parte: `pergunta ${x0} ${k}`, carta: x, text: `Pergunta: a carta sai da ${x0} e é encaminhada ${k} vezes. ${k} em binário é ${k.toString(2)}: um salto para cada bit ligado.` });
    for (let j = 0; j < J; j++) if ((k >> j) & 1) {
      const de = x;
      pago += s[j][x];
      x = up[j][x];
      evs.push({ ...base, parte: `pergunta ${x0} ${k}`, carta: x, salto: [de, x], cells: [[j, de]], text: `Bit ${j}: ${1 << j} ${j ? 'encaminhamentos' : 'encaminhamento'} de uma vez a partir da ${de}. A tabela diz: a carta vai para a ${x} e paga ${s[j][de]}. Total até aqui: ${pago}.` });
    }
    evs.push({ ...base, parte: `pergunta ${x0} ${k}`, carta: x, done: true, text: `Resposta: a carta termina na ${x}, com ${pago} de pedágio.` });
  };
  pergunta(1, 10);
  pergunta(7, 4);
  // Floyd
  let t = SUC[7];
  let l = SUC[SUC[7]];
  evs.push({ ...base, parte: 'Floyd a partir da 7', carta: null, t, l, text: 'Agora, sem tabela: de onde a carta da 7 entra no ciclo, e de que tamanho ele é? A tartaruga (T) anda uma seta por vez; a lebre (L), duas. Primeiro passo: T na 6, L na 1.' });
  let passo = 1;
  while (t !== l) {
    t = SUC[t];
    l = SUC[SUC[l]];
    passo++;
    evs.push({ ...base, parte: 'Floyd a partir da 7', carta: null, t, l, text: t === l ? `Passo ${passo}: as duas estão na ${t}. Se encontraram, então existe um ciclo. Mas o encontro não precisa ser a entrada do ciclo: aqui é a ${t}.` : [3, 4, 5].includes(t) ? `Passo ${passo}: T na ${t}, L na ${l}. As duas já estão no ciclo, e a cada passo a lebre tira uma seta de diferença: o encontro é certo.` : `Passo ${passo}: T na ${t}, L na ${l}. ${[3, 4, 5].includes(l) ? 'A lebre já entrou no ciclo e dá voltas; a tartaruga ainda está na cauda.' : 'As duas ainda estão na cauda.'}` });
  }
  t = 7;
  let mu = 0;
  evs.push({ ...base, parte: 'Floyd: achar a entrada', carta: null, t, l, text: `Segunda fase: a tartaruga volta à 7, a lebre fica no encontro (${l}), e agora as duas andam uma seta por vez.` });
  while (t !== l) {
    t = SUC[t];
    l = SUC[l];
    mu++;
    evs.push({ ...base, parte: 'Floyd: achar a entrada', carta: null, t, l, text: t === l ? `As duas se encontram na ${t}, depois de ${mu} passos: a carta da 7 entra no ciclo na cidade ${t}, depois de ${mu} encaminhamentos.` : `T na ${t}, L na ${l}.` });
  }
  let lambda = 1;
  let c = SUC[t];
  while (c !== t) {
    c = SUC[c];
    lambda++;
  }
  evs.push({ ...base, parte: 'Floyd: tamanho do ciclo', carta: null, t, l: null, ciclo: true, done: true, text: `Por fim, uma volta a partir da entrada, contando: ${t} → ${SUC[t]} → ${SUC[SUC[t]]} → ${t}. O ciclo tem ${lambda} cidades. Tudo isso com memória constante: só duas posições guardadas.` });
  return evs;
}

function seta(a: number, b: number, curva = 0) {
  const [x1, y1] = POS[a];
  const [x2, y2] = POS[b];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const sx = x1 + ux * 17;
  const sy = y1 + uy * 17;
  const ex = x2 - ux * 19;
  const ey = y2 - uy * 19;
  if (!curva) return `M${sx},${sy} L${ex},${ey}`;
  const mx = (sx + ex) / 2 - uy * curva;
  const my = (sy + ey) / 2 + ux * curva;
  return `M${sx},${sy} Q${mx},${my} ${ex},${ey}`;
}

export default function FunctionalViz() {
  const { up, s } = useMemo(tabela, []);
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (k: number) => setStep(Math.max(0, Math.min(evs.length - 1, k)));
  const noCiclo = (v: number) => v === 3 || v === 4 || v === 5;
  const hot = (j: number, v: number) => ev.cells.some(([a, b]) => a === j && b === v);

  return (
    <VizFrame title="Grafo funcional: saltos com pedágio e a tartaruga e a lebre" onKey={(d) => clamp(step + d)}>
      <p className="mb-2 font-mono text-xs text-muted">{ev.parte}</p>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 540 250" className="w-full min-w-[440px] max-w-2xl" role="img" aria-label="Oito cidades, cada uma com uma seta para a próxima">
          <defs>
            <marker id="fg-seta" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" fill="var(--c-muted)" />
            </marker>
            <marker id="fg-salto" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" fill="var(--c-accent)" />
            </marker>
          </defs>
          {Array.from({ length: N }, (_, k) => k + 1).map((v) => (
            <path key={v} d={seta(v, SUC[v], v === 5 ? -14 : 0)} fill="none" stroke={ev.ciclo && noCiclo(v) ? 'var(--c-ok)' : 'var(--c-muted)'} strokeWidth={ev.ciclo && noCiclo(v) ? 3 : 1.6} markerEnd="url(#fg-seta)" />
          ))}
          {ev.salto && ev.salto[0] !== ev.salto[1] && (
            <path d={seta(ev.salto[0], ev.salto[1], 46)} fill="none" stroke="var(--c-accent)" strokeWidth="2.6" strokeDasharray="6 4" markerEnd="url(#fg-salto)" />
          )}
          {Array.from({ length: N }, (_, k) => k + 1).map((v) => {
            const [x, y] = POS[v];
            const carta = ev.carta === v;
            return (
              <g key={v}>
                <circle cx={x} cy={y} r="16" fill="var(--c-surface)" />
                <circle cx={x} cy={y} r="16" fill={carta ? 'var(--c-accent)' : ev.ciclo && noCiclo(v) ? 'var(--c-ok)' : 'var(--c-surface-2)'} fillOpacity={carta ? 0.25 : ev.ciclo && noCiclo(v) ? 0.25 : 1} stroke={carta ? 'var(--c-accent)' : 'var(--c-line)'} strokeWidth={carta ? 3 : 1.6} />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--c-fg)">{v}</text>
                <text x={v === 4 ? x + 24 : x} y={v === 4 ? y + 4 : y + 31} textAnchor={v === 4 ? 'start' : 'middle'} fontSize="10" fill="var(--c-muted)">${PED[v]}</text>
                {ev.t === v && (
                  <g>
                    <circle cx={x - 15} cy={y - 17} r="9" fill="var(--c-try)" />
                    <text x={x - 15} y={y - 13} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--c-accent-fg)">T</text>
                  </g>
                )}
                {ev.l === v && (
                  <g>
                    <circle cx={x + 15} cy={y - 17} r="9" fill="var(--c-accent)" />
                    <text x={x + 15} y={y - 13} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--c-accent-fg)">L</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[440px] table-fixed text-center font-mono text-[11px]">
          <thead>
            <tr className="text-faint">
              <th className="w-28 py-0.5 text-left font-semibold">cidade</th>
              {Array.from({ length: N }, (_, k) => <th key={k} className="py-0.5 font-semibold">{k + 1}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: J }, (_, j) => (
              <tr key={j}>
                <td className="py-0.5 text-left text-muted">{1 << j} {j ? 'passos' : 'passo'}</td>
                {Array.from({ length: N }, (_, k) => (
                  <td key={k} className={hot(j, k + 1) ? 'rounded bg-accent/25 font-bold' : ''}>{up[j][k + 1]}<span className="text-faint"> ${s[j][k + 1]}</span></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-faint">
        Embaixo de cada cidade, o pedágio ($). Na tabela, cada casa diz onde a carta está depois de 1, 2, 4 ou 8 encaminhamentos e quanto pagou. <span className="text-accent">Laranja</span>: a carta e o salto deste passo. T e L: a tartaruga e a lebre. <span className="text-ok">Verde</span>: o ciclo.
      </p>
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
