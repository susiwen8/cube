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
var tutorial_exports = {};
__export(tutorial_exports, {
  getLessonById: () => getLessonById,
  getTutorialLessons: () => getTutorialLessons
});
module.exports = __toCommonJS(tutorial_exports);
const LESSONS = Object.freeze([
  {
    id: "cube-basics",
    title: "Meet the Six Faces",
    summary: "Learn the up, down, front, back, left, and right faces, plus clockwise, counterclockwise, and double turns.",
    notation: ["U", "U'", "U2", "R", "F"],
    demoMoves: ["R", "U", "R'"],
    focusFaces: ["F", "U", "R"]
  },
  {
    id: "white-cross",
    title: "White Cross",
    summary: "Place the four white edge pieces on the top face and align each side color with its center.",
    notation: ["F", "F'", "R", "R'"],
    demoMoves: ["F", "R", "U", "R'"],
    focusFaces: ["U", "F"]
  },
  {
    id: "white-corners",
    title: "White Corners",
    summary: "Stage the four white corners below their slots, then insert them into the white layer one by one.",
    notation: ["R", "U", "R'", "U'"],
    demoMoves: ["R", "U", "R'", "U'"],
    focusFaces: ["U", "R", "F"]
  },
  {
    id: "middle-layer",
    title: "Middle Layer",
    summary: "Place the four middle-layer edges without breaking the solved white face.",
    notation: ["U", "R", "U'", "R'", "U'", "F'", "U", "F"],
    demoMoves: ["U", "R", "U'", "R'"],
    focusFaces: ["F", "R", "U"]
  },
  {
    id: "yellow-cross",
    title: "Yellow Cross",
    summary: "Focus on top-layer orientation first: build the yellow cross, then prepare for final orientation.",
    notation: ["F", "R", "U", "R'", "U'", "F'"],
    demoMoves: ["F", "R", "U", "R'", "U'", "F'"],
    focusFaces: ["U", "F", "R"]
  },
  {
    id: "yellow-orientation",
    title: "Yellow Orientation",
    summary: "Turn all yellow corners upward without requiring them to be in their final positions yet.",
    notation: ["R", "U", "R'", "U", "R", "U2", "R'"],
    demoMoves: ["R", "U", "R'", "U", "R", "U2", "R'"],
    focusFaces: ["U", "R"]
  },
  {
    id: "yellow-permutation",
    title: "Yellow Permutation",
    summary: "Swap the top-layer corners and edges into place to finish the cube.",
    notation: ["R", "U", "R'", "U'", "R'", "F", "R2", "U'", "R'", "U'", "R", "U", "R'", "F'"],
    demoMoves: ["R", "U", "R'", "U'"],
    focusFaces: ["U", "R", "F"]
  }
]);
function getTutorialLessons() {
  return LESSONS.map((lesson) => ({
    ...lesson,
    notation: [...lesson.notation],
    demoMoves: [...lesson.demoMoves],
    focusFaces: [...lesson.focusFaces]
  }));
}
function getLessonById(id) {
  const lesson = LESSONS.find((entry) => entry.id === id);
  if (!lesson) {
    throw new Error(`Unknown tutorial lesson: ${id}`);
  }
  return {
    ...lesson,
    notation: [...lesson.notation],
    demoMoves: [...lesson.demoMoves],
    focusFaces: [...lesson.focusFaces]
  };
}
