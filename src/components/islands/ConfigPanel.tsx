import { useRef, useState } from 'react';
import { useProgress, useStorageError } from '../../lib/progress/react.ts';
import { isMastered, totalSolved } from '../../lib/progress/selectors.ts';
import { replaceProgress, toggleMastered } from '../../lib/progress/store.ts';
import { downloadProgress, readProgressFile } from '../../lib/progress/exportImport.ts';
import { emptyProgress } from '../../lib/progress/types.ts';
import type { TrailData } from '../../lib/trail.ts';

export default function ConfigPanel({ trail }: { trail: TrailData }) {
  const { state, ready } = useProgress();
  const storageError = useStorageError();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const onImport = async (f: File | undefined) => {
    if (!f) return;
    const r = await readProgressFile(f);
    if (file.current) file.current.value = '';
    if (!r.ok) return setMsg({ ok: false, text: `Import recusado: ${r.error}` });
    const n = totalSolved(r.state).solved;
    if (!confirm(`Substituir o progresso atual pelo do arquivo (${n} resolvidos)? O atual será perdido se não estiver exportado.`)) return;
    replaceProgress(r.state);
    setMsg({ ok: true, text: `Progresso importado: ${n} problemas resolvidos.` });
  };

  const onReset = () => {
    if (!confirm('Apagar todo o progresso deste navegador? Exporte antes se quiser guardar.')) return;
    replaceProgress(emptyProgress());
    setMsg({ ok: true, text: 'Progresso apagado.' });
  };

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold">Backup</h2>
        <p className="mt-1 text-sm text-muted">
          O progresso fica no <code>localStorage</code> deste navegador
          {storageError ? ' (indisponível agora: só em memória)' : ''}. Exporte para levar a outra máquina ou para não perder nada.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!ready}
            onClick={() => downloadProgress(state)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:opacity-90 disabled:opacity-50"
          >
            Exportar JSON
          </button>
          <button type="button" disabled={!ready} onClick={() => file.current?.click()} className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-surface-2">
            Importar JSON…
          </button>
          <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
          <button type="button" disabled={!ready} onClick={onReset} className="ml-auto rounded-lg border border-danger/50 px-4 py-2 text-sm text-danger hover:bg-danger/10">
            Apagar tudo
          </button>
        </div>
        {msg && <p className={`mt-3 text-sm ${msg.ok ? 'text-ok' : 'text-danger'}`}>{msg.text}</p>}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Milestones que você já domina</h2>
        <p className="mt-1 text-sm text-muted">
          Marcados aqui são pulados no cálculo do "próximo problema", mas os problemas não contam como resolvidos.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {trail.milestones.map((m) => (
            <li key={m.slug}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-sm select-none hover:bg-surface-2">
                <input type="checkbox" className="accent-[var(--c-accent)]" disabled={!ready} checked={isMastered(state, m.slug)} onChange={() => toggleMastered(m.slug)} />
                <span className="tabular-nums text-faint">{m.num}.</span>
                <span className="truncate">{m.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
