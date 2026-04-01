import { createWebStorageBackend } from './web-storage.js';
import { getWebTouchPoint } from './web-events.js';

export function createWebPlatform(options = {}) {
  return {
    lessons: options.lessons,
    now: options.now,
    timers: options.timers,
    updateView: options.updateView,
    storageBackend: options.storageBackend ?? createWebStorageBackend(options.storage),

    createCanvasContext(host) {
      const canvas = resolveCanvas(host);
      return canvas?.getContext?.('2d') ?? null;
    },

    measureElementRect(host, selector, callback) {
      const element = resolveElement(host, selector);
      callback(element?.getBoundingClientRect?.() ?? null);
    },

    getTouchPoint: options.getTouchPoint ?? getWebTouchPoint,
  };
}

function resolveCanvas(host) {
  if (!host) {
    return null;
  }

  if (host.canvas) {
    return host.canvas;
  }

  if (typeof globalThis.HTMLCanvasElement === 'function' && host instanceof globalThis.HTMLCanvasElement) {
    return host;
  }

  return null;
}

function resolveElement(host, selector) {
  if (!host) {
    return null;
  }

  if (selector === '#cubeTouchSurface') {
    return host.touchSurface ?? host.surface ?? host.canvas ?? host;
  }

  if (selector === '#cubeCanvas') {
    return host.canvas ?? host;
  }

  if (selector === '#canvasWrap') {
    return host.wrap ?? host.canvas ?? host;
  }

  return host.canvas ?? host;
}
