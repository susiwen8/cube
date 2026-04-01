import { createSessionState, applySessionMove, queueAutoSolve, scrambleSession, stepAutoSolve } from '../core/session.js';
import { toPageViewModel, createStorageAdapter } from './platform-session.js';
import { getPuzzleDefinition } from '../puzzles/catalog.js';

const RECORDS_KEY = 'cube-records';

export function createAppController(options = {}) {
  const storage = createStorageAdapter(
    options.storageBackend ?? {
      getItem() {
        return null;
      },
      setItem() {},
    },
  );

  let allRecords = normalizeStoredRecords(storage.getJSON(RECORDS_KEY, []));
  let session = withScopedRecords(createSessionState({ size: options.initialSize ?? 3, puzzleId: options.initialPuzzleId ?? 'cube' }));

  function commit(nextSession) {
    if (
      nextSession.timer.status === 'finished' &&
      session.timer.status !== 'finished' &&
      !nextSession.assisted
    ) {
      allRecords = [
        {
          puzzleId: nextSession.puzzleId,
          size: nextSession.size,
          elapsedMs: nextSession.timer.elapsedMs,
          moveCount: nextSession.moveCount,
          scramble: [...nextSession.scramble],
          assisted: nextSession.assisted,
        },
        ...allRecords,
      ].slice(0, 100);

      storage.setJSON(RECORDS_KEY, allRecords);
    }

    session = withScopedRecords(nextSession);
    return session;
  }

  function withScopedRecords(nextSession) {
    return {
      ...nextSession,
      records: allRecords.filter((record) => (
        record.puzzleId === nextSession.puzzleId &&
        (nextSession.puzzleId !== 'cube' || record.size === nextSession.size)
      )).slice(0, 20),
    };
  }

  return {
    getSession() {
      return session;
    },

    getViewModel(optionsForView = {}) {
      return toPageViewModel(session, optionsForView);
    },

    setMode(mode) {
      return commit({
        ...session,
        mode,
      });
    },

    setSize(size) {
      return commit({
        ...createSessionState({ size, puzzleId: session.puzzleId }),
        mode: session.mode === 'lesson' ? 'free' : session.mode,
      });
    },

    setPuzzle(puzzleId) {
      const puzzle = getPuzzleDefinition(puzzleId);
      return commit({
        ...createSessionState({ puzzleId: puzzle.id, size: puzzle.defaultSize }),
        mode: 'free',
      });
    },

    scramble({ moves, timed = false, at = 0 } = {}) {
      return commit(scrambleSession(session, moves, { timed, at }));
    },

    applyMove(move, { at = 0 } = {}) {
      return commit(applySessionMove(session, move, { at }));
    },

    queueAutoSolve() {
      return commit(queueAutoSolve(session));
    },

    stepAutoSolve({ at = 0 } = {}) {
      return commit(stepAutoSolve(session, { at }));
    },

    reset() {
      return commit({
        ...createSessionState({ size: session.size, puzzleId: session.puzzleId }),
        mode: session.mode,
      });
    },
  };
}

function normalizeStoredRecords(records) {
  return records.map((record) => ({
    puzzleId: record.puzzleId ?? 'cube',
    size: record.size ?? 3,
    elapsedMs: record.elapsedMs ?? 0,
    moveCount: record.moveCount ?? 0,
    scramble: Array.isArray(record.scramble) ? [...record.scramble] : [],
    assisted: Boolean(record.assisted),
  }));
}
