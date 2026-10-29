// Verifica todo link externo de content/modules/*.mdx, data/hints/*.yaml e data/module-refs.ts.
// Regra do projeto: link que não passa aqui não entra no site.
// Vídeos do YouTube são checados via oEmbed (a página em si sempre responde 200).
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { moduleRefs } from '../data/module-refs.ts';

const root = (rel: string) => fileURLToPath(new URL(`../${rel}`, import.meta.url));
const sources = [
  ...readdirSync(root('content/modules')).filter((f) => f.endsWith('.mdx')).map((f) => `content/modules/${f}`),
  ...readdirSync(root('data/hints')).filter((f) => f.endsWith('.yaml')).map((f) => `data/hints/${f}`),
];

const urls = new Map<string, string[]>();
for (const file of sources) {
  for (const m of readFileSync(root(file), 'utf8').matchAll(/https?:\/\/[^\s)<>"'`\]]+/g)) {
    const url = m[0].replace(/[.,;:]+$/, '');
    urls.set(url, [...(urls.get(url) ?? []), file]);
  }
}

for (const [slug, refs] of Object.entries(moduleRefs))
  for (const { url } of refs)
    if (/^https?:/.test(url)) urls.set(url, [...(urls.get(url) ?? []), `data/module-refs.ts (${slug})`]);

async function check(url: string): Promise<string | null> {
  const yt = /youtube\.com\/watch\?v=([\w-]+)|youtu\.be\/([\w-]+)/.exec(url);
  const target = yt ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}` : url;
  try {
    const res = await fetch(target, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    if (!res.ok) return `HTTP ${res.status}`;
    if (yt) return null;
    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('text/html')) {
      const html = await res.text();
      if (/<title[^>]*>\s*(404|Page not found|Not Found)/i.test(html)) return 'página de 404';
    }
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

let failed = 0;
for (const [url, files] of urls) {
  const err = await check(url);
  if (err) {
    failed++;
    console.error(`FALHOU ${url} (${err}) em ${[...new Set(files)].join(', ')}`);
  } else console.log(`ok     ${url}`);
}
console.log(`\n${urls.size - failed}/${urls.size} links ok.`);
if (failed) process.exit(1);
