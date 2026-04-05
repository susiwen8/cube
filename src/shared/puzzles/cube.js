import { applyMove, applyMoves, createSolvedState, isSolved } from '../core/cube-state.js';
import { generateScramble } from '../core/scramble.js';
import { buildSolvePlan } from '../core/solver.js';
import { buildStickerScene } from '../render/cube-renderer.js';

export const cubePuzzle = {
  id: 'cube',
  label: '魔方',
  defaultSize: 3,
  supportsSize(size) {
    return Number.isInteger(size) && size >= 3 && size <= 10;
  },
  createSolvedState({ size = 3 } = {}) {
    return createSolvedState(size);
  },
  applyMove(state, move) {
    return applyMove(state, move);
  },
  applyMoves(state, moves) {
    return applyMoves(state, moves);
  },
  isSolved(state) {
    return isSolved(state);
  },
  generateScramble({ size = 3, random } = {}) {
    return generateScramble({ size, random });
  },
  buildSolvePlan({ state, history }) {
    return buildSolvePlan({
      cube: state,
      history,
      maxDepth: history?.length ? 0 : undefined,
    });
  },
  buildScene(state, camera, options = {}) {
    return buildStickerScene(state, camera, options);
  },
  getDisplayName(size = 3) {
    return `${size}阶魔方`;
  },
  getRecordsTitle(size = 3) {
    return `${size}阶成绩`;
  },
  getMovePad() {
    return [];
  },
  showSizePicker: true,
  showLessons: true,
  usesDirectTouchMoves: true,
  cameraDistance: 5.9,
  cameraOffsetX: -4,
  cameraOffsetY: -18,
};
