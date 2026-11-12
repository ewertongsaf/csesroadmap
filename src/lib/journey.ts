// Camada de jogo da página /jornada: XP, nível, estrelas, mundos e conquistas.
// Tudo é DERIVADO do progresso que já existe (nada novo é salvo no ProgressState).
// Funções puras, testadas em tests/journey.test.ts.
import { isMastered, milestoneProgress, nextProblem, statusOf, streaks, totalSolved } from './progress/selectors.ts';
import { isSolved, type ProgressState } from './progress/types.ts';
import { slotsOf, type TrailData, type TrailMilestone } from './trail.ts';

// ---------- XP e nível ----------

/** XP de um problema resolvido sozinho: 10 por ponto de dificuldade. Com dica vale 70%. */
export const problemXp = (difficulty: number, withHint: boolean) => Math.round(difficulty * 10 * (withHint ? 0.7 : 1));
/** Bônus por fechar todos os slots de um milestone (lista + inéditos do checkpoint). */
export const MILESTONE_BONUS = 50;

export function totalXp(trail: TrailData, s: ProgressState) {
  let xp = 0;
  for (const p of trail.problems) {
    const st = statusOf(s, p.id);
    if (isSolved(st)) xp += problemXp(p.difficulty, st === 'solved_with_hint');
  }
  for (const m of trail.milestones) if (milestoneProgress(s, m).done) xp += MILESTONE_BONUS;
  return xp;
}

/** XP máximo da trilha (tudo resolvido sem dica). */
export function maxXp(trail: TrailData) {
  return trail.problems.reduce((acc, p) => acc + problemXp(p.difficulty, false), 0) + trail.milestones.length * MILESTONE_BONUS;
}

/** XP acumulado necessário para ESTAR no nível `level` (nível 1 = 0 XP). Cresce quadraticamente. */
export const xpForLevel = (level: number) => 25 * level * (level - 1);

export function levelInfo(xp: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const floor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, into: xp - floor, span: next - floor, toNext: next - xp };
}

const TITLES: [minLevel: number, title: string][] = [
  [1, 'Novata'],
  [3, 'Aprendiz'],
  [6, 'Exploradora'],
  [10, 'Estrategista'],
  [15, 'Mestra das estruturas'],
  [20, 'Lenda do CSES'],
];
export const titleFor = (level: number) => TITLES.filter(([min]) => level >= min).at(-1)![1];

/** Equipamentos da personagem, liberados por nível. A ordem é a de desbloqueio. */
export const GEAR = [
  { key: 'scarf', level: 3, name: 'Cachecol de aprendiz' },
  { key: 'cape', level: 6, name: 'Capa de exploradora' },
  { key: 'staff', level: 10, name: 'Cajado de estrategista' },
  { key: 'aura', level: 15, name: 'Aura das estruturas' },
  { key: 'crown', level: 20, name: 'Coroa de lenda' },
] as const;
export type GearKey = (typeof GEAR)[number]['key'];
export const gearAt = (level: number): GearKey[] => GEAR.filter((g) => level >= g.level).map((g) => g.key);

// ---------- Estrelas ----------

/** 0–3 estrelas: 1 = metade dos slots; 2 = tudo resolvido; 3 = tudo resolvido sem nenhuma dica. */
export function milestoneStars(s: ProgressState, m: TrailMilestone): 0 | 1 | 2 | 3 {
  const slots = slotsOf(m);
  const solved = slots.filter((id) => isSolved(statusOf(s, id))).length;
  if (solved === slots.length) return slots.every((id) => statusOf(s, id) === 'solved') ? 3 : 2;
  return solved * 2 >= slots.length ? 1 : 0;
}

// ---------- Posição na trilha ----------

/**
 * Coordenada contínua da personagem: 0 = acampamento inicial, i+1 = bandeira do milestone de índice i.
 * Ela caminha em direção à bandeira do milestone atual conforme os problemas dele são resolvidos.
 */
export function trailPosition(trail: TrailData, s: ProgressState) {
  const next = nextProblem(trail, s);
  if (!next) return trail.milestones.length;
  const prog = milestoneProgress(s, trail.milestones[next.ms]);
  return next.ms + prog.solved / prog.total;
}

/** Índice do milestone "atual" (o do próximo problema); o último quando a trilha acabou. */
export const currentMilestone = (trail: TrailData, s: ProgressState) => nextProblem(trail, s)?.ms ?? trail.milestones.length - 1;

// ---------- Mundos (um por fase) ----------

export interface World {
  key: 'vale' | 'canions' | 'floresta' | 'picos' | 'cidadela';
  name: string;
  blurb: string;
}

/** Na ordem das fases de data/roadmap.ts. */
export const WORLDS: World[] = [
  { key: 'vale', name: 'Vale dos Fundamentos', blurb: 'Campos abertos para aprender a andar: listas, ordenação e as primeiras ferramentas.' },
  { key: 'canions', name: 'Cânions da Memória', blurb: 'Tabelas de DP empilhadas na rocha e rotas de grafos entre os platôs.' },
  { key: 'floresta', name: 'Floresta das Árvores', blurb: 'Segment trees, LCA e raízes por toda parte.' },
  { key: 'picos', name: 'Picos dos Números', blurb: 'Ar rarefeito: matemática, bits e DP avançada entre cristais.' },
  { key: 'cidadela', name: 'Cidadela das Estrelas', blurb: 'Strings, fluxo, geometria e o boss final no topo da torre.' },
];
export const worldOf = (phase: number) => WORLDS[Math.min(phase, WORLDS.length - 1)];

export function worldProgress(trail: TrailData, s: ProgressState, phase: number) {
  let solved = 0;
  let total = 0;
  let cleared = 0;
  let count = 0;
  for (const m of trail.milestones) {
    if (m.phase !== phase) continue;
    const p = milestoneProgress(s, m);
    solved += p.solved;
    total += p.total;
    count++;
    if (p.done) cleared++;
  }
  return { solved, total, milestones: count, cleared, done: count > 0 && cleared === count };
}

// ---------- Conquistas ----------

export interface Achievement {
  key: string;
  name: string;
  how: string;
  icon: string;
  unlocked: boolean;
}

export function achievements(trail: TrailData, s: ProgressState, today = new Date()): Achievement[] {
  const { solved, withHint } = totalSolved(s);
  const clean = solved - withHint;
  const best = streaks(s, today).best;
  const bestDay = Math.max(0, ...Object.values(s.activity).map((d) => d.solved));
  const anyThreeStars = trail.milestones.some((m) => milestoneStars(s, m) === 3);
  const blind = trail.milestones.some((m) => m.reserved.length > 0 && m.reserved.every((id) => isSolved(statusOf(s, id))));
  const out: Achievement[] = [
    { key: 'first', name: 'Primeiro passo', how: 'Resolva 1 problema', icon: '👣', unlocked: solved >= 1 },
    { key: 's10', name: 'Pegando o ritmo', how: 'Resolva 10 problemas', icon: '🥾', unlocked: solved >= 10 },
    { key: 's50', name: 'Meia centena', how: 'Resolva 50 problemas', icon: '🎒', unlocked: solved >= 50 },
    { key: 's100', name: 'Centurião', how: 'Resolva 100 problemas', icon: '🛡️', unlocked: solved >= 100 },
    { key: 's200', name: 'Metade do mapa', how: 'Resolva 200 problemas', icon: '🧭', unlocked: solved >= 200 },
    { key: 'clean25', name: 'Sem empurrão', how: 'Resolva 25 problemas sem abrir dica', icon: '🧠', unlocked: clean >= 25 },
    { key: 'stars3', name: 'Três estrelas', how: 'Feche um milestone inteiro sem dicas', icon: '⭐', unlocked: anyThreeStars },
    { key: 'blind', name: 'Olhos vendados', how: 'Resolva os inéditos de um Checkpoint Cego', icon: '🎯', unlocked: blind },
    { key: 'day5', name: 'Dia cheio', how: 'Resolva 5 problemas no mesmo dia', icon: '☀️', unlocked: bestDay >= 5 },
    { key: 'st3', name: 'Fogueira acesa', how: 'Streak de 3 dias', icon: '🔥', unlocked: best >= 3 },
    { key: 'st7', name: 'Semana inteira', how: 'Streak de 7 dias', icon: '📅', unlocked: best >= 7 },
    { key: 'st30', name: 'Hábito de ferro', how: 'Streak de 30 dias', icon: '⛓️', unlocked: best >= 30 },
  ];
  trail.phases.forEach((_, i) => {
    const w = worldOf(i);
    out.push({ key: `world-${w.key}`, name: `${w.name}: concluído`, how: `Feche todos os milestones da fase ${i + 1}`, icon: '🏁', unlocked: worldProgress(trail, s, i).done });
  });
  out.push({ key: 'all', name: 'Trilha completa', how: `Resolva os ${trail.problems.length} problemas`, icon: '👑', unlocked: solved >= trail.problems.length && trail.problems.length > 0 });
  return out;
}

/** Tudo que a página precisa, num cálculo só. */
export function journeySummary(trail: TrailData, s: ProgressState) {
  const xp = totalXp(trail, s);
  const lvl = levelInfo(xp);
  return {
    xp,
    ...lvl,
    title: titleFor(lvl.level),
    gear: gearAt(lvl.level),
    nextGear: GEAR.find((g) => g.level > lvl.level) ?? null,
    position: trailPosition(trail, s),
    current: currentMilestone(trail, s),
    finished: nextProblem(trail, s) === null,
    mastered: (slug: string) => isMastered(s, slug),
  };
}
