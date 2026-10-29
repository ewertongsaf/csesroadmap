import { test } from 'node:test';
import assert from 'node:assert/strict';
import { milestoneProgress, nextProblem, streaks, totalSolved } from '../src/lib/progress/selectors.ts';
import { parseProgress } from '../src/lib/progress/schema.ts';
import { emptyProblem, emptyProgress, type Status } from '../src/lib/progress/types.ts';
import type { TrailData } from '../src/lib/trail.ts';

const trail: TrailData = {
  phases: [{ slug: 'f', name: 'F' }],
  milestones: [
    { slug: 'a', num: 1, name: 'A', phase: 0, ids: [1, 2], reserved: [3], review: [] },
    { slug: 'b', num: 2, name: 'B', phase: 0, ids: [4], reserved: [], review: [1] },
  ],
  problems: [
    { id: 1, title: 'p1', section: 'S', difficulty: 1, ms: 0, reserved: false },
    { id: 2, title: 'p2', section: 'S', difficulty: 1, ms: 0, reserved: false },
    { id: 3, title: 'p3', section: 'T', difficulty: 1, ms: 0, reserved: true },
    { id: 4, title: 'p4', section: 'T', difficulty: 1, ms: 1, reserved: false },
  ],
};

const withStatus = (entries: [number, Status][]) => {
  const s = emptyProgress();
  for (const [id, status] of entries) s.problems[id] = { ...emptyProblem(), status };
  return s;
};

test('próximo problema segue a ordem da trilha e inclui reservados do checkpoint', () => {
  assert.equal(nextProblem(trail, emptyProgress())?.id, 1);
  assert.equal(nextProblem(trail, withStatus([[1, 'solved'], [2, 'solved_with_hint']]))?.id, 3);
  assert.equal(nextProblem(trail, withStatus([[1, 'trying']]))?.id, 1);
});

test('"já domino" pula o milestone sem contar como resolvido', () => {
  const s = emptyProgress();
  s.masteredMilestones = ['a'];
  assert.equal(nextProblem(trail, s)?.id, 4);
  assert.equal(totalSolved(s).solved, 0);
});

test('fim da trilha devolve null', () => {
  assert.equal(nextProblem(trail, withStatus([[1, 'solved'], [2, 'solved'], [3, 'solved'], [4, 'solved']])), null);
});

test('progresso do milestone conta lista + reservados', () => {
  assert.deepEqual(milestoneProgress(withStatus([[1, 'solved'], [3, 'trying']]), trail.milestones[0]), { solved: 1, trying: 1, total: 3, done: false });
});

test('streak: atual termina hoje ou ontem; melhor considera o histórico', () => {
  const s = emptyProgress();
  const a = { solved: 1, actions: 1 };
  s.activity = { '2026-10-01': a, '2026-10-02': a, '2026-10-03': a, '2026-10-27': a, '2026-10-28': a };
  assert.deepEqual(streaks(s, new Date(2026, 9, 29)), { current: 2, best: 3 });
  assert.deepEqual(streaks(s, new Date(2026, 9, 28)), { current: 2, best: 3 });
  assert.deepEqual(streaks(s, new Date(2026, 9, 31)), { current: 0, best: 3 });
});

test('import aceita o envelope de export e rejeita lixo', () => {
  const state = withStatus([[1, 'solved']]);
  const r = parseProgress({ kind: 'cses-roadmap-progress', exportedAt: 'x', progress: state });
  assert.equal(r.ok, true);
  assert.equal(parseProgress({ version: 2 }).ok, false);
  assert.equal(parseProgress({ ...state, problems: { abc: state.problems[1] } }).ok, false);
});
