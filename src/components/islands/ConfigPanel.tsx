import { useEffect, useRef, useState } from 'react';
import { playLevelUp, setSoundOn, soundOn } from '../../lib/sound.ts';
import { useProgress, useStorageError, useSync } from '../../lib/progress/react.ts';
import { SYNC_CONFIGURED, currentUser, sendLoginEmail, signOut, verifyLoginCode } from '../../lib/progress/sync.ts';
import { syncNow } from '../../lib/progress/adapters/synced.ts';
import { isMastered, totalSolved } from '../../lib/progress/selectors.ts';
import { replaceProgress, toggleMastered } from '../../lib/progress/store.ts';
import { Icon } from '../ui.tsx';
import { downloadProgress, readProgressFile } from '../../lib/progress/exportImport.ts';
import { emptyProgress } from '../../lib/progress/types.ts';
import type { TrailData } from '../../lib/trail.ts';

export default function ConfigPanel({ trail }: { trail: TrailData }) {
  const { state, ready } = useProgress();
  const storageError = useStorageError();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [sound, setSound] = useState(true);
  useEffect(() => setSound(soundOn()), []);

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
      <SyncSection />

      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold">Backup</h2>
        <p className="mt-1 text-sm text-muted">
          Cópia em arquivo do progresso deste navegador
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

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface p-6">
        <div>
          <h2 className="text-lg font-semibold">Som</h2>
          <p className="mt-1 text-sm text-muted">Fanfarra curta ao subir de nível.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={sound}
          onClick={() => {
            const on = !sound;
            setSound(on);
            setSoundOn(on);
            if (on) void playLevelUp();
          }}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${sound ? 'bg-accent' : 'bg-surface-2'}`}
        >
          <span className="sr-only">Som ao subir de nível</span>
          <span className={`absolute top-1 left-1 size-5 rounded-full bg-fg transition-transform ${sound ? 'translate-x-5' : ''}`} />
        </button>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Milestones que você já domina</h2>
        <p className="mt-1 text-sm text-muted">
          Marcados aqui são pulados no cálculo do "próximo problema", mas os problemas não contam como resolvidos.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {trail.milestones.map((m) => (
            <li key={m.slug} className="min-w-0">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-sm select-none hover:bg-surface-2">
                <input type="checkbox" className="accent-[var(--c-accent)]" disabled={!ready} checked={isMastered(state, m.slug)} onChange={() => toggleMastered(m.slug)} />
                <span className="tabular-nums text-faint">{m.num}.</span>
                <span className="min-w-0 truncate">{m.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SyncSection() {
  const sync = useSync();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Nesta página o SDK é carregado sempre, para mostrar se há sessão (e concluir o login do link do e-mail).
  useEffect(() => {
    if (SYNC_CONFIGURED) void currentUser(true);
  }, []);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setErr(null);
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const box = 'rounded-xl border bg-surface p-6';
  if (!SYNC_CONFIGURED)
    return (
      <section className={`${box} border-dashed border-line`}>
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Icon name="bolt" size={18} className="text-faint" /> Sincronização</h2>
        <p className="mt-1 text-sm text-muted">
          Ainda não configurada neste site: o progresso fica só neste navegador. Para ligar, defina <code>PUBLIC_SUPABASE_URL</code> e{' '}
          <code>PUBLIC_SUPABASE_ANON_KEY</code> (passo a passo no README).
        </p>
      </section>
    );

  if (sync.email !== null) {
    const when = sync.lastSyncedAt ? new Date(sync.lastSyncedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null;
    return (
      <section className={`${box} ${sync.status === 'error' ? 'border-danger/50' : 'border-ok/40'}`}>
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Icon name="bolt" size={18} className="text-ok" /> Sincronização ligada</h2>
        <p className="mt-1 text-sm text-muted">
          Conectado como <span className="font-medium text-fg">{sync.email}</span>. O progresso deste navegador é mesclado com o da nuvem: em cada problema vale a alteração mais recente.
        </p>
        <p role="status" className={`mt-3 text-sm ${sync.status === 'error' ? 'text-danger' : 'text-muted'}`}>
          {sync.status === 'syncing' && 'Sincronizando…'}
          {sync.status === 'ok' && `Sincronizado${when ? ` às ${when}` : ''}.`}
          {sync.status === 'error' && `Não consegui sincronizar: ${sync.error}. Seu progresso continua salvo neste navegador.`}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" disabled={busy} onClick={() => run(syncNow)} className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-surface-2 disabled:opacity-50">
            Sincronizar agora
          </button>
          <button type="button" disabled={busy} onClick={() => run(signOut)} className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-50">
            Sair deste dispositivo
          </button>
        </div>
        {err && <p className="mt-3 text-sm text-danger">{err}</p>}
      </section>
    );
  }

  return (
    <section className={`${box} border-accent/40`}>
      <h2 className="flex items-center gap-2 text-lg font-semibold"><Icon name="bolt" size={18} className="text-accent" /> Sincronizar entre dispositivos</h2>
      <p className="mt-1 text-sm text-muted">
        Entre com o mesmo e-mail em cada dispositivo. Você recebe um link de acesso; não há senha. O que já existe neste navegador é mesclado com a nuvem, nada é apagado.
      </p>
      <form
        className="mt-4 flex flex-wrap gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            await sendLoginEmail(email.trim());
            setSent(true);
          });
        }}
      >
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          aria-label="E-mail"
          className="min-w-0 flex-1 basis-56 rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent/60"
        />
        <button type="submit" disabled={busy} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:opacity-90 disabled:opacity-50">
          {sent ? 'Reenviar link' : 'Enviar link de acesso'}
        </button>
      </form>
      {sent && (
        <div className="mt-4 rounded-lg bg-surface-2 p-4 text-sm">
          <p>Link enviado para <span className="font-medium">{email}</span>. Abra-o neste dispositivo para concluir.</p>
          <form
            className="mt-3 flex flex-wrap items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await verifyLoginCode(email.trim(), code);
                await currentUser(true);
                await syncNow();
              });
            }}
          >
            <label htmlFor="sync-code" className="text-muted">Ou digite o código do e-mail:</label>
            <input
              id="sync-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-32 rounded-lg border border-line bg-bg px-3 py-1.5 font-mono text-sm tracking-widest outline-none focus:border-accent/60"
            />
            <button type="submit" disabled={busy || code.trim().length < 6} className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-bg disabled:opacity-50">
              Confirmar
            </button>
          </form>
        </div>
      )}
      {err && <p className="mt-3 text-sm text-danger">{err}</p>}
    </section>
  );
}
