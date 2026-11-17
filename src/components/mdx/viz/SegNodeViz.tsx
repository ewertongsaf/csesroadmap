import { useMemo, useState } from 'react';
import { StepControls, VizFrame } from './StepControls.tsx';

// Segment tree com nós compostos: cada nó guarda o resumo (tam, pre, suf, best, ini, fim) de um trecho de dias,
// e o pai é calculado pela função junta. Os passos seguem os eventos do exemplo da aula, começando pela montagem.
const N = 8;
const INICIAL = [0, 3, 5, 7, 4, 6, 8, 9, 2];
type Op = ['monta', 0, 0] | ['Q' | 'M', number, number];
const OPS: Op[] = [['monta', 0, 0], ['Q', 1, 8], ['Q', 2, 5], ['M', 4, 8], ['Q', 1, 8], ['M', 5, 9], ['Q', 1, 8], ['Q', 3, 6]];
const W = 640;
const LEVEL_Y = [28, 88, 148, 208];

interface No { tam: number; pre: number; suf: number; best: number; ini: number; fim: number }
const folha = (t: number): No => ({ tam: 1, pre: 1, suf: 1, best: 1, ini: t, fim: t });
function junta(A: No, B: No): No {
  const liga = A.fim < B.ini;
  return {
    tam: A.tam + B.tam,
    pre: A.pre === A.tam && liga ? A.tam + B.pre : A.pre,
    suf: B.suf === B.tam && liga ? B.tam + A.suf : B.suf,
    best: Math.max(A.best, B.best, liga ? A.suf + B.pre : 0),
    ini: A.ini,
    fim: B.fim,
  };
}

type Kind = 'dentro' | 'feito' | 'caminho';
interface Merge { A: No; B: No; R: No; ra: string; rb: string }
interface Ev { op: number; t: No[]; cur: number | null; marks: Record<number, Kind>; merge: Merge | null; text: string; done: boolean }

function pos(no: number) {
  const lv = Math.floor(Math.log2(no));
  const k = no - (1 << lv);
  return { x: (W / (1 << lv)) * (k + 0.5), y: LEVEL_Y[lv], lv };
}
function trecho(no: number): [number, number] {
  const lv = Math.floor(Math.log2(no));
  const size = N >> lv;
  const k = no - (1 << lv);
  return [k * size + 1, (k + 1) * size];
}
const nomeT = ([l, r]: [number, number]) => (l === r ? `dia ${l}` : `dias ${l} a ${r}`);

function explica(m: Merge): string {
  const { A, B, R } = m;
  const liga = A.fim < B.ini;
  const partes = [`${liga ? `Liga: ${A.fim} < ${B.ini}, a subida pode passar do meio` : `Não liga: ${A.fim} ≥ ${B.ini}, nenhuma subida passa do meio`}.`];
  partes.push(`best = maior entre ${A.best}, ${B.best}${liga ? ` e ${A.suf} + ${B.pre} = ${A.suf + B.pre}` : ''}: ${R.best}.`);
  if (liga && A.pre === A.tam) partes.push(`A sobe inteiro, então pre = ${A.tam} + ${B.pre} = ${R.pre}.`);
  if (liga && B.suf === B.tam) partes.push(`B sobe inteiro, então suf = ${B.tam} + ${A.suf} = ${R.suf}.`);
  return partes.join(' ');
}

function simulate(): Ev[] {
  const t: No[] = Array.from({ length: 2 * N }, () => folha(0));
  for (let i = 1; i <= N; i++) t[N + i - 1] = folha(INICIAL[i]);
  const evs: Ev[] = [];
  const marks0: Record<number, Kind> = {};
  for (let i = N; i < 2 * N; i++) marks0[i] = 'feito';
  evs.push({ op: 0, t: [...t], cur: null, marks: { ...marks0 }, merge: null, text: 'Embaixo, as temperaturas dos 8 dias. Cada folha é um trecho de um dia só: tam, pre, suf e best valem 1. Os nós de cima ainda não foram calculados.', done: false });
  // montagem, na ordem da recursão
  const marks: Record<number, Kind> = { ...marks0 };
  const monta = (no: number) => {
    if (no >= N) return;
    monta(2 * no);
    monta(2 * no + 1);
    t[no] = junta(t[2 * no], t[2 * no + 1]);
    marks[no] = 'feito';
    const m = { A: t[2 * no], B: t[2 * no + 1], R: t[no], ra: nomeT(trecho(2 * no)), rb: nomeT(trecho(2 * no + 1)) };
    evs.push({ op: 0, t: [...t], cur: no, marks: { ...marks }, merge: m, text: `Monta o nó dos ${nomeT(trecho(no))}: junta(${m.ra}, ${m.rb}). ${explica(m)}`, done: no === 1 });
  };
  monta(1);
  OPS.forEach(([tipo, p, q], op) => {
    if (tipo === 'monta') return;
    const mk: Record<number, Kind> = {};
    const snap = (cur: number | null, merge: Merge | null, text: string, done = false) => evs.push({ op, t: [...t], cur, marks: { ...mk }, merge, text, done });
    if (tipo === 'M') {
      const caminho: number[] = [];
      for (let no = 1; no < N; ) {
        caminho.push(no);
        const [l, r] = trecho(no);
        no = p <= (l + r) >> 1 ? 2 * no : 2 * no + 1;
      }
      const leaf = N + p - 1;
      const antes = t[leaf].ini;
      t[leaf] = folha(q);
      mk[leaf] = 'feito';
      snap(leaf, null, `O dia ${p} passa de ${antes} para ${q} graus: a folha muda. Agora os nós acima dela refazem o junta, de baixo para cima.`);
      for (let i = caminho.length - 1; i >= 0; i--) {
        const c = caminho[i];
        t[c] = junta(t[2 * c], t[2 * c + 1]);
        mk[c] = 'feito';
        const m = { A: t[2 * c], B: t[2 * c + 1], R: t[c], ra: nomeT(trecho(2 * c)), rb: nomeT(trecho(2 * c + 1)) };
        snap(c, m, `Refaz o nó dos ${nomeT(trecho(c))}. ${explica(m)}`, i === 0);
      }
    } else {
      const consulta = (no: number): No => {
        const [l, r] = trecho(no);
        if (p <= l && r <= q) {
          mk[no] = 'dentro';
          snap(no, null, `Maior subida entre os dias ${p} e ${q}: o nó dos ${nomeT([l, r])} está todo dentro. Usa o resumo pronto (best ${t[no].best}).`);
          return t[no];
        }
        const m = (l + r) >> 1;
        if (q <= m) return consulta(2 * no);
        if (p > m) return consulta(2 * no + 1);
        mk[no] = 'caminho';
        const e = consulta(2 * no);
        const d = consulta(2 * no + 1);
        const R = junta(e, d);
        const mg = { A: e, B: d, R, ra: `parte da esquerda`, rb: `parte da direita` };
        snap(no, mg, `De volta ao nó dos ${nomeT([l, r])}: junta o pedaço da esquerda com o da direita, nessa ordem. ${explica(mg)}`);
        return R;
      };
      const r = consulta(1);
      snap(null, null, `Resposta de Q ${p} ${q}: ${r.best} ${r.best === 1 ? 'dia' : 'dias'} seguidos de calor crescente.`, true);
    }
  });
  return evs;
}

const COR: Record<Kind, { stroke: string; fill: string; op: number }> = {
  feito: { stroke: 'var(--c-try)', fill: 'var(--c-try)', op: 0.22 },
  dentro: { stroke: 'var(--c-try)', fill: 'var(--c-try)', op: 0.3 },
  caminho: { stroke: 'var(--c-accent)', fill: 'var(--c-accent)', op: 0.14 },
};
const CAMPOS: (keyof No)[] = ['pre', 'suf', 'best', 'ini', 'fim'];

function Tabela({ titulo, no, destaque }: { titulo: string; no: No; destaque?: boolean }) {
  return (
    <div className={`min-w-0 rounded-lg border p-2 ${destaque ? 'border-try' : 'border-line'}`}>
      <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-faint">{titulo}</p>
      <table className="mt-1 w-full font-mono text-xs">
        <tbody>
          {CAMPOS.map((c) => (
            <tr key={c}>
              <td className="pr-1 text-muted">{c}</td>
              <td className={`text-right ${c === 'best' ? 'font-bold' : ''}`}>{no[c]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SegNodeViz() {
  const evs = useMemo(simulate, []);
  const [step, setStep] = useState(0);
  const ev = evs[step];
  const clamp = (s: number) => setStep(Math.max(0, Math.min(evs.length - 1, s)));
  const nodes = Array.from({ length: 2 * N - 1 }, (_, k) => k + 1);
  const calculado = (no: number) => no >= N || ev.marks[no] !== undefined || ev.op > 0;

  return (
    <VizFrame title="Nós compostos: o que cada nó guarda e como o pai junta os filhos" onKey={(d) => clamp(step + d)}>
      <div className="mb-3 flex flex-wrap gap-1.5 font-mono text-xs">
        {OPS.map(([t, p, q], i) => (
          <span key={i} className={`rounded-md border px-2 py-1 ${i === ev.op ? 'border-accent bg-accent/20 font-semibold' : i < ev.op ? 'border-line text-faint' : 'border-line text-muted'}`}>
            {t === 'monta' ? 'monta' : `${t} ${p} ${q}`}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} 252`} className="w-full min-w-[520px] max-w-3xl" role="img" aria-label="Árvore de 15 nós sobre as temperaturas de 8 dias">
          {nodes.filter((no) => no > 1).map((no) => {
            const a = pos(no);
            const b = pos(no >> 1);
            return <line key={no} x1={a.x} y1={a.y - 17} x2={b.x} y2={b.y + 17} stroke="var(--c-line)" strokeWidth="1.5" />;
          })}
          {nodes.map((no) => {
            const { x, y, lv } = pos(no);
            const leaf = lv === 3;
            const kind = ev.marks[no];
            const c = kind ? COR[kind] : { stroke: 'var(--c-line)', fill: 'var(--c-surface-2)', op: 1 };
            const w = leaf ? 56 : 70;
            const v = ev.t[no];
            const pronto = calculado(no);
            return (
              <g key={no}>
                <rect x={x - w / 2} y={y - 17} width={w} height="34" rx={leaf ? 6 : 12} fill={c.fill} fillOpacity={c.op} stroke={ev.cur === no ? 'var(--c-accent)' : c.stroke} strokeWidth={ev.cur === no ? 3.2 : 1.6} />
                {leaf ? (
                  <text x={x} y={y + 6} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--c-fg)">{v.ini}°</text>
                ) : pronto ? (
                  <>
                    <text x={x} y={y + 1} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--c-fg)">{v.best}</text>
                    <text x={x} y={y + 13} textAnchor="middle" fontSize="9" fill="var(--c-muted)">p{v.pre} · s{v.suf}</text>
                  </>
                ) : (
                  <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fill="var(--c-muted)">?</text>
                )}
                {leaf && <text x={x} y={y + 32} textAnchor="middle" fontSize="10" fill="var(--c-muted)">dia {no - N + 1}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-2 text-xs text-faint">
        Nos nós de cima, o número grande é <span className="font-mono">best</span> e embaixo vêm <span className="font-mono">pre</span> (p) e <span className="font-mono">suf</span> (s). Borda <span className="text-accent">laranja</span>: o nó deste passo. <span className="text-try">Azul</span>: nó calculado ou usado inteiro na resposta; fundo laranja claro: nó em que a consulta junta dois pedaços.
      </p>
      {ev.merge ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Tabela titulo={`A: ${ev.merge.ra}`} no={ev.merge.A} />
          <Tabela titulo={`B: ${ev.merge.rb}`} no={ev.merge.B} />
          <Tabela titulo="junta(A, B)" no={ev.merge.R} destaque />
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {ev.cur !== null ? (
            <Tabela titulo={`nó: ${nomeT(trecho(ev.cur))}`} no={ev.t[ev.cur]} destaque={ev.marks[ev.cur] === 'dentro'} />
          ) : (
            <div className="rounded-lg border border-dashed border-line p-2 text-xs text-faint">Escolha um passo com junta para ver os campos de A, B e do resultado.</div>
          )}
        </div>
      )}
      <p className={`mt-3 min-h-20 text-[15px] ${ev.done ? 'text-ok' : ''}`}>{ev.text}</p>
      <div className="mt-3">
        <StepControls step={step} total={evs.length} onStep={clamp} />
      </div>
    </VizFrame>
  );
}
