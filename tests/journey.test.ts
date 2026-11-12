import { test } from 'node:test';
import assert from 'node:assert/strict';
import { achievements, gearAt, levelInfo, maxXp, milestoneStars, titleFor, totalXp, totalXpFromTable, trailPosition, worldProgress, xpForLevel, xpTableOf } from '../src/lib/journey.ts';
import { emptyProblem, emptyProgress, type Status } from '../src/lib/progress/types.ts';
import type { TrailData } from '../src/lib/trail.ts';

const trail: TrailData = {
  phases: [{ slug: 'f1', name: 'F1' }, { slug: 'f2', name: 'F2' }],
  milestones: [
    { slug: 'a', num: 1, name: 'A', phase: 0, ids: [1, 2], reserved: [3], review: [] },
    { slug: 'b', num: 2, name: 'B', phase: 1, ids: [4], reserved: [], review: [1] },
  ],
  problems: [
    { id: 1, title: 'p1', section: 'S', difficulty: 1, ms: 0, reserved: false },
    { id: 2, title: 'p2', section: 'S', difficulty: 3, ms: 0, reserved: false },
    { id: 3, title: 'p3', section: 'T', difficulty: 2, ms: 0, reserved: true },
    { id: 4, title: 'p4', section: 'T', difficulty: 5, ms: 1, reserved: false },
  ],
};

const withStatus = (entries: [number, Status][]) => {
  const s = emptyProgress();
  for (const [id, status] of entries) s.problems[id] = { ...emptyProblem(), status };
  return s;
};

test('XP: 10 por ponto de dificuldade, 70% com dica, bônus ao fechar o milestone', () => {
  assert.equal(totalXp(trail, emptyProgress()), 0);
  assert.equal(totalXp(trail, withStatus([[1, 'solved'], [2, 'solved_with_hint'], [4, 'trying']])), 10 + 21);
  assert.equal(totalXp(trail, withStatus([[1, 'solved'], [2, 'solved'], [3, 'solved']])), 10 + 30 + 20 + 50);
  assert.equal(maxXp(trail), 110 + 2 * 50);
  for (const s of [emptyProgress(), withStatus([[1, 'solved'], [2, 'solved_with_hint']]), withStatus([[1, 'solved'], [2, 'solved'], [3, 'solved'], [4, 'solved_with_hint']])])
    assert.equal(totalXpFromTable(xpTableOf(trail), s), totalXp(trail, s));
});

test('níveis: limites exatos e progresso dentro do nível', () => {
  assert.deepEqual(levelInfo(0), { level: 1, into: 0, span: 50, toNext: 50 });
  assert.equal(levelInfo(49).level, 1);
  assert.equal(levelInfo(50).level, 2);
  assert.equal(levelInfo(xpForLevel(10)).level, 10);
  assert.equal(levelInfo(xpForLevel(10) - 1).level, 9);
  assert.equal(titleFor(1), 'Novata');
  assert.equal(titleFor(7), 'Exploradora');
  assert.deepEqual(gearAt(2), []);
  assert.deepEqual(gearAt(10), ['scarf', 'cape', 'staff']);
});

test('estrelas: metade, tudo, tudo sem dica', () => {
  const m = trail.milestones[0];
  assert.equal(milestoneStars(emptyProgress(), m), 0);
  assert.equal(milestoneStars(withStatus([[1, 'solved']]), m), 0);
  assert.equal(milestoneStars(withStatus([[1, 'solved'], [2, 'solved']]), m), 1);
  assert.equal(milestoneStars(withStatus([[1, 'solved'], [2, 'solved_with_hint'], [3, 'solved']]), m), 2);
  assert.equal(milestoneStars(withStatus([[1, 'solved'], [2, 'solved'], [3, 'solved']]), m), 3);
});

test('posição na trilha avança dentro do milestone e pula os dominados', () => {
  assert.equal(trailPosition(trail, emptyProgress()), 0);
  assert.ok(Math.abs(trailPosition(trail, withStatus([[1, 'solved']])) - 1 / 3) < 1e-9);
  assert.equal(trailPosition(trail, withStatus([[1, 'solved'], [2, 'solved'], [3, 'solved']])), 1);
  assert.equal(trailPosition(trail, withStatus([[1, 'solved'], [2, 'solved'], [3, 'solved'], [4, 'solved']])), 2);
  const s = emptyProgress();
  s.masteredMilestones.push('a');
  assert.equal(trailPosition(trail, s), 1);
});

test('mundos e conquistas derivam do progresso', () => {
  const s = withStatus([[1, 'solved'], [2, 'solved'], [3, 'solved']]);
  assert.equal(worldProgress(trail, s, 0).done, true);
  assert.equal(worldProgress(trail, s, 1).done, false);
  const got = new Set(achievements(trail, s).filter((a) => a.unlocked).map((a) => a.key));
  assert.deepEqual([...got].sort(), ['blind', 'first', 'stars3', 'world-vale']);
  assert.equal(achievements(trail, emptyProgress()).some((a) => a.unlocked), false);
});
