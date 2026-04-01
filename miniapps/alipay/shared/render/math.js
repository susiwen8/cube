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
var math_exports = {};
__export(math_exports, {
  addVectors: () => addVectors,
  axisNameFromVector: () => axisNameFromVector,
  crossProduct: () => crossProduct,
  dotProduct: () => dotProduct,
  normalizeVector: () => normalizeVector,
  rotateAroundAxisName: () => rotateAroundAxisName,
  scaleVector: () => scaleVector,
  subtractVectors: () => subtractVectors,
  vectorLength: () => vectorLength
});
module.exports = __toCommonJS(math_exports);
function addVectors(...vectors) {
  return vectors.reduce(
    (accumulator, vector) => accumulator.map((value, index) => value + vector[index]),
    [0, 0, 0]
  );
}
function subtractVectors(left, right) {
  return left.map((value, index) => value - right[index]);
}
function scaleVector(vector, scalar) {
  return vector.map((value) => value * scalar);
}
function dotProduct(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}
function crossProduct([ax, ay, az], [bx, by, bz]) {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
}
function vectorLength(vector) {
  return Math.sqrt(dotProduct(vector, vector));
}
function normalizeVector(vector) {
  const length = vectorLength(vector);
  if (length === 0) {
    return [0, 0, 0];
  }
  return scaleVector(vector, 1 / length);
}
function rotateAroundAxisName(vector, axis, angle) {
  const [x, y, z] = vector;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  if (axis === "x") {
    return [x, y * cos - z * sin, y * sin + z * cos];
  }
  if (axis === "y") {
    return [x * cos + z * sin, y, -x * sin + z * cos];
  }
  return [x * cos - y * sin, x * sin + y * cos, z];
}
function axisNameFromVector(vector) {
  const [x, y, z] = vector;
  if (Math.abs(x) > 0.5) {
    return { axis: "x", sign: Math.sign(x) || 1 };
  }
  if (Math.abs(y) > 0.5) {
    return { axis: "y", sign: Math.sign(y) || 1 };
  }
  return { axis: "z", sign: Math.sign(z) || 1 };
}
