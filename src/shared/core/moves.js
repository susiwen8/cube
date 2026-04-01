const BASE_MOVES = {
  U: { face: 'U', axis: 'y', side: 1, direction: 1 },
  D: { face: 'D', axis: 'y', side: -1, direction: -1 },
  R: { face: 'R', axis: 'x', side: 1, direction: -1 },
  L: { face: 'L', axis: 'x', side: -1, direction: 1 },
  F: { face: 'F', axis: 'z', side: 1, direction: -1 },
  B: { face: 'B', axis: 'z', side: -1, direction: 1 },
};

const AXIS_BY_FACE = {
  U: 'y',
  D: 'y',
  R: 'x',
  L: 'x',
  F: 'z',
  B: 'z',
};

const MOVE_PATTERN = /^(\d+)?([URFDLB])(2|')?$/;

export const FACE_MOVE_NAMES = Object.freeze(Object.keys(BASE_MOVES));

export function maxMoveDepth(size) {
  return Math.ceil(size / 2);
}

export function getAllMoveNames(size = 3, options = {}) {
  const includeInner = options.includeInner ?? size > 3;
  const maxDepth = includeInner ? maxMoveDepth(size) : 1;
  const names = [];

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const prefix = depth === 1 ? '' : String(depth);
    for (const face of FACE_MOVE_NAMES) {
      names.push(`${prefix}${face}`);
      names.push(`${prefix}${face}'`);
      names.push(`${prefix}${face}2`);
    }
  }

  return names;
}

export function parseMove(move) {
  const notation = String(move ?? '').trim();
  const match = notation.match(MOVE_PATTERN);

  if (!match) {
    throw new Error(`Unsupported move notation: ${move}`);
  }

  const [, depthPrefix, face, suffix = ''] = match;
  const base = BASE_MOVES[face];
  const depth = depthPrefix ? Number(depthPrefix) : 1;
  let amount = 1;

  if (suffix === '\'') {
    amount = -1;
  } else if (suffix === '2') {
    amount = 2;
  }

  return {
    ...base,
    notation,
    suffix,
    depth,
    amount,
    turns: base.direction * amount,
  };
}

export function getLayerCoordinate(size, move) {
  const parsed = typeof move === 'string' ? parseMove(move) : move;
  const maxDepth = maxMoveDepth(size);

  if (parsed.depth > maxDepth) {
    throw new Error(`Move depth ${parsed.depth} exceeds supported depth ${maxDepth} for ${size}x${size}`);
  }

  const magnitude = size - 1 - 2 * (parsed.depth - 1);

  if (magnitude < 0 || (magnitude === 0 && size % 2 === 0)) {
    throw new Error(`Invalid layer depth ${parsed.depth} for ${size}x${size}`);
  }

  return parsed.side * magnitude;
}

export function normalizeQuarterTurns(turns) {
  const normalized = turns % 4;
  if (normalized === 0) {
    return 0;
  }

  if (normalized === 3) {
    return -1;
  }

  if (normalized === -3) {
    return 1;
  }

  return normalized;
}

export function invertMove(move) {
  const parsed = parseMove(move);

  if (parsed.suffix === '2') {
    return toMoveNotation(parsed.face, 2, parsed.depth);
  }

  if (parsed.suffix === '\'') {
    return toMoveNotation(parsed.face, 1, parsed.depth);
  }

  return toMoveNotation(parsed.face, -1, parsed.depth);
}

export function invertMoves(moves) {
  return [...moves].reverse().map(invertMove);
}

export function moveAxis(move) {
  return AXIS_BY_FACE[parseMove(move).face];
}

export function compressMoves(moves) {
  const stack = [];

  for (const move of moves) {
    const parsed = parseMove(move);
    const previous = stack.at(-1);

    if (previous && previous.face === parsed.face && previous.depth === parsed.depth) {
      const combined = normalizeQuarterTurns(previous.amount + parsed.amount);
      stack.pop();

      if (combined !== 0) {
        stack.push({
          face: parsed.face,
          depth: parsed.depth,
          amount: combined,
          notation: toMoveNotation(parsed.face, combined, parsed.depth),
        });
      }
      continue;
    }

    stack.push({
      face: parsed.face,
      depth: parsed.depth,
      amount: parsed.amount,
      notation: parsed.notation,
    });
  }

  return stack.map((entry) => entry.notation);
}

export function normalizeMoveHistory(moves) {
  return compressMoves(moves);
}

export function toMoveNotation(face, turns, depth = 1) {
  const normalized = normalizeQuarterTurns(turns);

  if (normalized === 0) {
    throw new Error(`Cannot serialize zero-turn move for ${face}`);
  }

  const prefix = depth === 1 ? '' : String(depth);

  if (normalized === 2 || normalized === -2) {
    return `${prefix}${face}2`;
  }

  if (normalized === -1) {
    return `${prefix}${face}'`;
  }

  return `${prefix}${face}`;
}

export function formatMoveList(moves) {
  return normalizeMoveHistory(moves).join(' ');
}
