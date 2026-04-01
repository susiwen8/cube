export function createTimerState() {
  return {
    status: 'idle',
    armedAt: null,
    startedAt: null,
    finishedAt: null,
    elapsedMs: 0,
  };
}

export function armTimer(timer, at) {
  return {
    ...timer,
    status: 'pending',
    armedAt: at,
    startedAt: null,
    finishedAt: null,
    elapsedMs: 0,
  };
}

export function startTimer(timer, at) {
  return {
    ...timer,
    status: 'running',
    startedAt: at,
    finishedAt: null,
    elapsedMs: 0,
  };
}

export function stopTimer(timer, at) {
  if (timer.status !== 'running' && timer.status !== 'pending') {
    return timer;
  }

  const startedAt = timer.startedAt ?? at;
  return {
    ...timer,
    status: 'finished',
    startedAt,
    finishedAt: at,
    elapsedMs: at - startedAt,
  };
}

export function getElapsedMs(timer, at = timer.finishedAt ?? timer.startedAt ?? 0) {
  if (timer.status === 'running' && timer.startedAt !== null) {
    return at - timer.startedAt;
  }

  return timer.elapsedMs;
}
