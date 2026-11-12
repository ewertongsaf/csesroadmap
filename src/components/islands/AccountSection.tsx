// Conta (cadastro, login, recuperação de senha, nome de usuário) e editor de avatar.
// Usado na página /config. O avatar funciona sem conta; com conta, acompanha a pessoa entre dispositivos.
import { useEffect, useState } from 'react';
import { useProfile, useProgress, useSync } from '../../lib/progress/react.ts';
import { currentUser, sendPasswordReset, signIn, signOut, signUp, updatePassword } from '../../lib/progress/sync.ts';
import { syncNow } from '../../lib/progress/adapters/synced.ts';
import { journeySummary } from '../../lib/journey.ts';
import {
  DEFAULT_LOOK, EXTRA, EXTRA_LABEL, HAIR_COLOR, HAIR_STYLE, HAIR_STYLE_LABEL, OUTFIT, SKIN, USERNAME_RE, USERNAME_RULE,
  setLook, setUsername, syncProfile, usernameAvailable, type AvatarLook,
} from '../../lib/profile.ts';
import type { TrailData } from '../../lib/trail.ts';
import { HeroFigure, HeroPortrait } from '../journey/Hero.tsx';
import { Icon } from '../ui.tsx';

const input = 'w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent/60';
const primary = 'rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:opacity-90 disabled:opacity-50';
const ghost = 'rounded-lg border border-line px-4 py-2 text-sm hover:bg-surface-2 disabled:opacity-50';

function useAction() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setErr(null);
    try {
      await fn();
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { busy, err, run, clear: () => setErr(null) };
}

export function AccountSection({ trail }: { trail: TrailData }) {
  const sync = useSync();
  const profile = useProfile();
  const { state, ready } = useProgress();
  const gear = ready ? journeySummary(trail, state).gear : [];

  // O SDK só é baixado se houver chance de sessão (token salvo ou volta de um link de e-mail);
  // para quem está sem conta, ele entra quando um formulário é usado.
  useEffect(() => {
    void currentUser();
  }, []);

  return (
    <section className={`rounded-2xl border bg-surface p-5 sm:p-6 ${sync.email !== null ? (sync.status === 'error' ? 'border-danger/50' : 'border-ok/40') : 'border-accent/40'}`}>
      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-4 md:flex-col md:items-center md:text-center">
          <span className="grid size-28 shrink-0 place-items-center rounded-2xl bg-surface-2">
            <HeroPortrait look={profile.look} gear={gear} className="h-24" />
          </span>
          <p className="min-w-0 text-sm">
            <span className="block truncate text-base font-semibold">{profile.username ? `@${profile.username}` : 'Visitante'}</span>
            <span className="block truncate text-muted">{sync.email ?? 'sem conta neste navegador'}</span>
          </p>
        </div>
        <div className="min-w-0">
          {sync.recovery ? <NewPassword /> : sync.email !== null ? <SignedIn /> : <SignedOut />}
        </div>
      </div>
    </section>
  );
}

function SignedIn() {
  const sync = useSync();
  const profile = useProfile();
  const { busy, err, run } = useAction();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const when = sync.lastSyncedAt ? new Date(sync.lastSyncedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null;
  const provisional = profile.username?.startsWith('user_');

  return (
    <div>
      <h2 className="flex items-center gap-2 text-lg font-semibold"><Icon name="bolt" size={18} className="text-ok" /> Conta conectada</h2>
      <p className="mt-1 text-sm text-muted">Seu progresso e seu avatar acompanham você em qualquer dispositivo em que entrar com esta conta.</p>
      <p role="status" className={`mt-3 text-sm ${sync.status === 'error' ? 'text-danger' : 'text-muted'}`}>
        {sync.status === 'syncing' && 'Sincronizando…'}
        {sync.status === 'ok' && `Sincronizado${when ? ` às ${when}` : ''}.`}
        {sync.status === 'error' && `Não consegui sincronizar: ${sync.error}. Seu progresso continua salvo neste navegador.`}
      </p>

      {editing ? (
        <form
          className="mt-4 flex flex-wrap items-start gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => setUsername(name.trim())).then((ok) => ok && setEditing(false));
          }}
        >
          <div className="min-w-0 flex-1 basis-56">
            <input autoFocus aria-label="Nome de usuário" value={name} onChange={(e) => setName(e.target.value)} className={input} maxLength={20} />
            <p className="mt-1 text-xs text-faint">{USERNAME_RULE}</p>
          </div>
          <button type="submit" disabled={busy || !USERNAME_RE.test(name.trim())} className={primary}>Salvar nome</button>
          <button type="button" onClick={() => setEditing(false)} className={ghost}>Cancelar</button>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => { setName(provisional ? '' : (profile.username ?? '')); setEditing(true); }} className={provisional ? primary : ghost}>
            {provisional ? 'Escolher nome de usuário' : 'Trocar nome de usuário'}
          </button>
          <button type="button" disabled={busy} onClick={() => run(async () => { await syncNow(); await syncProfile(); })} className={ghost}>Sincronizar agora</button>
          <button type="button" disabled={busy} onClick={() => run(signOut)} className={`${ghost} text-muted`}>Sair deste dispositivo</button>
        </div>
      )}
      {err && <p role="alert" className="mt-3 text-sm text-danger">{err}</p>}
    </div>
  );
}

function SignedOut() {
  const [tab, setTab] = useState<'in' | 'up' | 'reset'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [free, setFree] = useState<boolean | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { busy, err, run, clear } = useAction();

  // "Este nome está livre?": consulta com um pequeno atraso enquanto a pessoa digita.
  useEffect(() => {
    setFree(null);
    if (tab !== 'up' || !USERNAME_RE.test(name)) return;
    const t = setTimeout(() => void usernameAvailable(name).then(setFree).catch(() => setFree(null)), 400);
    return () => clearTimeout(t);
  }, [name, tab]);

  const go = (t: typeof tab) => {
    setTab(t);
    setNotice(null);
    clear();
  };

  const submit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setNotice(null);
    void run(async () => {
      if (tab === 'in') {
        await signIn(email.trim(), password);
        await syncNow();
      } else if (tab === 'up') {
        const inside = await signUp(email.trim(), password, name);
        if (inside) await syncNow();
        else setNotice(`Conta criada. Enviamos um link de confirmação para ${email.trim()}: abra-o neste dispositivo para entrar.`);
      } else {
        await sendPasswordReset(email.trim());
        setNotice(`Se existir uma conta com ${email.trim()}, o link para criar uma senha nova já foi enviado.`);
      }
    });
  };

  const nameOk = USERNAME_RE.test(name);
  return (
    <div>
      <div role="tablist" aria-label="Conta" className="inline-flex rounded-lg border border-line p-0.5 text-sm">
        {([['in', 'Entrar'], ['up', 'Criar conta']] as const).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => go(k)} className={`rounded-md px-3.5 py-1.5 ${tab === k ? 'bg-surface-2 font-medium text-fg' : 'text-muted hover:text-fg'}`}>
            {label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">
        {tab === 'in' && 'Entre para sincronizar o progresso e o avatar entre dispositivos.'}
        {tab === 'up' && 'Crie uma conta para levar seu progresso a qualquer dispositivo. O que já existe neste navegador entra na conta, nada é apagado.'}
        {tab === 'reset' && 'Informe o e-mail da conta. Você recebe um link para criar uma senha nova.'}
      </p>
      <form className="mt-4 grid gap-3 sm:max-w-sm" onSubmit={submit}>
        {tab === 'up' && (
          <div>
            <label htmlFor="acc-name" className="mb-1 block text-xs font-medium text-muted">Nome de usuário</label>
            <input id="acc-name" required value={name} onChange={(e) => setName(e.target.value)} maxLength={20} autoComplete="username" className={input} aria-describedby="acc-name-hint" />
            <p id="acc-name-hint" className={`mt-1 text-xs ${nameOk && free === false ? 'text-danger' : nameOk && free ? 'text-ok' : 'text-faint'}`}>
              {!name || !nameOk ? USERNAME_RULE : free === null ? 'Conferindo…' : free ? 'Disponível.' : 'Esse nome já está em uso.'}
            </p>
          </div>
        )}
        <div>
          <label htmlFor="acc-email" className="mb-1 block text-xs font-medium text-muted">E-mail</label>
          <input id="acc-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} />
        </div>
        {tab !== 'reset' && (
          <div>
            <label htmlFor="acc-pass" className="mb-1 block text-xs font-medium text-muted">Senha</label>
            <input id="acc-pass" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={tab === 'up' ? 'new-password' : 'current-password'} className={input} />
            {tab === 'up' && <p className="mt-1 text-xs text-faint">Pelo menos 6 caracteres.</p>}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy || (tab === 'up' && (!nameOk || free === false))} className={primary}>
            {tab === 'in' ? 'Entrar' : tab === 'up' ? 'Criar conta' : 'Enviar link'}
          </button>
          {tab === 'in' && <button type="button" onClick={() => go('reset')} className="text-sm text-muted underline underline-offset-4 hover:text-fg">Esqueci minha senha</button>}
          {tab === 'reset' && <button type="button" onClick={() => go('in')} className="text-sm text-muted underline underline-offset-4 hover:text-fg">Voltar</button>}
        </div>
      </form>
      {notice && <p role="status" className="mt-3 rounded-lg bg-ok/10 px-3.5 py-2.5 text-sm">{notice}</p>}
      {err && <p role="alert" className="mt-3 text-sm text-danger">{err}</p>}
    </div>
  );
}

function NewPassword() {
  const [password, setPassword] = useState('');
  const { busy, err, run } = useAction();
  return (
    <div>
      <h2 className="text-lg font-semibold">Criar uma senha nova</h2>
      <p className="mt-1 text-sm text-muted">Você voltou pelo link de recuperação. Escolha a senha nova para concluir.</p>
      <form className="mt-4 flex flex-wrap items-start gap-3" onSubmit={(e) => { e.preventDefault(); void run(() => updatePassword(password)); }}>
        <input type="password" required minLength={6} autoFocus aria-label="Senha nova" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${input} sm:max-w-xs`} />
        <button type="submit" disabled={busy || password.length < 6} className={primary}>Salvar senha</button>
      </form>
      {err && <p role="alert" className="mt-3 text-sm text-danger">{err}</p>}
    </div>
  );
}

export function AvatarEditor({ trail }: { trail: TrailData }) {
  const { look } = useProfile();
  const { state, ready } = useProgress();
  const gear = ready ? journeySummary(trail, state).gear : [];
  const set = (patch: Partial<AvatarLook>) => setLook({ ...look, ...patch });
  const random = () => {
    const pick = (n: number) => Math.floor(Math.random() * n);
    setLook({ skin: pick(SKIN.length), hairColor: pick(HAIR_COLOR.length), outfit: pick(OUTFIT.length), hair: HAIR_STYLE[pick(HAIR_STYLE.length)], extra: EXTRA[pick(EXTRA.length)] });
  };

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Avatar</h2>
          <p className="mt-1 text-sm text-muted">Aparece no início, no mapa da jornada e ao subir de nível. Os equipamentos vêm do seu nível.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={random} className={ghost}>Aleatório</button>
          <button type="button" onClick={() => setLook(DEFAULT_LOOK)} className={`${ghost} text-muted`}>Padrão</button>
        </div>
      </div>
      <div className="mt-5 grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="grid size-44 place-items-center justify-self-center rounded-2xl bg-surface-2 md:justify-self-start">
          <HeroPortrait look={look} gear={gear} className="h-40" />
        </div>
        <div className="min-w-0 space-y-4">
          <Swatches label="Pele" colors={SKIN} value={look.skin} onPick={(skin) => set({ skin })} />
          <Swatches label="Cor do cabelo" colors={HAIR_COLOR} value={look.hairColor} onPick={(hairColor) => set({ hairColor })} />
          <Swatches label="Roupa" colors={OUTFIT} value={look.outfit} onPick={(outfit) => set({ outfit })} />
          <Choices label="Cabelo" options={HAIR_STYLE} names={HAIR_STYLE_LABEL} value={look.hair} preview={(hair) => ({ ...look, hair })} onPick={(hair) => set({ hair })} />
          <Choices label="Acessório" options={EXTRA} names={EXTRA_LABEL} value={look.extra} preview={(extra) => ({ ...look, extra })} onPick={(extra) => set({ extra })} />
        </div>
      </div>
    </section>
  );
}

function Swatches({ label, colors, value, onPick }: { label: string; colors: string[]; value: number; onPick: (i: number) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-medium uppercase tracking-wider text-faint">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {colors.map((c, i) => (
          <button
            key={c}
            type="button"
            aria-label={`${label} ${i + 1}`}
            aria-pressed={value === i}
            onClick={() => onPick(i)}
            className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${value === i ? 'border-fg ring-2 ring-accent ring-offset-2 ring-offset-surface' : 'border-line'}`}
            style={{ background: c }}
          />
        ))}
      </div>
    </fieldset>
  );
}

function Choices<T extends string>({ label, options, names, value, preview, onPick }: { label: string; options: readonly T[]; names: Record<T, string>; value: T; preview: (v: T) => AvatarLook; onPick: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-medium uppercase tracking-wider text-faint">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onPick(o)}
            className={`flex items-center gap-2 rounded-xl border py-1 pr-3 pl-1 text-sm ${value === o ? 'border-accent bg-accent/10 font-medium' : 'border-line text-muted hover:text-fg'}`}
          >
            <span className="grid size-10 place-items-center overflow-hidden rounded-lg bg-surface-2">
              <svg viewBox="-12 -50 24 24" className="size-10" aria-hidden="true">
                <HeroFigureHead look={preview(o)} />
              </svg>
            </span>
            {names[o]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

// Miniatura: só a cabeça do avatar (o recorte vem do viewBox do <svg> acima).
function HeroFigureHead({ look }: { look: AvatarLook }) {
  return <HeroFigure gear={[]} look={look} />;
}
