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
var web_runtime_exports = {};
__export(web_runtime_exports, {
  createWebPlatform: () => createWebPlatform
});
module.exports = __toCommonJS(web_runtime_exports);
var import_web_storage = require("./web-storage.js");
var import_web_events = require("./web-events.js");
function createWebPlatform(options = {}) {
  return {
    lessons: options.lessons,
    now: options.now,
    timers: options.timers,
    updateView: options.updateView,
    storageBackend: options.storageBackend ?? (0, import_web_storage.createWebStorageBackend)(options.storage),
    createCanvasContext(host) {
      const canvas = resolveCanvas(host);
      return canvas?.getContext?.("2d") ?? null;
    },
    measureElementRect(host, selector, callback) {
      const element = resolveElement(host, selector);
      callback(element?.getBoundingClientRect?.() ?? null);
    },
    getTouchPoint: options.getTouchPoint ?? import_web_events.getWebTouchPoint
  };
}
function resolveCanvas(host) {
  if (!host) {
    return null;
  }
  if (host.canvas) {
    return host.canvas;
  }
  if (typeof globalThis.HTMLCanvasElement === "function" && host instanceof globalThis.HTMLCanvasElement) {
    return host;
  }
  return null;
}
function resolveElement(host, selector) {
  if (!host) {
    return null;
  }
  if (selector === "#cubeTouchSurface") {
    return host.touchSurface ?? host.surface ?? host.canvas ?? host;
  }
  if (selector === "#cubeCanvas") {
    return host.canvas ?? host;
  }
  if (selector === "#canvasWrap") {
    return host.wrap ?? host.canvas ?? host;
  }
  return host.canvas ?? host;
}
