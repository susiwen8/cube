import { getAllMoveNames, moveAxis } from './moves.js';

export function generateScramble(config = 20, randomFallback = Math.random) {
  if (typeof config === 'number') {
    return generateScramble({
      size: 3,
      length: config,
      random: randomFallback,
    });
  }

  const size = config.size ?? 3;
  const length = config.length ?? defaultScrambleLength(size);
  const random = config.random ?? Math.random;
  const movePool = getAllMoveNames(size, { includeInner: size > 3 });
  const scramble = [];

  while (scramble.length < length) {
    const previousMove = scramble.at(-1);
    const previousAxis = previousMove ? moveAxis(previousMove) : null;
    const availableMoves = movePool.filter((move) => moveAxis(move) !== previousAxis);
    const nextMove = availableMoves[Math.floor(random() * availableMoves.length)];
    scramble.push(nextMove);
  }

  return scramble;
}

function defaultScrambleLength(size) {
  if (size === 3) {
    return 20;
  }

  return size * 12;
}
