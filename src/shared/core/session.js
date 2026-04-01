import { normalizeMoveHistory } from './moves.js';
import { createTimerState, stopTimer, startTimer } from './timer.js';
import { getPuzzleDefinition } from '../puzzles/catalog.js';

export function createSessionState(options = {}) {
  const puzzleId = options.puzzleId ?? 'cube';
  const puzzle = getPuzzleDefinition(puzzleId);
  const size = puzzle.supportsSize(options.size ?? puzzle.defaultSize)
    ? (options.size ?? puzzle.defaultSize)
    : puzzle.defaultSize;

  return {
    puzzleId: puzzle.id,
    size,
    mode: 'free',
    cube: puzzle.createSolvedState({ size }),
    history: [],
    scramble: [],
    solveQueue: [],
    solveStrategy: null,
    assisted: false,
    moveCount: 0,
    timer: createTimerState(),
    records: [],
  };
}

export function scrambleSession(session, scramble = getPuzzle(session).generateScramble({ size: session.size }), options = {}) {
  const { timed = false, at = 0 } = options;
  const puzzle = getPuzzle(session);
  const cube = puzzle.applyMoves(puzzle.createSolvedState({ size: session.size }), scramble);

  return {
    ...session,
    cube,
    history: normalizeHistory(session, scramble),
    scramble: [...scramble],
    solveQueue: [],
    solveStrategy: null,
    assisted: false,
    moveCount: 0,
    timer: timed ? startTimer(createTimerState(), at) : createTimerState(),
  };
}

export function applySessionMove(session, move, options = {}) {
  const { at = 0, source = 'user' } = options;
  const puzzle = getPuzzle(session);
  const cube = puzzle.applyMove(session.cube, move);
  const history = normalizeHistory(session, [...session.history, move]);
  const moveCount = source === 'user' ? session.moveCount + 1 : session.moveCount;
  let timer = session.timer;

  if (timer.status === 'pending') {
    timer = startTimer(timer, at);
  }

  if (puzzle.isSolved(cube)) {
    timer = stopTimer(timer, at);
  }

  return {
    ...session,
    cube,
    history,
    moveCount,
    timer,
    solveQueue: source === 'solve' ? session.solveQueue.slice(1) : session.solveQueue,
  };
}

export function queueAutoSolve(session) {
  const solvePlan = getPuzzle(session).buildSolvePlan({
    state: session.cube,
    history: session.history,
    size: session.size,
  });

  return {
    ...session,
    assisted: true,
    solveQueue: solvePlan.moves,
    solveStrategy: solvePlan.strategy,
  };
}

export function stepAutoSolve(session, options = {}) {
  const nextMove = session.solveQueue[0];

  if (!nextMove) {
    return session;
  }

  return applySessionMove(session, nextMove, { ...options, source: 'solve' });
}

function getPuzzle(session) {
  return getPuzzleDefinition(session.puzzleId);
}

function normalizeHistory(session, moves) {
  if (session.puzzleId === 'cube') {
    return normalizeMoveHistory(moves);
  }

  return [...moves];
}
