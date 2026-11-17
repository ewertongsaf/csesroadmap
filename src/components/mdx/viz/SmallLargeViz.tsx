import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Small-to-large: cada funcionário recebe o conjunto (time → torcedores) dos filhos; o conjunto menor entra no maior.
const N = 8;
const PAI = [0, 0, 1, 1, 2, 2, 3, 6, 6];
const TIME = [0, 2, 1, 3, 1, 1, 3, 2, 3];
const POS: Record<number, [number, number]> = { 1: [220, 34], 2: [110, 104], 3: [330, 104], 4: [60, 178], 5: [160, 178], 6: [330, 178], 7: [280, 250], 8: [380, 250] };

type Conj = Record<number, number>;
interface Ev { cur: number | null; de: number | null; para: number | null; conjs: (Conj | null)[]; resp: (number | null)[]; movs: number; text: string; done: boolean }

const fmt = (c: Conj) => Object.keys(c).map(Number).sort((a, b) => a - b).map((t) => `t${t}:${c[t]}`).join(' ');
const melhor = (c: Conj) => {
  let bt = 0;
  let bq = 0;
  for (const t of Object.keys(c).map(Number).sort((a, b) => a - b)) if (c[t] > bq) { bq = c[t]; bt = t; }
  return [bt, bq];
};

function simulate(): Ev[] {
  const filhos: number[][] = Array.from({ length: N + 1 }, () => []);
  for (let v = 2; v <= N; v++) filhos[PAI[v]].push(v);
  // dono[v] = de qual funcionário é o objeto de conjunto que hoje guarda a equipe de v
  const objeto: (Conj | null)[] = Array(N + 1).fill(null);
  const dono: number[] = Array(N + 1).fill(0);
  const mostra: (Conj | null)[] = Array(N + 1).fill(null);
  const resp: (number | null)[] = Array(N + 1).fill(null);
  let movs = 0;
  const evs: Ev[] = [];
  const snap = (e: Partial<Ev> & { text: string }) => evs.push({ cur: null, de: null, para: null, done: false, conjs: mostra.map((c) => (c ? { ...c } : null)), resp: [...resp], movs, ...e });
  snap({ text: 'Cada funcionário torce para um time (t1, t2 ou t3, embaixo do número). A DFS vai devolver, para cada um, a contagem de times da equipe dele, juntando as contagens dos filhos.' });
  const dfs = (v: number) => {
    objeto[v] = { [TIME[v]]: 1 };
    dono[v] = v;
    mostra[v] = objeto[v];
    for (const u of filhos[v]) {
      dfs(u);
      let a = dono[v];
      let b = dono[u];
      const ca = objeto[a] as Conj;
      const cb = objeto[b] as Conj;
      const troca = Object.keys(ca).length < Object.keys(cb).length;
      if (troca) [a, b] = [b, a];
      const grande = objeto[a] as Conj;
      const pequeno = objeto[b] as Conj;
      const movidos = fmt(pequeno);
      const qtd = Object.keys(pequeno).length;
      for (const t of Object.keys(pequeno).map(Number)) grande[t] = (grande[t] ?? 0) + pequeno[t];
      movs += qtd;
      objeto[b] = {};
      dono[v] = a;
      mostra[v] = grande;
      mostra[u] = null;
      snap({ cur: v, de: troca ? v : u, para: troca ? u : v, text: `O ${v} junta a equipe do ${u}. ${troca ? `O conjunto que veio do ${u} é o maior (${Object.keys(cb).length} times contra ${Object.keys(ca).length}): ele é aproveitado inteiro, e o do ${v} é que entra nele.` : `O conjunto do ${v} tem ${Object.keys(ca).length} ${Object.keys(ca).length === 1 ? 'time' : 'times'} e o do ${u} tem ${Object.keys(cb).length}: o do ${u} entra no do ${v}.`} ${qtd} ${qtd === 1 ? 'entrada movida' : 'entradas movidas'} (${movidos}).` });
    }
    const [bt, bq] = melhor(mostra[v] as Conj);
    resp[v] = bt;
    snap({ cur: v, text: `Equipe do ${v} pronta: ${fmt(mostra[v] as Conj)}. O time mais comum é o ${bt}, com ${bq} ${bq === 1 ? 'torcedor' : 'torcedores'}${Object.values(mostra[v] as Conj).filter((x) => x === bq).length > 1 ? ' (empate: fica o de menor número)' : ''}.` });
  };
  dfs(1);
  snap({ done: true, text: `Fim: ${movs} entradas movidas ao todo. Juntando sempre o menor no maior, numa empresa de n funcionários isso nunca passa de cerca de n·log₂ n.` });
  return evs;
}

export default function SmallLargeViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (k: number) => setStep(Math.max(0, Math.min(evs.length - 1, k)));

  return (
    <VizFrame title="Small-to-large: o conjunto menor entra no maior" onKey={(d) => clamp(step + d)}>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 470 290" className="mx-auto w-full min-w-[400px] max-w-xl" role="img" aria-label="Hierarquia de oito funcionários com a contagem de times de cada equipe">
          <defs>
            <marker id="sl-seta" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" fill="var(--c-accent)" />
            </marker>
          </defs>
          {Array.from({ length: N - 1 }, (_, k) => k + 2).map((v) => (
            <line key={v} x1={POS[v][0]} y1={POS[v][1]} x2={POS[PAI[v]][0]} y2={POS[PAI[v]][1]} stroke="var(--c-line)" strokeWidth="2" />
          ))}
          {ev.de !== null && ev.para !== null && (() => {
            const [x1, y1] = POS[ev.de];
            const [x2, y2] = POS[ev.para];
            const curva = x1 <= x2 ? -40 : 40;
            return <path d={`M${x1 - 18},${y1} Q${(x1 + x2) / 2 + curva},${(y1 + y2) / 2} ${x2 - 18},${y2 + 6}`} fill="none" stroke="var(--c-accent)" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#sl-seta)" />;
          })()}
          {Array.from({ length: N }, (_, k) => k + 1).map((v) => {
            const [x, y] = POS[v];
            const c = ev.conjs[v];
            const pronto = ev.resp[v] !== null;
            return (
              <g key={v}>
                <circle cx={x} cy={y} r="16" fill="var(--c-surface)" />
                <circle cx={x} cy={y} r="16" fill={pronto ? 'var(--c-ok)' : 'var(--c-surface-2)'} fillOpacity={pronto ? 0.22 : 1} stroke={ev.cur === v ? 'var(--c-accent)' : pronto ? 'var(--c-ok)' : 'var(--c-line)'} strokeWidth={ev.cur === v ? 3.2 : 1.6} />
                <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--c-fg)">{v}</text>
                <text x={x} y={y + 30} textAnchor="middle" fontSize="10" fill="var(--c-muted)">t{TIME[v]}</text>
                {c && (
                  <g>
                    <rect x={x + 19} y={y - 9} width={Math.max(40, fmt(c).length * 6.5 + 12)} height="18" rx="5" fill="var(--c-surface)" stroke="var(--c-try)" strokeWidth="1.2" />
                    <text x={x + 24} y={y + 4} fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--c-fg)">{fmt(c)}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-2 font-mono text-xs text-muted">
        respostas: {Array.from({ length: N }, (_, k) => (ev.resp[k + 1] === null ? '·' : `t${ev.resp[k + 1]}`)).join(' ')} · entradas movidas: {ev.movs}
      </p>
      <p className="mt-2 text-xs text-faint">
        Embaixo de cada funcionário, o time dele. O quadro <span className="text-try">azul</span> ao lado é o conjunto que guarda a contagem da equipe (some quando é aproveitado pelo chefe). Seta <span className="text-accent">laranja</span>: o conjunto menor entrando no maior. <span className="text-ok">Verde</span>: equipe já respondida.
      </p>
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
