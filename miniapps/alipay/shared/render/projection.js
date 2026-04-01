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
var projection_exports = {};
__export(projection_exports, {
  createCamera: () => createCamera,
  projectPoint: () => projectPoint,
  toCameraSpace: () => toCameraSpace
});
module.exports = __toCommonJS(projection_exports);
var import_math = require("./math.js");
function createCamera(options = {}) {
  return {
    width: options.width ?? 320,
    height: options.height ?? 320,
    yaw: options.yaw ?? -0.65,
    pitch: options.pitch ?? -0.45,
    distance: options.distance ?? 8,
    focalLength: options.focalLength ?? 240
  };
}
function toCameraSpace(camera, point) {
  const yawed = (0, import_math.rotateAroundAxisName)(point, "y", -camera.yaw);
  return (0, import_math.rotateAroundAxisName)(yawed, "x", -camera.pitch);
}
function projectPoint(camera, point) {
  const cameraPoint = toCameraSpace(camera, point);
  const depth = Math.max(1e-3, camera.distance - cameraPoint[2]);
  const scale = camera.focalLength / depth;
  return {
    x: camera.width / 2 + cameraPoint[0] * scale,
    y: camera.height / 2 - cameraPoint[1] * scale,
    depth,
    cameraPoint
  };
}
