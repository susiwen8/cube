import test from 'node:test';
import assert from 'node:assert/strict';

import { getLessonById, getTutorialLessons } from '../../src/shared/core/tutorial.js';

test('tutorial exposes seven beginner lessons', () => {
  const lessons = getTutorialLessons();

  assert.equal(lessons.length, 7);
});

test('each lesson contains title, summary, notation, and optional demo moves', () => {
  for (const lesson of getTutorialLessons()) {
    assert.equal(typeof lesson.id, 'string');
    assert.equal(typeof lesson.title, 'string');
    assert.equal(typeof lesson.summary, 'string');
    assert.equal(Array.isArray(lesson.notation), true);
    assert.equal(Array.isArray(lesson.demoMoves), true);
  }
});

test('lesson lookup returns a stable lesson definition', () => {
  const lesson = getLessonById('white-cross');

  assert.equal(lesson.title, '白十字');
  assert.deepEqual(lesson.focusFaces, ['U', 'F']);
});
