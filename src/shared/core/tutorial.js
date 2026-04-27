const LESSONS = Object.freeze([
  {
    id: 'cube-basics',
    title: 'Meet the Six Faces',
    summary: 'Learn the up, down, front, back, left, and right faces, plus clockwise, counterclockwise, and double turns.',
    notation: ['U', "U'", 'U2', 'R', 'F'],
    demoMoves: ['R', 'U', "R'"],
    focusFaces: ['F', 'U', 'R'],
  },
  {
    id: 'white-cross',
    title: 'White Cross',
    summary: 'Place the four white edge pieces on the top face and align each side color with its center.',
    notation: ['F', "F'", 'R', "R'"],
    demoMoves: ['F', 'R', 'U', "R'"],
    focusFaces: ['U', 'F'],
  },
  {
    id: 'white-corners',
    title: 'White Corners',
    summary: 'Stage the four white corners below their slots, then insert them into the white layer one by one.',
    notation: ['R', 'U', "R'", "U'"],
    demoMoves: ['R', 'U', "R'", "U'"],
    focusFaces: ['U', 'R', 'F'],
  },
  {
    id: 'middle-layer',
    title: 'Middle Layer',
    summary: 'Place the four middle-layer edges without breaking the solved white face.',
    notation: ['U', 'R', "U'", "R'", "U'", "F'", 'U', 'F'],
    demoMoves: ['U', 'R', "U'", "R'"],
    focusFaces: ['F', 'R', 'U'],
  },
  {
    id: 'yellow-cross',
    title: 'Yellow Cross',
    summary: 'Focus on top-layer orientation first: build the yellow cross, then prepare for final orientation.',
    notation: ['F', 'R', 'U', "R'", "U'", "F'"],
    demoMoves: ['F', 'R', 'U', "R'", "U'", "F'"],
    focusFaces: ['U', 'F', 'R'],
  },
  {
    id: 'yellow-orientation',
    title: 'Yellow Orientation',
    summary: 'Turn all yellow corners upward without requiring them to be in their final positions yet.',
    notation: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
    demoMoves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
    focusFaces: ['U', 'R'],
  },
  {
    id: 'yellow-permutation',
    title: 'Yellow Permutation',
    summary: 'Swap the top-layer corners and edges into place to finish the cube.',
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
