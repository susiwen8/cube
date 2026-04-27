import { getTutorialLessons } from '../core/tutorial.js';
import { createStorageAdapter as createBaseStorageAdapter } from './storage.js';
import { getPuzzleDefinition } from '../puzzles/catalog.js';

const SUPPORTED_CUBE_SIZES = Object.freeze([3, 4, 5, 6, 7, 8, 9, 10]);

export function createStorageAdapter(backend) {
  return createBaseStorageAdapter(backend);
}

export function getSupportedCubeSizes() {
  return [...SUPPORTED_CUBE_SIZES];
}

export function normalizeTouches(event = {}) {
  return {
    touches: normalizeTouchList(event.touches),
    changedTouches: normalizeTouchList(event.changedTouches),
  };
}

export function toPageViewModel(session, options = {}) {
  const puzzle = getPuzzleDefinition(session.puzzleId);
  const sizeLabel = puzzle.getDisplayName?.(session.size) ?? (session.puzzleId === 'cube' ? `${session.size}x${session.size} Cube` : puzzle.label);
  const recordsTitle = puzzle.getRecordsTitle?.(session.size) ?? (session.puzzleId === 'cube' ? `${session.size}x${session.size} Records` : `${puzzle.label} Records`);

  return {
    puzzleId: session.puzzleId ?? 'cube',
    puzzleLabel: puzzle.label,
    size: session.size,
    sizeLabel,
    recordsTitle,
    showSizePicker: puzzle.showSizePicker ?? false,
    showLessons: puzzle.showLessons ?? false,
    movePad: puzzle.getMovePad?.() ?? [],
    mode: session.mode,
    moveCount: session.moveCount,
    assisted: session.assisted,
    timerLabel: formatDuration(options.elapsedMs ?? session.timer.elapsedMs),
    solveQueueLabel: session.solveQueue.join(' '),
    solveStrategyLabel: formatSolveStrategy(session.solveStrategy),
    statusLabel: formatStatus(session),
    lessonCount: puzzle.showLessons === false ? 0 : getTutorialLessons().length,
  };
}

function normalizeTouchList(touches = []) {
  return touches.map((touch) => ({
    id: touch.identifier ?? touch.id ?? 0,
    x: touch.x ?? touch.pageX ?? touch.clientX ?? 0,
    y: touch.y ?? touch.pageY ?? touch.clientY ?? 0,
  }));
}

function formatStatus(session) {
  if (session.timer.status === 'pending') {
    return 'Timer Ready';
  }

  if (session.timer.status === 'running') {
    return session.assisted ? 'Assisted Solve Running' : 'Timer Running';
  }

  if (session.timer.status === 'finished') {
    return session.assisted ? 'Finished with Assist' : 'Solved';
  }

  return 'Free Play';
}

function formatSolveStrategy(strategy) {
  if (strategy === 'state-search') {
    return 'State Search';
  }

  if (strategy === 'history-fallback') {
    return 'History Fallback';
  }

  if (strategy === 'solved') {
    return 'Already Solved';
  }

  return 'Not Ready';
}

function formatDuration(elapsedMs) {
  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);
  const milliseconds = elapsedMs % 1000;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}
