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
var catalog_exports = {};
__export(catalog_exports, {
  getPuzzleCatalog: () => getPuzzleCatalog,
  getPuzzleDefinition: () => getPuzzleDefinition
});
module.exports = __toCommonJS(catalog_exports);
var import_cube = require("./cube.js");
var import_pyraminx = require("./pyraminx.js");
var import_skewb = require("./skewb.js");
var import_megaminx = require("./megaminx.js");
const PUZZLE_CATALOG = Object.freeze([
  import_cube.cubePuzzle,
  import_pyraminx.pyraminxPuzzle,
  import_skewb.skewbPuzzle,
  import_megaminx.megaminxPuzzle
]);
function getPuzzleCatalog() {
  return PUZZLE_CATALOG.map((entry) => ({ ...entry }));
}
function getPuzzleDefinition(id = "cube") {
  return PUZZLE_CATALOG.find((entry) => entry.id === id) ?? PUZZLE_CATALOG[0];
}
