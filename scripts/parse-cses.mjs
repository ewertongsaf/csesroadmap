// Converte o HTML de https://cses.fi/problemset/ em data/cses-problems.json.
// Uso: node scripts/parse-cses.mjs <caminho-do-html>
// Só extrai id, título, seção e a contagem pública de quem resolveu/tentou (sinal de dificuldade).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const htmlPath = process.argv[2];
if (!htmlPath) {
  console.error('uso: node scripts/parse-cses.mjs <problemset.html>');
  process.exit(1);
}
const html = readFileSync(htmlPath, 'utf8');

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
   .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");

const problems = [];
// Cada seção é um <h2> seguido de uma <ul class="task-list"> com os <li class="task">.
const sectionRe = /<h2>([^<]+)<\/h2>\s*<ul class="task-list">([\s\S]*?)<\/ul>/g;
const taskRe = /<a href="\/problemset\/task\/(\d+)\/?">([^<]+)<\/a><span class="detail">(\d+) \/ (\d+)<\/span>/g;
for (const [, rawSection, body] of html.matchAll(sectionRe)) {
  const section = decode(rawSection.trim());
  if (section === 'General') continue;
  for (const [, id, title, solved, attempted] of body.matchAll(taskRe)) {
    problems.push({ id: Number(id), title: decode(title.trim()), section, solvedBy: Number(solved), attemptedBy: Number(attempted) });
  }
}

const ids = new Set(problems.map((p) => p.id));
if (ids.size !== problems.length) throw new Error('ids duplicados no HTML');

const out = {
  source: 'https://cses.fi/problemset/',
  fetchedAt: new Date().toISOString().slice(0, 10),
  note: 'Gerado por scripts/parse-cses.mjs. Não editar à mão. Enunciados não são copiados (CC BY-NC-SA).',
  problems,
};
const target = fileURLToPath(new URL('../data/cses-problems.json', import.meta.url));
writeFileSync(target, JSON.stringify(out, null, 2) + '\n');

const counts = new Map();
for (const p of problems) counts.set(p.section, (counts.get(p.section) ?? 0) + 1);
for (const [s, c] of counts) console.log(`${String(c).padStart(4)}  ${s}`);
console.log(`${String(problems.length).padStart(4)}  TOTAL`);
