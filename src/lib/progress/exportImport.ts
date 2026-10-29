import { EXPORT_KIND, parseProgress } from './schema.ts';
import { todayKey } from './dates.ts';
import type { ProgressState } from './types.ts';

export function downloadProgress(state: ProgressState) {
  const body = JSON.stringify({ kind: EXPORT_KIND, exportedAt: new Date().toISOString(), progress: state }, null, 2);
  const url = URL.createObjectURL(new Blob([body], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `cses-roadmap-${todayKey()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readProgressFile(file: File) {
  let raw: unknown;
  try {
    raw = JSON.parse(await file.text());
  } catch {
    return { ok: false as const, error: 'o arquivo não é um JSON válido' };
  }
  return parseProgress(raw);
}
