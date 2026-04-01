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
var scramble_exports = {};
__export(scramble_exports, {
  generateScramble: () => generateScramble
});
module.exports = __toCommonJS(scramble_exports);
var import_moves = require("./moves.js");
function generateScramble(config = 20, randomFallback = Math.random) {
  if (typeof config === "number") {
    return generateScramble({
      size: 3,
      length: config,
      random: randomFallback
    });
  }
  const size = config.size ?? 3;
  const length = config.length ?? defaultScrambleLength(size);
  const random = config.random ?? Math.random;
  const movePool = (0, import_moves.getAllMoveNames)(size, { includeInner: size > 3 });
  const scramble = [];
  while (scramble.length < length) {
    const previousMove = scramble.at(-1);
    const previousAxis = previousMove ? (0, import_moves.moveAxis)(previousMove) : null;
    const availableMoves = movePool.filter((move) => (0, import_moves.moveAxis)(move) !== previousAxis);
    const nextMove = availableMoves[Math.floor(random() * availableMoves.length)];
    scramble.push(nextMove);
  }
  return scramble;
}
function defaultScrambleLength(size) {
  if (size === 3) {
    return 20;
  }
  return size * 12;
}
