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
var storage_exports = {};
__export(storage_exports, {
  createStorageAdapter: () => createStorageAdapter
});
module.exports = __toCommonJS(storage_exports);
function createStorageAdapter(backend) {
  return {
    getJSON(key, fallbackValue) {
      const raw = backend.getItem(key);
      if (raw === void 0 || raw === null || raw === "") {
        return fallbackValue;
      }
      if (typeof raw === "string") {
        return JSON.parse(raw);
      }
      return raw;
    },
    setJSON(key, value) {
      backend.setItem(key, JSON.stringify(value));
    }
  };
}
