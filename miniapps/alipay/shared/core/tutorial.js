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
    title: "\u8BA4\u8BC6\u516D\u4E2A\u9762",
    summary: "\u5148\u8BA4\u8BC6\u4E0A\u3001\u4E0B\u3001\u524D\u3001\u540E\u3001\u5DE6\u3001\u53F3\u516D\u4E2A\u9762\uFF0C\u4EE5\u53CA\u987A\u65F6\u9488\u3001\u9006\u65F6\u9488\u548C\u4E24\u6B21\u8F6C\u52A8\u3002",
    notation: ["U", "U'", "U2", "R", "F"],
    demoMoves: ["R", "U", "R'"],
    focusFaces: ["F", "U", "R"]
  },
  {
    id: "white-cross",
    title: "\u767D\u5341\u5B57",
    summary: "\u5148\u628A\u56DB\u4E2A\u767D\u8272\u68F1\u5757\u653E\u5230\u9876\u9762\uFF0C\u5E76\u8BA9\u4FA7\u9762\u989C\u8272\u548C\u4E2D\u5FC3\u5757\u5BF9\u9F50\u3002",
    notation: ["F", "F'", "R", "R'"],
    demoMoves: ["F", "R", "U", "R'"],
    focusFaces: ["U", "F"]
  },
  {
    id: "white-corners",
    title: "\u767D\u89D2\u5F52\u4F4D",
    summary: "\u628A\u56DB\u4E2A\u767D\u8272\u89D2\u5757\u9001\u5230\u5E95\u89D2\uFF0C\u518D\u9010\u4E2A\u63D2\u5165\u767D\u8272\u9876\u5C42\u3002",
    notation: ["R", "U", "R'", "U'"],
    demoMoves: ["R", "U", "R'", "U'"],
    focusFaces: ["U", "R", "F"]
  },
  {
    id: "middle-layer",
    title: "\u4E2D\u5C42\u68F1\u5757",
    summary: "\u5728\u4E0D\u6253\u4E71\u767D\u9762\u524D\u63D0\u4E0B\uFF0C\u628A\u4E2D\u5C42\u7684\u56DB\u4E2A\u68F1\u5757\u9001\u5165\u6B63\u786E\u4F4D\u7F6E\u3002",
    notation: ["U", "R", "U'", "R'", "U'", "F'", "U", "F"],
    demoMoves: ["U", "R", "U'", "R'"],
    focusFaces: ["F", "R", "U"]
  },
  {
    id: "yellow-cross",
    title: "\u9876\u5C42\u5341\u5B57",
    summary: "\u5148\u53EA\u7BA1\u9876\u5C42\u671D\u5411\uFF0C\u628A\u9EC4\u8272\u5341\u5B57\u505A\u51FA\u6765\uFF0C\u518D\u51C6\u5907\u540E\u7EED\u5B9A\u5411\u3002",
    notation: ["F", "R", "U", "R'", "U'", "F'"],
    demoMoves: ["F", "R", "U", "R'", "U'", "F'"],
    focusFaces: ["U", "F", "R"]
  },
  {
    id: "yellow-orientation",
    title: "\u9876\u5C42\u65B9\u5411\u8C03\u6574",
    summary: "\u8BA9\u9EC4\u8272\u89D2\u5757\u5168\u90E8\u671D\u4E0A\uFF0C\u6682\u65F6\u4E0D\u8981\u6C42\u5B83\u4EEC\u5DF2\u7ECF\u7AD9\u5230\u6700\u7EC8\u4F4D\u7F6E\u3002",
    notation: ["R", "U", "R'", "U", "R", "U2", "R'"],
    demoMoves: ["R", "U", "R'", "U", "R", "U2", "R'"],
    focusFaces: ["U", "R"]
  },
  {
    id: "yellow-permutation",
    title: "\u9876\u5C42\u6362\u4F4D",
    summary: "\u6700\u540E\u4EA4\u6362\u9876\u5C42\u89D2\u5757\u548C\u68F1\u5757\u7684\u4F4D\u7F6E\uFF0C\u5B8C\u6210\u6574\u4E2A\u9B54\u65B9\u3002",
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
