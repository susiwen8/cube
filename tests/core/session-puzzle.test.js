import test from 'node:test';
import assert from 'node:assert/strict';

import { createSessionState } from '../../src/shared/core/session.js';
import { toPageViewModel } from '../../src/shared/adapters/platform-session.js';

test('session state tracks the selected puzzle id and view model uses puzzle labels', () => {
  const session = createSessionState({ puzzleId: 'pyraminx' });
  const model = toPageViewModel(session, { elapsedMs: 0 });

  assert.equal(session.puzzleId, 'pyraminx');
  assert.equal(model.puzzleId, 'pyraminx');
  assert.equal(model.sizeLabel, 'Pyraminx');
  assert.equal(model.recordsTitle, 'Pyraminx 成绩');
});
