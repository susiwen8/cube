export function createStorageAdapter(backend) {
  return {
    getJSON(key, fallbackValue) {
      const raw = backend.getItem(key);

      if (raw === undefined || raw === null || raw === '') {
        return fallbackValue;
      }

      if (typeof raw === 'string') {
        return JSON.parse(raw);
      }

      return raw;
    },

    setJSON(key, value) {
      backend.setItem(key, JSON.stringify(value));
    },
  };
}
