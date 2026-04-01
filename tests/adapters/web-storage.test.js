import test from 'node:test';
import assert from 'node:assert/strict';

import { createWebStorageBackend } from '../../src/shared/adapters/web-storage.js';

test('web storage falls back to memory when localStorage writes fail', () => {
  const storage = createWebStorageBackend({
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
  });

  storage.setItem('cube-records', '[1]');

  assert.equal(storage.getItem('cube-records'), '[1]');
});

test('web storage reads browser storage when available', () => {
  const backingStore = new Map([['cube-records', '[1,2]']]);
  const storage = createWebStorageBackend({
    getItem(key) {
      return backingStore.get(key) ?? null;
    },
    setItem(key, value) {
      backingStore.set(key, value);
    },
  });

  assert.equal(storage.getItem('cube-records'), '[1,2]');
});
