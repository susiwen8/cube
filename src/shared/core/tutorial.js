const LESSONS = Object.freeze([
  {
    id: 'cube-basics',
    title: '认识六个面',
    summary: '先认识上、下、前、后、左、右六个面，以及顺时针、逆时针和两次转动。',
    notation: ['U', "U'", 'U2', 'R', 'F'],
    demoMoves: ['R', 'U', "R'"],
    focusFaces: ['F', 'U', 'R'],
  },
  {
    id: 'white-cross',
    title: '白十字',
    summary: '先把四个白色棱块放到顶面，并让侧面颜色和中心块对齐。',
    notation: ['F', "F'", 'R', "R'"],
    demoMoves: ['F', 'R', 'U', "R'"],
    focusFaces: ['U', 'F'],
  },
  {
    id: 'white-corners',
    title: '白角归位',
    summary: '把四个白色角块送到底角，再逐个插入白色顶层。',
    notation: ['R', 'U', "R'", "U'"],
    demoMoves: ['R', 'U', "R'", "U'"],
    focusFaces: ['U', 'R', 'F'],
  },
  {
    id: 'middle-layer',
    title: '中层棱块',
    summary: '在不打乱白面前提下，把中层的四个棱块送入正确位置。',
    notation: ['U', 'R', "U'", "R'", "U'", "F'", 'U', 'F'],
    demoMoves: ['U', 'R', "U'", "R'"],
    focusFaces: ['F', 'R', 'U'],
  },
  {
    id: 'yellow-cross',
    title: '顶层十字',
    summary: '先只管顶层朝向，把黄色十字做出来，再准备后续定向。',
    notation: ['F', 'R', 'U', "R'", "U'", "F'"],
    demoMoves: ['F', 'R', 'U', "R'", "U'", "F'"],
    focusFaces: ['U', 'F', 'R'],
  },
  {
    id: 'yellow-orientation',
    title: '顶层方向调整',
    summary: '让黄色角块全部朝上，暂时不要求它们已经站到最终位置。',
    notation: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
    demoMoves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
    focusFaces: ['U', 'R'],
  },
  {
    id: 'yellow-permutation',
    title: '顶层换位',
    summary: '最后交换顶层角块和棱块的位置，完成整个魔方。',
    notation: ['R', 'U', "R'", "U'", "R'", 'F', 'R2', "U'", "R'", "U'", 'R', 'U', "R'", "F'"],
    demoMoves: ['R', 'U', "R'", "U'"],
    focusFaces: ['U', 'R', 'F'],
  },
]);

export function getTutorialLessons() {
  return LESSONS.map((lesson) => ({
    ...lesson,
    notation: [...lesson.notation],
    demoMoves: [...lesson.demoMoves],
    focusFaces: [...lesson.focusFaces],
  }));
}

export function getLessonById(id) {
  const lesson = LESSONS.find((entry) => entry.id === id);

  if (!lesson) {
    throw new Error(`Unknown tutorial lesson: ${id}`);
  }

  return {
    ...lesson,
    notation: [...lesson.notation],
    demoMoves: [...lesson.demoMoves],
    focusFaces: [...lesson.focusFaces],
  };
}
