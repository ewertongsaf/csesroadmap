import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeProgress, sameProgress } from '../src/lib/progress/merge.ts';
import { emptyProgress, type ProblemProgress, type ProgressState, type Status } from '../src/lib/progress/types.ts';

const prob = (status: Status, updatedAt: string, extra: Partial<ProblemProgress> = {}): ProblemProgress => ({ status, hintsRevealed: 0, notes: '', code: '', updatedAt, ...extra });
const st = (over: Partial<ProgressState>): ProgressState => ({ ...emptyProgress(), ...over });

test('problemas: união dos ids e, no mesmo id, vence o mais recente', () => {
  const phone = st({ problems: { 1: prob('solved', '2026-11-10T10:00:00Z'), 2: prob('trying', '2026-11-10T09:00:00Z', { notes: 'celular' }) } });
  const laptop = st({ problems: { 2: prob('solved', '2026-11-11T08:00:00Z', { notes: 'notebook' }), 3: prob('solved_with_hint', '2026-11-09T08:00:00Z') } });
  const m = mergeProgress(phone, laptop);
  assert.deepEqual(Object.keys(m.problems).sort(), ['1', '2', '3']);
  assert.equal(m.problems[2].status, 'solved');
  assert.equal(m.problems[2].notes, 'notebook');
  assert.ok(sameProgress(m, mergeProgress(laptop, phone)), 'a ordem dos argumentos não muda o resultado');
  assert.ok(sameProgress(m, mergeProgress(m, phone)), 'mesclar de novo não muda nada');
});

test('dicas reveladas nunca diminuem', () => {
  const a = st({ problems: { 1: prob('trying', '2026-11-10T10:00:00Z', { hintsRevealed: 2 }) } });
  const b = st({ problems: { 1: prob('solved', '2026-11-11T10:00:00Z', { hintsRevealed: 0 }) } });
  const m = mergeProgress(a, b);
  assert.equal(m.problems[1].status, 'solved');
  assert.equal(m.problems[1].hintsRevealed, 2);
});

test('atividade: maior contador por dia', () => {
  const a = st({ activity: { '2026-11-10': { solved: 2, actions: 3 }, '2026-11-11': { solved: 1, actions: 1 } } });
  const b = st({ activity: { '2026-11-10': { solved: 1, actions: 5 }, '2026-11-12': { solved: 4, actions: 4 } } });
  assert.deepEqual(mergeProgress(a, b).activity, {
    '2026-11-10': { solved: 2, actions: 5 },
    '2026-11-11': { solved: 1, actions: 1 },
    '2026-11-12': { solved: 4, actions: 4 },
  });
});

test('"já domino" e palpites vêm do estado mais novo (desmarcar não volta)', () => {
  const old = st({ masteredMilestones: ['a', 'b'], checkpointGuesses: { 7: 'greedy' }, updatedAt: '2026-11-10T10:00:00Z' });
  const fresh = st({ masteredMilestones: ['a'], checkpointGuesses: {}, updatedAt: '2026-11-11T10:00:00Z' });
  for (const m of [mergeProgress(old, fresh), mergeProgress(fresh, old)]) {
    assert.deepEqual(m.masteredMilestones, ['a']);
    assert.deepEqual(m.checkpointGuesses, {});
    assert.equal(m.updatedAt, '2026-11-11T10:00:00Z');
  }
});

test('reset: o outro dispositivo só mantém o que mudou depois do reset', () => {
  const reset = st({ problems: { 9: prob('solved', '2026-11-01T00:00:00Z') }, updatedAt: '2026-11-12T12:00:00Z', resetAt: '2026-11-12T12:00:00Z' });
  const other = st({
    problems: { 1: prob('solved', '2026-11-10T10:00:00Z'), 2: prob('solved', '2026-11-12T13:00:00Z') },
    masteredMilestones: ['a'],
    activity: { '2026-11-10': { solved: 1, actions: 1 } },
    updatedAt: '2026-11-12T13:00:00Z',
  });
  const m = mergeProgress(other, reset);
  assert.deepEqual(Object.keys(m.problems).sort(), ['2', '9'], 'o 9 veio do import; o 1 é anterior ao reset; o 2 é posterior');
  assert.deepEqual(m.masteredMilestones, []);
  assert.deepEqual(m.activity, {});
  assert.equal(m.resetAt, '2026-11-12T12:00:00Z');
  assert.ok(sameProgress(m, mergeProgress(reset, other)));
  assert.ok(sameProgress(mergeProgress(m, other), m), 'o dispositivo velho não ressuscita nada na rodada seguinte');
});

test('estado vazio e estados antigos sem updatedAt', () => {
  const a = st({ problems: { 1: prob('solved', '2026-11-10T10:00:00Z') }, masteredMilestones: ['a'] });
  assert.ok(sameProgress(mergeProgress(a, emptyProgress()), a));
  assert.ok(sameProgress(mergeProgress(emptyProgress(), a), a));
  const b = st({ masteredMilestones: ['b'], checkpointGuesses: { 3: 'dp' } });
  assert.deepEqual(mergeProgress(a, b).masteredMilestones, ['a', 'b']);
  assert.ok(sameProgress(mergeProgress(a, b), mergeProgress(b, a)));
  // primeira sincronização: este navegador ainda não tem updatedAt, a nuvem tem
  const cloud = st({ masteredMilestones: ['c'], updatedAt: '2026-11-11T10:00:00Z' });
  assert.deepEqual(mergeProgress(a, cloud).masteredMilestones, ['a', 'c']);
});
