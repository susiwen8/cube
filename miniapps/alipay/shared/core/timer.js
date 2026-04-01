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
var timer_exports = {};
__export(timer_exports, {
  armTimer: () => armTimer,
  createTimerState: () => createTimerState,
  getElapsedMs: () => getElapsedMs,
  startTimer: () => startTimer,
  stopTimer: () => stopTimer
});
module.exports = __toCommonJS(timer_exports);
function createTimerState() {
  return {
    status: "idle",
    armedAt: null,
    startedAt: null,
    finishedAt: null,
    elapsedMs: 0
  };
}
function armTimer(timer, at) {
  return {
    ...timer,
    status: "pending",
    armedAt: at,
    startedAt: null,
    finishedAt: null,
    elapsedMs: 0
  };
}
function startTimer(timer, at) {
  return {
    ...timer,
    status: "running",
    startedAt: at,
    finishedAt: null,
    elapsedMs: 0
  };
}
function stopTimer(timer, at) {
  if (timer.status !== "running" && timer.status !== "pending") {
    return timer;
  }
  const startedAt = timer.startedAt ?? at;
  return {
    ...timer,
    status: "finished",
    startedAt,
    finishedAt: at,
    elapsedMs: at - startedAt
  };
}
function getElapsedMs(timer, at = timer.finishedAt ?? timer.startedAt ?? 0) {
  if (timer.status === "running" && timer.startedAt !== null) {
    return at - timer.startedAt;
  }
  return timer.elapsedMs;
}
