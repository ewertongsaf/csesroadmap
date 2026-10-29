// Garante a integridade de data/: roda no prebuild e em `npm run validate`.
// Usa o type stripping nativo do Node (>= 22.18), sem dependências.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { roadmap } from '../data/roadmap.ts';
import { modules } from '../data/modules.ts';
import { concepts } from '../data/concepts.ts';
import type { CsesProblem } from '../data/schema.ts';
import { parseHintFile } from '../data/hint-schema.ts';

const root = (rel: string) => fileURLToPath(new URL(`../${rel}`, import.meta.url));
const cses: CsesProblem[] = JSON.parse(readFileSync(root('data/cses-problems.json'), 'utf8')).problems;
const byId = new Map(cses.map((p) => [p.id, p]));

const errors: string[] = [];
const warn: string[] = [];
const err = (m: string) => errors.push(m);

const moduleSlugs = new Set<string>();
for (const m of modules) {
  if (moduleSlugs.has(m.slug)) err(`módulo duplicado: ${m.slug}`);
  moduleSlugs.add(m.slug);
  if (m.status === 'written' && !existsSync(root(`content/modules/${m.slug}.mdx`)))
    err(`módulo ${m.slug} marcado como written mas content/modules/${m.slug}.mdx não existe`);
  if (m.cph.length === 0 && !m.basedOn) err(`módulo ${m.slug} sem CPH e sem basedOn`);
}

const placed = new Map<number, string>(); // id -> slug do milestone
const order: number[] = [];
const milestoneSlugs = new Set<string>();
const usedModules = new Set<string>();

for (const phase of roadmap) {
  for (const ms of phase.milestones) {
    if (milestoneSlugs.has(ms.slug)) err(`milestone duplicado: ${ms.slug}`);
    milestoneSlugs.add(ms.slug);
    for (const mod of ms.modules) {
      if (!moduleSlugs.has(mod)) err(`${ms.slug}: módulo inexistente "${mod}"`);
      usedModules.add(mod);
    }
    const entries = [...ms.problems, ...ms.checkpoint.reserved];
    for (const e of entries) {
      if (!byId.has(e.id)) err(`${ms.slug}: id ${e.id} não existe no CSES`);
      if (placed.has(e.id)) err(`id ${e.id} aparece em ${placed.get(e.id)} e em ${ms.slug}`);
      placed.set(e.id, ms.slug);
      order.push(e.id);
      if (![1, 2, 3, 4, 5].includes(e.difficulty)) err(`${ms.slug}: dificuldade inválida em ${e.id}`);
      if (e.concepts.length === 0) err(`${ms.slug}: ${e.id} sem conceitos`);
      for (const c of e.concepts) if (!(c in concepts)) err(`${ms.slug}: conceito desconhecido "${c}" em ${e.id}`);
    }
    // review: só problemas já posicionados (neste milestone ou antes), nunca reservados de checkpoint
    const reservedHere = new Set(ms.checkpoint.reserved.map((e) => e.id));
    for (const id of ms.checkpoint.review) {
      if (!placed.has(id)) err(`${ms.slug}: review ${id} ainda não apareceu na trilha`);
      if (reservedHere.has(id)) err(`${ms.slug}: ${id} está em reserved e review ao mesmo tempo`);
    }
    const blind = ms.checkpoint.reserved.length + ms.checkpoint.review.length;
    if (blind < 3 || blind > 5) warn.push(`${ms.slug}: checkpoint com ${blind} problemas (alvo 3–5)`);
  }
}

for (const p of cses) if (!placed.has(p.id)) err(`id ${p.id} (${p.title}) não está na trilha`);

// Dicas: data/hints/<milestone>.yaml só pode ter problemas daquele milestone.
let hinted = 0;
for (const f of readdirSync(root('data/hints')).filter((f) => f.endsWith('.yaml'))) {
  const slug = f.replace(/\.yaml$/, '');
  if (!milestoneSlugs.has(slug)) err(`data/hints/${f}: não existe milestone "${slug}"`);
  try {
    for (const id of parseHintFile(readFileSync(root(`data/hints/${f}`), 'utf8'), f).keys()) {
      if (placed.get(id) !== slug) err(`data/hints/${f}: ${id} pertence a "${placed.get(id) ?? 'nenhum milestone'}"`);
      hinted++;
    }
  } catch (e) {
    err((e as Error).message);
  }
}
for (const m of modules) if (!usedModules.has(m.slug)) warn.push(`módulo ${m.slug} não é usado por nenhum milestone`);

const milestones = roadmap.flatMap((ph) => ph.milestones);
if (process.argv.includes('--summary')) {
  for (const ph of roadmap) {
    console.log(`\n${ph.name}`);
    for (const ms of ph.milestones) {
      const n = ms.problems.length + ms.checkpoint.reserved.length;
      console.log(`  ${String(milestones.indexOf(ms) + 1).padStart(2)}. ${ms.name} — ${n} problemas (${ms.checkpoint.reserved.length} reservados p/ checkpoint)`);
    }
  }
  console.log('');
}

for (const w of warn) console.warn(`aviso: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`ERRO: ${e}`);
  console.error(`\n${errors.length} erro(s).`);
  process.exit(1);
}
console.log(`ok: ${placed.size}/${cses.length} problemas em ${milestones.length} milestones e ${roadmap.length} fases; ${moduleSlugs.size} módulos (${modules.filter((m) => m.status === 'written').length} escritos); ${hinted} problemas com dicas.`);
