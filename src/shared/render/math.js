export function addVectors(...vectors) {
  return vectors.reduce(
    (accumulator, vector) => accumulator.map((value, index) => value + vector[index]),
    [0, 0, 0],
  );
}

export function subtractVectors(left, right) {
  return left.map((value, index) => value - right[index]);
}

export function scaleVector(vector, scalar) {
  return vector.map((value) => value * scalar);
}

export function dotProduct(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

export function crossProduct([ax, ay, az], [bx, by, bz]) {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
}

export function vectorLength(vector) {
  return Math.sqrt(dotProduct(vector, vector));
}

export function normalizeVector(vector) {
  const length = vectorLength(vector);

  if (length === 0) {
    return [0, 0, 0];
  }

  return scaleVector(vector, 1 / length);
}

export function rotateAroundAxisName(vector, axis, angle) {
  const [x, y, z] = vector;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  if (axis === 'x') {
    return [x, y * cos - z * sin, y * sin + z * cos];
  }

  if (axis === 'y') {
    return [x * cos + z * sin, y, -x * sin + z * cos];
  }

  return [x * cos - y * sin, x * sin + y * cos, z];
}

export function axisNameFromVector(vector) {
  const [x, y, z] = vector;
  if (Math.abs(x) > 0.5) {
    return { axis: 'x', sign: Math.sign(x) || 1 };
  }
  if (Math.abs(y) > 0.5) {
    return { axis: 'y', sign: Math.sign(y) || 1 };
  }
  return { axis: 'z', sign: Math.sign(z) || 1 };
}
