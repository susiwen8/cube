var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var web_storage_exports = {};
__export(web_storage_exports, {
  createWebStorageBackend: () => createWebStorageBackend
});
module.exports = __toCommonJS(web_storage_exports);
function createWebStorageBackend(storage = globalThis.localStorage) {
  const fallbackStore = /* @__PURE__ */ new Map();
  return {
    getItem(key) {
      if (storage) {
        try {
          const value = storage.getItem(key);
          if (value !== null && value !== void 0) {
            return value;
          }
        } catch {
        }
      }
      return fallbackStore.get(key) ?? null;
    },
    setItem(key, value) {
      if (storage) {
        try {
          storage.setItem(key, value);
          fallbackStore.delete(key);
          return;
        } catch {
        }
      }
      fallbackStore.set(key, value);
    }
  };
}
