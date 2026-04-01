import { cubePuzzle } from './cube.js';
import { pyraminxPuzzle } from './pyraminx.js';
import { skewbPuzzle } from './skewb.js';
import { megaminxPuzzle } from './megaminx.js';

const PUZZLE_CATALOG = Object.freeze([
  cubePuzzle,
  pyraminxPuzzle,
  skewbPuzzle,
  megaminxPuzzle,
]);

export function getPuzzleCatalog() {
  return PUZZLE_CATALOG.map((entry) => ({ ...entry }));
}

export function getPuzzleDefinition(id = 'cube') {
  return PUZZLE_CATALOG.find((entry) => entry.id === id) ?? PUZZLE_CATALOG[0];
}
