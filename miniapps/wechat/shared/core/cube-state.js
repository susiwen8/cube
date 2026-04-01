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
var cube_state_exports = {};
__export(cube_state_exports, {
  FACE_DEFINITIONS: () => FACE_DEFINITIONS,
  FACE_NAMES: () => FACE_NAMES,
  applyMove: () => applyMove,
  applyMoves: () => applyMoves,
  cloneState: () => cloneState,
  createSolvedState: () => createSolvedState,
  getFaceColors: () => getFaceColors,
  getFaceDefinition: () => getFaceDefinition,
  getMovePermutation: () => getMovePermutation,
  getSlotMetadata: () => getSlotMetadata,
  getStaticSlotMetadata: () => getStaticSlotMetadata,
  isSolved: () => isSolved,
  serializeState: () => serializeState
});
module.exports = __toCommonJS(cube_state_exports);
var import_moves = require("./moves.js");
const FACE_DEFINITIONS = Object.freeze({
  U: { normal: [0, 1, 0], colAxis: [1, 0, 0], rowAxis: [0, 0, 1], color: "W" },
  R: { normal: [1, 0, 0], colAxis: [0, 0, -1], rowAxis: [0, -1, 0], color: "R" },
  F: { normal: [0, 0, 1], colAxis: [1, 0, 0], rowAxis: [0, -1, 0], color: "G" },
  D: { normal: [0, -1, 0], colAxis: [1, 0, 0], rowAxis: [0, 0, -1], color: "Y" },
  L: { normal: [-1, 0, 0], colAxis: [0, 0, 1], rowAxis: [0, -1, 0], color: "O" },
  B: { normal: [0, 0, -1], colAxis: [-1, 0, 0], rowAxis: [0, -1, 0], color: "B" }
});
const FACE_NAMES = Object.freeze(Object.keys(FACE_DEFINITIONS));
const SLOT_CACHE = /* @__PURE__ */ new Map();
const PERMUTATION_CACHE = /* @__PURE__ */ new Map();
function createSolvedState(size = 3) {
  const metadata = getCubeMetadata(size);
  return {
    size,
    colors: metadata.slots.map((slot) => FACE_DEFINITIONS[slot.face].color)
  };
}
function cloneState(state) {
  return {
    size: state.size,
    colors: [...state.colors]
  };
}
function serializeState(state) {
  return `${state.size}|${state.colors.join("")}`;
}
function isSolved(state) {
  const faceSize = state.size * state.size;
  for (const [faceIndex] of FACE_NAMES.entries()) {
    const start = faceIndex * faceSize;
    const target = state.colors[start];
    for (let index = start; index < start + faceSize; index += 1) {
      if (state.colors[index] !== target) {
        return false;
      }
    }
  }
  return true;
}
function applyMove(state, move) {
  const permutation = getMovePermutation(state.size, move);
  const next = new Array(state.colors.length);
  for (let sourceIndex = 0; sourceIndex < state.colors.length; sourceIndex += 1) {
    next[permutation[sourceIndex]] = state.colors[sourceIndex];
  }
  return {
    size: state.size,
    colors: next
  };
}
function applyMoves(state, moves) {
  return moves.reduce((current, move) => applyMove(current, move), cloneState(state));
}
function getFaceColors(state, face) {
  const faceSize = state.size * state.size;
  const start = FACE_NAMES.indexOf(face) * faceSize;
  return state.colors.slice(start, start + faceSize);
}
function getSlotMetadata(size = 3) {
  return getCubeMetadata(size).slots.map((slot) => ({
    ...slot,
    normal: [...slot.normal],
    abstractCenter: [...slot.abstractCenter],
    cubie: [...slot.cubie]
  }));
}
function getStaticSlotMetadata(size = 3) {
  return getCubeMetadata(size).slots;
}
function getFaceDefinition(face) {
  const definition = FACE_DEFINITIONS[face];
  if (!definition) {
    throw new Error(`Unknown face definition: ${face}`);
  }
  return {
    ...definition,
    normal: [...definition.normal],
    colAxis: [...definition.colAxis],
    rowAxis: [...definition.rowAxis]
  };
}
function getMovePermutation(size, move) {
  const notation = (0, import_moves.parseMove)(move).notation;
  const cacheKey = `${size}|${notation}`;
  if (!PERMUTATION_CACHE.has(cacheKey)) {
    PERMUTATION_CACHE.set(cacheKey, buildPermutation(size, notation));
  }
  return PERMUTATION_CACHE.get(cacheKey);
}
function getCubeMetadata(size) {
  if (!SLOT_CACHE.has(size)) {
    SLOT_CACHE.set(size, buildCubeMetadata(size));
  }
  return SLOT_CACHE.get(size);
}
function buildCubeMetadata(size) {
  const coords = Array.from({ length: size }, (_, index) => -size + 1 + index * 2);
  const slots = [];
  const slotIndexByKey = /* @__PURE__ */ new Map();
  for (const face of FACE_NAMES) {
    const definition = FACE_DEFINITIONS[face];
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const rowCoord = coords[row];
        const colCoord = coords[col];
        const abstractCenter = addVectors(
          scaleVector(definition.normal, size),
          scaleVector(definition.colAxis, colCoord),
          scaleVector(definition.rowAxis, rowCoord)
        );
        const slot = {
          size,
          face,
          row,
          col,
          index: row * size + col,
          normal: [...definition.normal],
          abstractCenter,
          cubie: abstractCenter.map((value) => Math.abs(value) === size ? Math.sign(value) * (size - 1) : value)
        };
        slotIndexByKey.set(slotKey(slot.normal, slot.abstractCenter), slots.length);
        slots.push(slot);
      }
    }
  }
  return {
    slots,
    slotIndexByKey
  };
}
function buildPermutation(size, move) {
  const metadata = getCubeMetadata(size);
  const parsed = (0, import_moves.parseMove)(move);
  const turns = parsed.turns;
  const layer = (0, import_moves.getLayerCoordinate)(size, parsed);
  const permutation = new Array(metadata.slots.length);
  for (let slotIndex = 0; slotIndex < metadata.slots.length; slotIndex += 1) {
    const slot = metadata.slots[slotIndex];
    if (slot.cubie[axisIndex(parsed.axis)] !== layer) {
      permutation[slotIndex] = slotIndex;
      continue;
    }
    const rotatedCenter = rotateVector(slot.abstractCenter, parsed.axis, turns);
    const rotatedNormal = rotateVector(slot.normal, parsed.axis, turns);
    const destinationIndex = metadata.slotIndexByKey.get(slotKey(rotatedNormal, rotatedCenter));
    if (destinationIndex === void 0) {
      throw new Error(`No destination slot found for move ${move} on ${size}x${size}`);
    }
    permutation[slotIndex] = destinationIndex;
  }
  return permutation;
}
function axisIndex(axis) {
  return { x: 0, y: 1, z: 2 }[axis];
}
function rotateVector(vector, axis, turns) {
  let remaining = (turns % 4 + 4) % 4;
  let next = [...vector];
  while (remaining > 0) {
    next = rotatePositiveQuarter(next, axis);
    remaining -= 1;
  }
  return next;
}
function rotatePositiveQuarter([x, y, z], axis) {
  if (axis === "x") {
    return [x, -z, y];
  }
  if (axis === "y") {
    return [z, y, -x];
  }
  return [-y, x, z];
}
function addVectors(...vectors) {
  return vectors.reduce(
    (accumulator, vector) => accumulator.map((value, index) => value + vector[index]),
    [0, 0, 0]
  );
}
function scaleVector(vector, scalar) {
  return vector.map((value) => value * scalar);
}
function slotKey(normal, center) {
  return `${normal.join(",")}|${center.join(",")}`;
}
