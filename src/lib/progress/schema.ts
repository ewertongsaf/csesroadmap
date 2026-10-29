// Validação e migração do progresso (localStorage e import de JSON).
import { z } from 'zod';
import type { ProgressState } from './types.ts';

const problemSchema = z.object({
  status: z.enum(['not_started', 'trying', 'solved', 'solved_with_hint']),
  hintsRevealed: z.number().int().min(0).max(3).catch(0),
  notes: z.string().catch(''),
  code: z.string().catch(''),
  updatedAt: z.string(),
  solvedAt: z.string().optional(),
});

const v1Schema = z.object({
  version: z.literal(1),
  problems: z.record(z.string().regex(/^\d+$/), problemSchema),
  masteredMilestones: z.array(z.string()).catch([]),
  activity: z.record(z.string(), z.object({ solved: z.number().int().min(0), actions: z.number().int().min(0) })).catch({}),
  checkpointGuesses: z.record(z.string(), z.string()).catch({}),
});

/** Formato do arquivo exportado. */
export const EXPORT_KIND = 'cses-roadmap-progress';

/**
 * Aceita o estado puro ou o envelope de export ({ kind, exportedAt, progress }).
 * Quando houver versão 2, migre aqui: `if (raw.version === 1) raw = migrate1to2(raw)`.
 */
export function parseProgress(raw: unknown): { ok: true; state: ProgressState } | { ok: false; error: string } {
  const envelope = raw as { kind?: unknown; progress?: unknown } | null;
  const data = envelope && typeof envelope === 'object' && envelope.kind === EXPORT_KIND ? envelope.progress : raw;
  const r = v1Schema.safeParse(data);
  return r.success ? { ok: true, state: r.data } : { ok: false, error: z.prettifyError(r.error) };
}
