export function createWebStorageBackend(storage = globalThis.localStorage) {
  const fallbackStore = new Map();

  return {
    getItem(key) {
      if (storage) {
        try {
          const value = storage.getItem(key);
          if (value !== null && value !== undefined) {
            return value;
          }
        } catch {}
      }

      return fallbackStore.get(key) ?? null;
    },

    setItem(key, value) {
      if (storage) {
        try {
          storage.setItem(key, value);
          fallbackStore.delete(key);
          return;
        } catch {}
      }

      fallbackStore.set(key, value);
    },
  };
}
