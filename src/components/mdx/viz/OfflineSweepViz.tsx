import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Queries offline: produtos e perguntas viram eventos numa régua de preços. Um cursor varre do mais barato
// para o mais caro: cada produto acende sua posição na Fenwick tree; cada pergunta soma os acesos do seu trecho.
const PRECO = [0, 4, 7, 2, 9, 5, 3, 8, 6];
const N = 8;
const PERG: [number, number, number][] = [[2, 6, 5], [1, 8, 3], [3, 7, 8], [1, 4, 6], [5, 8, 5], [4, 4, 8]];
const W = 560;
const X = (v: number) => 40 + (v - 1) * ((W - 80) / 8);

type Evento = { tipo: 'item'; pos: number; preco: number } | { tipo: 'perg'; j: number; x: number };
interface Ev { cursor: number | null; acesos: boolean[]; atual: Evento | null; resp: (number | null)[]; faixa: [number, number] | null; text: string; done: boolean; ordem: boolean }

function eventos(): Evento[] {
  const its: Evento[] = Array.from({ length: N }, (_, k) => ({ tipo: 'item' as const, pos: k + 1, preco: PRECO[k + 1] }));
  const ps: Evento[] = PERG.map(([, , x], j) => ({ tipo: 'perg' as const, j, x }));
  const v = (e: Evento) => (e.tipo === 'item' ? e.preco : e.x);
  // mesmo valor: produto antes da pergunta (o limite inclui o preço igual); perguntas empatadas na ordem da entrada
  return [...its, ...ps].sort((a, b) => v(a) - v(b) || (a.tipo === b.tipo ? 0 : a.tipo === 'item' ? -1 : 1));
}

function simulate(): Ev[] {
  const acesos: boolean[] = Array(N + 1).fill(false);
  const resp: (number | null)[] = PERG.map(() => null);
  const evs: Ev[] = [{ cursor: null, acesos: [...acesos], atual: null, resp: [...resp], faixa: null, text: 'Em cima da régua, os produtos, no preço de cada um. Embaixo, as perguntas, no limite de cada uma. O cursor vai varrer a régua da esquerda para a direita. Por enquanto, nenhum produto está aceso.', done: false, ordem: false }];
  for (const e of eventos()) {
    if (e.tipo === 'item') {
      acesos[e.pos] = true;
      evs.push({ cursor: e.preco, acesos: [...acesos], atual: e, resp: [...resp], faixa: null, text: `O cursor chega a ${e.preco}: acende o produto da posição ${e.pos}, que custa ${e.preco}. Na Fenwick tree, atualiza(${e.pos}, ${e.preco}).`, done: false, ordem: false });
    } else {
      const [a, b, x] = PERG[e.j];
      const usados: number[] = [];
      for (let i = a; i <= b; i++) if (acesos[i]) usados.push(PRECO[i]);
      const r = usados.reduce((s, v) => s + v, 0);
      resp[e.j] = r;
      evs.push({
        cursor: x, acesos: [...acesos], atual: e, resp: [...resp], faixa: [a, b],
        text: `O cursor chega a ${x}: é a vez da pergunta ${e.j + 1} (posições ${a} a ${b}, até ${x}). Todo produto aceso custa no máximo ${x}, e nenhum apagado custa. Soma dos acesos do trecho: ${usados.length ? usados.join(' + ') + (usados.length > 1 ? ` = ${r}` : '') : 'nenhum, 0'}. A resposta vai para a casa ${e.j + 1} do quadro.`,
        done: false, ordem: false,
      });
    }
  }
  evs.push({ cursor: null, acesos: [...acesos], atual: null, resp: [...resp], faixa: null, text: `Fim da varredura. As respostas foram calculadas fora de ordem (2, 1, 5, 4, 3, 6), mas cada uma foi guardada na casa da sua pergunta. Basta imprimir o quadro da esquerda para a direita: ${resp.join(', ')}.`, done: true, ordem: true });
  return evs;
}

export default function OfflineSweepViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const pergPorX = new Map<number, number[]>();
  PERG.forEach(([, , x], j) => pergPorX.set(x, [...(pergPorX.get(x) ?? []), j]));
  const itPorP = new Map<number, number[]>();
  for (let i = 1; i <= N; i++) itPorP.set(PRECO[i], [...(itPorP.get(PRECO[i]) ?? []), i]);
  const atualPerg = ev.atual?.tipo === 'perg' ? ev.atual.j : null;
  const atualItem = ev.atual?.tipo === 'item' ? ev.atual.pos : null;

  return (
    <VizFrame title="Queries offline: varrendo produtos e perguntas pelo preço" onKey={(d) => clamp(step + d)}>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} 150`} className="w-full min-w-[460px] max-w-2xl" role="img" aria-label="Régua de preços com produtos em cima e perguntas embaixo">
          <line x1={X(1) - 16} y1="72" x2={X(9) + 16} y2="72" stroke="var(--c-line)" strokeWidth="2" />
          {Array.from({ length: 9 }, (_, k) => k + 1).map((v) => (
            <g key={v}>
              <line x1={X(v)} y1="67" x2={X(v)} y2="77" stroke="var(--c-line)" strokeWidth="1.5" />
              <text x={X(v)} y="91" textAnchor="middle" fontSize="10" fill="var(--c-muted)">{v}</text>
            </g>
          ))}
          {ev.cursor !== null && (
            <g>
              <rect x={X(1) - 16} y="10" width={X(ev.cursor) - X(1) + 16} height="124" fill="var(--c-try)" fillOpacity="0.07" />
              <line x1={X(ev.cursor)} y1="8" x2={X(ev.cursor)} y2="80" stroke="var(--c-accent)" strokeWidth="2.5" />
              <line x1={X(ev.cursor)} y1="96" x2={X(ev.cursor)} y2="136" stroke="var(--c-accent)" strokeWidth="2.5" />
            </g>
          )}
          {[...itPorP.entries()].map(([p, poss]) => poss.map((pos, k) => {
            const on = ev.acesos[pos];
            const cur = atualItem === pos;
            return (
              <g key={pos}>
                <circle cx={X(p)} cy={46 - k * 26} r="12" fill="var(--c-surface)" />
                <circle cx={X(p)} cy={46 - k * 26} r="12" fill={on ? 'var(--c-try)' : 'var(--c-surface-2)'} fillOpacity={on ? 0.3 : 1} stroke={cur ? 'var(--c-accent)' : on ? 'var(--c-try)' : 'var(--c-line)'} strokeWidth={cur ? 3 : 1.6} />
                <text x={X(p)} y={50 - k * 26} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--c-fg)">p{pos}</text>
              </g>
            );
          }))}
          {[...pergPorX.entries()].map(([x, js]) => js.map((j, k) => {
            const feita = ev.resp[j] !== null;
            const cur = atualPerg === j;
            return (
              <g key={j}>
                <rect x={X(x) - 15 + k * 32 - (js.length - 1) * 16} y="100" width="30" height="20" rx="5" fill="var(--c-surface)" />
                <rect x={X(x) - 15 + k * 32 - (js.length - 1) * 16} y="100" width="30" height="20" rx="5" fill={feita ? 'var(--c-ok)' : 'var(--c-surface-2)'} fillOpacity={feita ? 0.22 : 1} stroke={cur ? 'var(--c-accent)' : feita ? 'var(--c-ok)' : 'var(--c-line)'} strokeWidth={cur ? 3 : 1.5} />
                <text x={X(x) + k * 32 - (js.length - 1) * 16} y="114" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--c-fg)">P{j + 1}</text>
              </g>
            );
          }))}
        </svg>
      </div>

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-faint">Prateleiras (posições 1 a 8)</p>
      <div className="mt-1 grid grid-cols-8 gap-1">
        {Array.from({ length: N }, (_, k) => k + 1).map((i) => {
          const on = ev.acesos[i];
          const dentro = ev.faixa && i >= ev.faixa[0] && i <= ev.faixa[1];
          return (
            <div key={i} className="min-w-0 text-center">
              <div className={`rounded-md border py-1.5 font-mono text-sm font-semibold ${on ? 'border-try bg-try/20' : 'border-line text-faint'} ${atualItem === i ? 'ring-2 ring-accent' : ''}`}>{PRECO[i]}</div>
              <div className={`mt-1 h-1 rounded-full ${dentro ? 'bg-accent' : 'bg-transparent'}`} />
              <div className="text-[10px] text-muted">{i}</div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-faint">Quadro de respostas (na ordem da entrada)</p>
      <div className="mt-1 grid grid-cols-6 gap-1">
        {PERG.map(([a, b, x], j) => (
          <div key={j} className={`min-w-0 rounded-md border px-1 py-1 text-center ${atualPerg === j ? 'border-accent' : ev.resp[j] !== null ? 'border-ok' : 'border-line'} ${ev.ordem ? 'bg-ok/10' : ''}`}>
            <div className="truncate text-[10px] text-muted">P{j + 1}: {a}..{b} ≤{x}</div>
            <div className="font-mono text-sm font-semibold">{ev.resp[j] ?? '·'}</div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs text-faint">
        p<i>k</i> = produto da posição <i>k</i>; P<i>j</i> = pergunta <i>j</i> da entrada. <span className="text-accent">Laranja</span>: o cursor, o evento deste passo e o trecho da pergunta. <span className="text-try">Azul</span>: produtos acesos (já somados na Fenwick tree). <span className="text-ok">Verde</span>: perguntas respondidas.
      </p>
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
