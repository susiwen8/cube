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
var helpers_exports = {};
__export(helpers_exports, {
  applyCyclesToState: () => applyCyclesToState,
  clonePuzzleState: () => clonePuzzleState,
  createFaceColorState: () => createFaceColorState,
  invertMoveList: () => invertMoveList,
  isFaceColorStateSolved: () => isFaceColorStateSolved,
  mixHexColors: () => mixHexColors,
  resolveDragDirection: () => resolveDragDirection
});
module.exports = __toCommonJS(helpers_exports);
function createFaceColorState(puzzleId, faceLayouts) {
  return {
    puzzleId,
    colors: faceLayouts.flatMap((faceLayout) => new Array(faceLayout.stickerCount).fill(faceLayout.color))
  };
}
function resolveDragDirection(drag, threshold = 12) {
  if (Math.hypot(drag.dx, drag.dy) < threshold) {
    return null;
  }
  if (Math.abs(drag.dx) >= Math.abs(drag.dy)) {
    return {
      axis: "x",
      sign: Math.sign(drag.dx) || 1
    };
  }
  return {
    axis: "y",
    sign: Math.sign(drag.dy) || 1
  };
}
function clonePuzzleState(state) {
  return {
    puzzleId: state.puzzleId,
    colors: [...state.colors]
  };
}
function isFaceColorStateSolved(state, faceLayouts) {
  let offset = 0;
  for (const faceLayout of faceLayouts) {
    const faceColors = state.colors.slice(offset, offset + faceLayout.stickerCount);
    const target = faceColors[0];
    if (faceColors.some((color) => color !== target)) {
      return false;
    }
    offset += faceLayout.stickerCount;
  }
  return true;
}
function applyCyclesToState(state, cycles, turns = 1) {
  let next = clonePuzzleState(state);
  const normalizedTurns = normalizeTurns(turns);
  for (let step = 0; step < normalizedTurns; step += 1) {
    const colors = [...next.colors];
    for (const cycle of cycles) {
      for (let index = 0; index < cycle.length; index += 1) {
        const sourceIndex = cycle[index];
        const destinationIndex = cycle[(index + 1) % cycle.length];
        colors[destinationIndex] = next.colors[sourceIndex];
      }
    }
    next = {
      ...next,
      colors
    };
  }
  return next;
}
function invertMoveList(moves, invertMove) {
  return [...moves].reverse().map((move) => invertMove(move));
}
function mixHexColors(baseHex, targetHex, amount = 0.5) {
  const base = normalizeHex(baseHex);
  const target = normalizeHex(targetHex);
  const mixAmount = clamp(amount, 0, 1);
  const channels = [0, 2, 4].map((offset) => {
    const baseChannel = Number.parseInt(base.slice(offset, offset + 2), 16);
    const targetChannel = Number.parseInt(target.slice(offset, offset + 2), 16);
    const mixed = Math.round(baseChannel + (targetChannel - baseChannel) * mixAmount);
    return mixed.toString(16).padStart(2, "0");
  });
  return `#${channels.join("")}`;
}
function normalizeTurns(turns) {
  const normalized = (turns % 4 + 4) % 4;
  return normalized;
}
function normalizeHex(hex) {
  const value = String(hex ?? "").trim().replace(/^#/, "");
  if (value.length === 3) {
    return value.split("").map((channel) => channel + channel).join("");
  }
  return value.padEnd(6, "0").slice(0, 6);
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
