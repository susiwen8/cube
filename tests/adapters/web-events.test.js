import test from 'node:test';
import assert from 'node:assert/strict';

import { getWebTouchPoint } from '../../src/shared/adapters/web-events.js';

test('web events normalize pointer coordinates', () => {
  assert.deepEqual(
    getWebTouchPoint({
      clientX: 12,
      clientY: 24,
    }),
    { x: 12, y: 24 },
  );
});

test('web events normalize changedTouches coordinates', () => {
  assert.deepEqual(
    getWebTouchPoint({
      changedTouches: [{ pageX: 44, pageY: 88 }],
    }),
    { x: 44, y: 88 },
  );
});

test('web events prefer client coordinates when both client and page positions exist', () => {
  assert.deepEqual(
    getWebTouchPoint({
      changedTouches: [{ clientX: 44, clientY: 88, pageX: 144, pageY: 188 }],
    }),
    { x: 44, y: 88 },
  );
});
