// Cenário da Jornada: um SVG único, largo, com um trecho por mundo. Tudo é gerado por código
// (PRNG com semente fixa), sem imagens. A personagem é desenhada por cima, em JourneyMap.tsx.
import { memo, type ReactNode } from 'react';
import { WORLDS, type World } from '../../lib/journey.ts';
import type { TrailData } from '../../lib/trail.ts';

export const GAP = 180;
export const X0 = 150;
export const H = 400;

/** x da coordenada de trilha t (0 = acampamento, i+1 = milestone de índice i). */
export const posX = (t: number) => X0 + GAP * t;
export const nodeX = (i: number) => posX(i + 1);
export const sceneWidth = (n: number) => posX(n) + 170;
/** Altura do chão em x: é onde a personagem pisa. */
export const terrainY = (x: number) => 292 + 26 * Math.sin(x / 170) + 10 * Math.sin(x / 61 + 2);

const r1 = (n: number) => Math.round(n * 10) / 10;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Palette {
  sky: [string, string];
  far: string;
  ground: string;
  top: string;
  orb: string;
}
const PALETTE: Record<World['key'], Palette> = {
  vale: { sky: ['#2b5876', '#86bfa6'], far: '#3f7f78', ground: '#2c6140', top: '#7bc96f', orb: '#ffe9a8' },
  canions: { sky: ['#5b2a3c', '#e39253'], far: '#93503c', ground: '#733a28', top: '#e2a05c', orb: '#ffd27a' },
  floresta: { sky: ['#0f2e2a', '#2f6b4f'], far: '#143a30', ground: '#1b3823', top: '#4f9a55', orb: '#d7f7c2' },
  picos: { sky: ['#27305e', '#8fa8d8'], far: '#5a6aa8', ground: '#465682', top: '#eef4ff', orb: '#ffffff' },
  cidadela: { sky: ['#0b0b24', '#3a1f5c'], far: '#1a1440', ground: '#231a44', top: '#b48cff', orb: '#f4eaff' },
};

export interface WorldSpan {
  index: number;
  world: World;
  from: number;
  to: number;
}

/** Faixa de x de cada mundo: a fronteira fica no meio do caminho entre dois milestones. */
export function worldSpans(trail: TrailData): WorldSpan[] {
  const n = trail.milestones.length;
  const starts = trail.phases.map((_, pi) => trail.milestones.findIndex((m) => m.phase === pi));
  return trail.phases.map((_, pi) => ({
    index: pi,
    world: WORLDS[Math.min(pi, WORLDS.length - 1)],
    from: pi === 0 ? 0 : nodeX(starts[pi]) - GAP / 2,
    to: pi === trail.phases.length - 1 ? sceneWidth(n) : nodeX(starts[pi + 1]) - GAP / 2,
  }));
}

function terrainPoints(from: number, to: number) {
  const pts: string[] = [];
  for (let x = from; x < to; x += 10) pts.push(`${r1(x)},${r1(terrainY(x))}`);
  pts.push(`${r1(to)},${r1(terrainY(to))}`);
  return pts.join(' ');
}

function farLayer(key: World['key'], from: number, to: number, rnd: () => number, color: string): ReactNode {
  if (key === 'vale') {
    let d = `M${from},${H}`;
    for (let x = from; x <= to; x += 12) d += ` L${r1(x)},${r1(232 + 30 * Math.sin(x / 120 + 1) + 14 * Math.sin(x / 47))}`;
    return <path d={`${d} L${to},${H} Z`} fill={color} />;
  }
  if (key === 'canions') {
    let d = `M${from},${H}`;
    for (let x = from; x < to; ) {
      const w = 60 + rnd() * 90;
      const y = r1(150 + rnd() * 90);
      const x2 = r1(Math.min(to, x + w));
      d += ` L${r1(x + 8)},${y} L${r1(x2 - 8)},${y} L${x2},${r1(y + 26)}`;
      x += w + 20 + rnd() * 50;
      d += ` L${r1(Math.min(to, x))},${r1(250 + rnd() * 16)}`;
    }
    return <path d={`${d} L${to},${H} Z`} fill={color} />;
  }
  if (key === 'floresta') {
    let d = `M${from},${H} L${from},262`;
    for (let x = from; x < to; ) {
      const w = 34 + rnd() * 30;
      d += ` L${r1(x + w / 2)},${r1(118 + rnd() * 80)} L${r1(Math.min(to, x + w))},262`;
      x += w * 0.72;
    }
    return <path d={`${d} L${to},${H} Z`} fill={color} />;
  }
  if (key === 'picos') {
    const out: ReactNode[] = [];
    for (let x = from - 60, i = 0; x < to; i++) {
      const w = 170 + rnd() * 110;
      const ax = x + w / 2;
      const ay = 66 + rnd() * 80;
      const l = Math.max(from, x);
      const rr = Math.min(to, x + w);
      const yAt = (px: number) => ay + (Math.abs(px - ax) / (w / 2)) * (300 - ay);
      if (ax > from + 4 && ax < to - 4) {
        out.push(<path key={`m${i}`} d={`M${r1(l)},${r1(yAt(l))} L${r1(ax)},${r1(ay)} L${r1(rr)},${r1(yAt(rr))} L${r1(rr)},${H} L${r1(l)},${H} Z`} fill={color} />);
        const cw = w * 0.11;
        out.push(<path key={`s${i}`} d={`M${r1(ax - cw)},${r1(yAt(ax - cw))} L${r1(ax)},${r1(ay)} L${r1(ax + cw)},${r1(yAt(ax + cw))} L${r1(ax)},${r1(yAt(ax + cw) - 9)} Z`} fill="#fff" opacity="0.85" />);
      }
      x += w * 0.62;
    }
    return <>{out}<rect x={from} y="286" width={to - from} height={H - 286} fill={color} /></>;
  }
  // cidadela: silhueta de torres com janelas acesas
  const out: ReactNode[] = [];
  for (let x = from, i = 0; x < to - 20; i++) {
    const w = 28 + rnd() * 34;
    const y = 110 + rnd() * 120;
    const x2 = Math.min(to, x + w);
    out.push(<rect key={`t${i}`} x={r1(x)} y={r1(y)} width={r1(x2 - x)} height={r1(H - y)} fill={color} />);
    if (rnd() > 0.45) out.push(<path key={`r${i}`} d={`M${r1(x)},${r1(y)} L${r1((x + x2) / 2)},${r1(y - 22)} L${r1(x2)},${r1(y)} Z`} fill={color} />);
    for (let k = 0; k < 3; k++) {
      if (rnd() > 0.5) out.push(<rect key={`w${i}-${k}`} x={r1(x + 6 + rnd() * (w - 16))} y={r1(y + 14 + k * 26)} width="4" height="6" fill="#ffd76a" opacity="0.75" />);
    }
    x += w + rnd() * 26;
  }
  return <>{out}</>;
}

function decor(key: World['key'], x: number, rnd: () => number, k: string): ReactNode {
  const y = terrainY(x);
  const s = 0.8 + rnd() * 0.5;
  const g = (children: ReactNode) => (
    <g key={k} transform={`translate(${r1(x)},${r1(y + 2)}) scale(${r1(s)})`}>
      {children}
    </g>
  );
  switch (key) {
    case 'vale':
      return g(
        <>
          <ellipse cx="0" cy="-8" rx="17" ry="11" fill="#3f9150" />
          <ellipse cx="11" cy="-5" rx="11" ry="8" fill="#4fa860" />
          <circle cx="-6" cy="-12" r="2" fill="#ffe27a" />
          <circle cx="6" cy="-9" r="2" fill="#ff9fb2" />
          <circle cx="13" cy="-7" r="1.6" fill="#fff" />
        </>,
      );
    case 'canions':
      // pilha de células: uma "tabela de DP" esculpida na rocha
      return g(
        <>
          {[0, 1, 2].flatMap((row) =>
            [0, 1, 2].slice(0, 3 - row).map((col) => (
              <rect key={`${row}-${col}`} x={-18 + col * 12 + row * 6} y={-12 - row * 12} width="11" height="11" rx="1.5" fill={row === 2 ? '#ffd27a' : '#c9743f'} stroke="#5b2a1c" strokeWidth="1" />
            )),
          )}
        </>,
      );
    case 'floresta':
      // árvore binária: tronco e três copas
      return g(
        <>
          <path d="M0,0 L0,-30 M0,-30 L-13,-46 M0,-30 L13,-46" stroke="#6b4a2f" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="0" cy="-34" r="9" fill="#3d8a4a" />
          <circle cx="-14" cy="-50" r="11" fill="#2f7340" />
          <circle cx="14" cy="-50" r="11" fill="#4f9a55" />
        </>,
      );
    case 'picos':
      return g(
        <>
          <path d="M-9,0 L-5,-26 L0,-34 L5,-24 L8,0 Z" fill="#a6d8ff" />
          <path d="M0,-34 L5,-24 L8,0 L0,0 Z" fill="#6fb2ee" />
          <path d="M8,0 L11,-13 L15,-17 L18,0 Z" fill="#c9b6ff" />
        </>,
      );
    default:
      return g(
        <>
          <line x1="0" y1="0" x2="0" y2="-34" stroke="#8a78c8" strokeWidth="2.5" />
          <circle cx="0" cy="-38" r="9" fill="#ffd76a" opacity="0.25" />
          <circle cx="0" cy="-38" r="4.5" fill="#ffe9a8" />
        </>,
      );
  }
}

export type NodeState = 'done' | 'current' | 'mastered' | 'ahead';
export interface NodeView {
  state: NodeState;
  stars: number;
}

const shortName = (name: string) => {
  const s = name.split(':')[0];
  return s.length > 22 ? `${s.slice(0, 21)}…` : s;
};

const NODE_STYLE: Record<NodeState, { fill: string; stroke: string; text: string; dash?: string }> = {
  done: { fill: '#3ecf7a', stroke: '#0f5c33', text: '#06301a' },
  current: { fill: '#ffcf5c', stroke: '#8a5a00', text: '#3a2500' },
  mastered: { fill: 'rgba(12,14,24,0.55)', stroke: '#ffffff', text: '#ffffff', dash: '4 3' },
  ahead: { fill: 'rgba(12,14,24,0.62)', stroke: 'rgba(255,255,255,0.6)', text: '#ffffff' },
};

interface SceneProps {
  trail: TrailData;
  nodes: NodeView[];
  /** Coordenada de trilha do progresso real (até onde o caminho está aceso). */
  litTo: number;
  selected: number;
  onSelect: (i: number) => void;
}

/** Fundo estático (céu, montanhas, chão, enfeites, portais). Nunca muda: fica fora do re-render. */
const Backdrop = memo(function Backdrop({ trail }: { trail: TrailData }) {
  const spans = worldSpans(trail);
  const n = trail.milestones.length;
  return (
    <>
      <defs>
        {spans.map((sp) => (
          <linearGradient key={sp.world.key} id={`jr-sky-${sp.world.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={PALETTE[sp.world.key].sky[0]} />
            <stop offset="1" stopColor={PALETTE[sp.world.key].sky[1]} />
          </linearGradient>
        ))}
      </defs>
      {spans.map((sp) => {
        const pal = PALETTE[sp.world.key];
        const rnd = mulberry32(1000 + sp.index * 77);
        const w = sp.to - sp.from;
        const first = trail.milestones.findIndex((m) => m.phase === sp.index);
        const count = trail.milestones.filter((m) => m.phase === sp.index).length;
        const decorXs: number[] = [];
        for (let i = first; i < first + count; i++) {
          decorXs.push(nodeX(i) - GAP * (0.62 + rnd() * 0.1), nodeX(i) + GAP * (0.2 + rnd() * 0.1));
        }
        return (
          <g key={sp.world.key}>
            <rect x={sp.from} y="0" width={w} height={H} fill={`url(#jr-sky-${sp.world.key})`} />
            {(sp.world.key === 'cidadela' || sp.world.key === 'floresta') &&
              Array.from({ length: Math.round(w / (sp.world.key === 'cidadela' ? 14 : 40)) }, (_, i) => (
                <circle key={i} cx={r1(sp.from + rnd() * w)} cy={r1(8 + rnd() * 170)} r={r1(0.6 + rnd() * 1.1)} fill="#fff" opacity={r1(0.35 + rnd() * 0.6)} />
              ))}
            <circle cx={r1(sp.from + Math.min(w * 0.3, 330))} cy="84" r="26" fill={pal.orb} opacity="0.9" />
            <circle cx={r1(sp.from + Math.min(w * 0.3, 330))} cy="84" r="44" fill={pal.orb} opacity="0.14" />
            {farLayer(sp.world.key, sp.from, sp.to, rnd, pal.far)}
            <path d={`M${sp.from},${H} L${terrainPoints(sp.from, sp.to).replaceAll(' ', ' L')} L${sp.to},${H} Z`} fill={pal.ground} />
            <polyline points={terrainPoints(sp.from, sp.to)} fill="none" stroke={pal.top} strokeWidth="5" strokeLinecap="round" />
            {decorXs.filter((x) => x > sp.from + 46 && x < sp.to - 46 && x > posX(0) + 60).map((x, i) => decor(sp.world.key, x, rnd, `d${i}`))}
            <text x={sp.from + (sp.index === 0 ? 24 : 54)} y="34" fill="#fff" opacity="0.75" fontSize="11" fontWeight="700" letterSpacing="2">
              MUNDO {sp.index + 1}
            </text>
            <text x={sp.from + (sp.index === 0 ? 24 : 54)} y="58" fill="#fff" fontSize="20" fontWeight="700">
              {sp.world.name}
            </text>
          </g>
        );
      })}
      {/* portais entre mundos */}
      {spans.slice(1).map((sp) => {
        const y = terrainY(sp.from);
        return (
          <g key={`gate-${sp.index}`} transform={`translate(${r1(sp.from)},${r1(y)})`}>
            <path d="M-26,4 L-26,-64 A26,26 0 0 1 26,-64 L26,4 Z" fill={PALETTE[sp.world.key].sky[1]} opacity="0.55" />
            <path className="jr-gate" d="M-18,4 L-18,-62 A18,18 0 0 1 18,-62 L18,4 Z" fill="#fff" opacity="0.22" />
            <path d="M-26,4 L-26,-64 A26,26 0 0 1 26,-64 L26,4" fill="none" stroke="#f3ead7" strokeWidth="7" strokeLinecap="round" />
            <circle cx="0" cy="-90" r="5" fill="#ffd76a" />
          </g>
        );
      })}
      {/* acampamento inicial */}
      <g transform={`translate(${posX(0)},${r1(terrainY(posX(0)))})`}>
        <path d="M-52,2 L-32,-34 L-12,2 Z" fill="#f3ead7" />
        <path d="M-36,2 L-32,-14 L-28,2 Z" fill="#7a5a3a" />
        <line x1="-32" y1="-34" x2="-32" y2="-46" stroke="#f3ead7" strokeWidth="2" />
        <path d="M-32,-46 L-20,-42 L-32,-38 Z" fill="#ffcf5c" />
      </g>
      {/* torre do boss final, atrás do último milestone */}
      <g transform={`translate(${nodeX(n - 1)},${r1(terrainY(nodeX(n - 1)))})`}>
        <path d="M44,2 L44,-96 L38,-96 L38,-110 L48,-110 L48,-102 L56,-102 L56,-110 L66,-110 L66,-102 L74,-102 L74,-110 L84,-110 L84,-96 L78,-96 L78,2 Z" fill="#120d2c" stroke="#b48cff" strokeWidth="1.5" />
        <path d="M54,2 L54,-22 A7,7 0 0 1 68,-22 L68,2 Z" fill="#ffd76a" opacity="0.8" />
        <rect x="57" y="-70" width="8" height="12" rx="4" fill="#ffd76a" opacity="0.8" />
      </g>
    </>
  );
});

export const Scene = memo(function Scene({ trail, nodes, litTo, selected, onSelect }: SceneProps) {
  const n = trail.milestones.length;
  return (
    <>
      <Backdrop trail={trail} />
      {/* o caminho: pontilhado adiante, aceso até o progresso real */}
      <polyline points={terrainPoints(posX(0), nodeX(n - 1))} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      {litTo > 0 && <polyline points={terrainPoints(posX(0), posX(litTo))} fill="none" stroke="#ffcf5c" strokeWidth="5" strokeLinecap="round" />}
      {trail.milestones.map((m, i) => {
        const x = nodeX(i);
        const y = terrainY(x);
        const v = nodes[i];
        const st = NODE_STYLE[v.state];
        const boss = i === n - 1;
        const r = boss ? 20 : 17;
        // a placa fica acima da cabeça da personagem, que para exatamente em x
        const cy = -90;
        return (
          <g
            key={m.slug}
            transform={`translate(${x},${r1(y)})`}
            role="button"
            tabIndex={0}
            aria-label={`Milestone ${m.num}: ${m.name}`}
            aria-pressed={selected === i}
            className="jr-node cursor-pointer"
            onClick={() => onSelect(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(i);
              }
            }}
          >
            <rect x="-44" y="-128" width="88" height="172" fill="transparent" />
            <line x1="0" y1="0" x2="0" y2={cy + r} stroke="#f3ead7" strokeWidth="3" strokeLinecap="round" />
            {v.state === 'current' && <circle className="jr-pulse" cx="0" cy={cy} r={r + 4} fill="none" stroke="#ffcf5c" strokeWidth="3" />}
            {selected === i && <circle cx="0" cy={cy} r={r + 6} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="5 4" />}
            <circle cx="0" cy={cy} r={r} fill={st.fill} stroke={st.stroke} strokeWidth="2.5" strokeDasharray={st.dash} />
            <text x="0" y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={st.text} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {m.num}
            </text>
            {boss && <path d="M-9,-114 L-9,-124 L-4.5,-119 L0,-126 L4.5,-119 L9,-124 L9,-114 Z" fill="#ffd23f" stroke="#8a5a00" strokeWidth="1" />}
            {!boss && (
              <text x="0" y={cy - r - 7} textAnchor="middle" fontSize="12" aria-hidden="true">
                {[1, 2, 3].map((k) => (
                  <tspan key={k} fill={k <= v.stars ? '#ffd23f' : '#fff'} fillOpacity={k <= v.stars ? 1 : 0.35}>★</tspan>
                ))}
              </text>
            )}
            <text x="0" y="26" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff" fillOpacity="0.92" stroke="#000" strokeOpacity="0.35" strokeWidth="2.5" paintOrder="stroke">
              {shortName(m.name)}
            </text>
          </g>
        );
      })}
    </>
  );
});
