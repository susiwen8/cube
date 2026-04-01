import { applyMove, isSolved, serializeState } from './cube-state.js';
import { getAllMoveNames, invertMoves, moveAxis, normalizeMoveHistory, parseMove } from './moves.js';

export function buildSolveSequence(history) {
  return invertMoves(normalizeMoveHistory(history));
}

export function buildSolvePlan({ cube, history = [], maxDepth = 7 } = {}) {
  if (!cube) {
    throw new Error('buildSolvePlan requires a cube state');
  }

  if (isSolved(cube)) {
    return {
      moves: [],
      strategy: 'solved',
    };
  }

  const stateMoves = cube.size === 3 ? findStateSolution(cube, maxDepth) : null;
  if (stateMoves) {
    return {
      moves: stateMoves,
      strategy: 'state-search',
    };
  }

  if (history.length > 0) {
    return {
      moves: buildSolveSequence(history),
      strategy: 'history-fallback',
    };
  }

  return {
    moves: [],
    strategy: 'unsolved',
  };
}

function findStateSolution(cube, maxDepth) {
  for (let depth = 0; depth <= maxDepth; depth += 1) {
    const result = depthLimitedSearch(cube, depth, null, new Set([serializeState(cube)]));
    if (result) {
      return result;
    }
  }

  return null;
}

function depthLimitedSearch(cube, depthRemaining, previousMove, visited) {
  if (isSolved(cube)) {
    return [];
  }

  if (depthRemaining === 0) {
    return null;
  }

  for (const move of getAllMoveNames(cube.size, { includeInner: false })) {
    if (shouldSkipMove(previousMove, move)) {
      continue;
    }

    const nextCube = applyMove(cube, move);
    const signature = serializeState(nextCube);
    if (visited.has(signature)) {
      continue;
    }

    visited.add(signature);
    const result = depthLimitedSearch(nextCube, depthRemaining - 1, move, visited);
    visited.delete(signature);

    if (result) {
      return [move, ...result];
    }
  }

  return null;
}

function shouldSkipMove(previousMove, nextMove) {
  if (!previousMove) {
    return false;
  }

  const previous = parseMove(previousMove);
  const next = parseMove(nextMove);

  if (previous.face === next.face && previous.depth === next.depth) {
    return true;
  }

  return moveAxis(previousMove) === moveAxis(nextMove) && canonicalMoveKey(previous) > canonicalMoveKey(next);
}

function canonicalMoveKey(parsed) {
  return `${String(parsed.depth).padStart(2, '0')}:${parsed.face}`;
}
