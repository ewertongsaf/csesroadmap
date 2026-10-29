import type { APIRoute } from 'astro';
import { conceptLabel, milestones, moduleBySlug, problems } from '../lib/data.ts';
import { checkpointPath, milestonePath, modulePath, problemPath } from '../lib/trail.ts';
import type { SearchItem } from '../lib/search.ts';

export const GET: APIRoute = () => {
  const items: SearchItem[] = [
    { kind: 'page', title: 'Roadmap', sub: 'Trilha completa', href: '/roadmap' },
    { kind: 'page', title: 'Estatísticas', sub: 'Progresso, streak e heatmap', href: '/stats' },
    { kind: 'page', title: 'Checklist antes de submeter', sub: 'Erros clássicos', href: '/checklist' },
    { kind: 'page', title: 'Template C++', sub: 'Copiar template', href: '/template' },
    { kind: 'page', title: 'Progresso', sub: 'Exportar, importar, já domino', href: '/config' },
    ...milestones.flatMap((m): SearchItem[] => [
      { kind: 'milestone', title: m.name, sub: `Milestone ${m.num}`, href: milestonePath(m.slug) },
      { kind: 'milestone', title: `Checkpoint Cego ${m.num}`, sub: m.name, href: checkpointPath(m.slug) },
    ]),
    ...[...moduleBySlug.values()]
      .filter((mod) => mod.status === 'written')
      .map((mod): SearchItem => ({ kind: 'module', title: mod.title, sub: 'Módulo', href: modulePath(mod.slug) })),
    ...problems.map((p): SearchItem => ({
      kind: 'problem',
      id: p.id,
      title: p.title,
      sub: p.reserved ? `Checkpoint Cego ${p.milestone.num}` : `Milestone ${p.milestone.num}`,
      href: problemPath(p.id),
      concepts: p.concepts.map(conceptLabel),
    })),
  ];
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
};
