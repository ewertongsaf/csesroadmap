// Estado de progresso compartilhado entre todas as ilhas da página (nanostores).
import { atom } from 'nanostores';
import { syncedAdapter } from './adapters/synced.ts';
import { emptyProblem, emptyProgress, isSolved, type ProblemProgress, type ProgressAdapter, type ProgressState, type Status } from './types.ts';
import { todayKey } from './dates.ts';

export const $progress = atom<ProgressState>(emptyProgress());
/** false até o primeiro load terminar: as ilhas mostram placeholders em vez de "0 resolvidos". */
export const $ready = atom(false);
/** Mensagem quando o storage falha (o site segue funcionando só em memória). */
export const $storageError = atom<string | null>(null);

let adapter: ProgressAdapter = syncedAdapter;
let started = false;
let applyingLoad = false;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

const describe = (e: unknown) => (e instanceof Error ? e.message : String(e));

async function load() {
  // Mudança ainda não salva (debounce) vai para o storage antes de reler: senão o reload a apagaria.
  flush();
  try {
    const state = await adapter.load();
    applyingLoad = true;
    $progress.set(state ?? emptyProgress());
  } catch (e) {
    $storageError.set(`Não consegui ler o progresso salvo (${adapter.name}): ${describe(e)}`);
  } finally {
    applyingLoad = false;
    $ready.set(true);
  }
}

function flush() {
  if (saveTimer === undefined) return;
  clearTimeout(saveTimer);
  saveTimer = undefined;
  adapter.save($progress.get()).catch((e) => $storageError.set(`Não consegui salvar o progresso (${adapter.name}): ${describe(e)}`));
}

/** Idempotente; chamado por toda ilha que usa o progresso. Só faz algo no navegador. */
export function startProgress() {
  if (started || typeof window === 'undefined') return;
  started = true;
  $progress.listen(() => {
    if (applyingLoad || !$ready.get()) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 250);
  });
  window.addEventListener('pagehide', flush);
  adapter.subscribe?.(() => void load());
  void load();
}

/** Troca o backend de persistência. */
export function setAdapter(next: ProgressAdapter) {
  adapter = next;
  if (started) void load();
}

function update(fn: (draft: ProgressState) => void) {
  const draft = structuredClone($progress.get());
  fn(draft);
  draft.updatedAt = new Date().toISOString();
  $progress.set(draft);
}

function touchProblem(draft: ProgressState, id: number): ProblemProgress {
  const p = (draft.problems[id] ??= emptyProblem());
  p.updatedAt = new Date().toISOString();
  return p;
}

export function setStatus(id: number, status: Status) {
  update((d) => {
    const p = touchProblem(d, id);
    if (p.status === status) return;
    const day = (d.activity[todayKey()] ??= { solved: 0, actions: 0 });
    day.actions++;
    if (isSolved(status) && !isSolved(p.status)) {
      day.solved++;
      p.solvedAt = p.updatedAt;
    }
    if (!isSolved(status)) delete p.solvedAt;
    p.status = status;
  });
}

export function revealHint(id: number, count: number) {
  update((d) => {
    const p = touchProblem(d, id);
    p.hintsRevealed = Math.max(p.hintsRevealed, count);
    if (p.status === 'not_started') p.status = 'trying';
  });
}

export const setNotes = (id: number, notes: string) => update((d) => void (touchProblem(d, id).notes = notes));
export const setCode = (id: number, code: string) => update((d) => void (touchProblem(d, id).code = code));

export function toggleMastered(slug: string) {
  update((d) => {
    const i = d.masteredMilestones.indexOf(slug);
    if (i >= 0) d.masteredMilestones.splice(i, 1);
    else d.masteredMilestones.push(slug);
  });
}

export function setGuess(id: number, guess: string) {
  update((d) => {
    if (guess) d.checkpointGuesses[id] = guess;
    else delete d.checkpointGuesses[id];
  });
}

/** Substitui tudo (import de JSON ou reset). Salva na hora. */
export function replaceProgress(state: ProgressState) {
  // resetAt avisa os outros dispositivos de que o que eles têm de mais antigo não vale mais.
  const now = new Date().toISOString();
  $progress.set({ ...state, updatedAt: now, resetAt: now });
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 0);
}
