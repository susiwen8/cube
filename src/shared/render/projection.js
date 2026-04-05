import { rotateAroundAxisName } from './math.js';

export function createCamera(options = {}) {
  return {
    width: options.width ?? 320,
    height: options.height ?? 320,
    yaw: options.yaw ?? -0.65,
    pitch: options.pitch ?? -0.45,
    distance: options.distance ?? 8,
    focalLength: options.focalLength ?? 240,
    offsetX: options.offsetX ?? 0,
    offsetY: options.offsetY ?? 0,
  };
}

export function toCameraSpace(camera, point) {
  const yawed = rotateAroundAxisName(point, 'y', -camera.yaw);
  return rotateAroundAxisName(yawed, 'x', -camera.pitch);
}

export function projectPoint(camera, point) {
  const cameraPoint = toCameraSpace(camera, point);
  const depth = Math.max(0.001, camera.distance - cameraPoint[2]);
  const scale = camera.focalLength / depth;

  return {
    x: camera.width / 2 + camera.offsetX + cameraPoint[0] * scale,
    y: camera.height / 2 + camera.offsetY - cameraPoint[1] * scale,
    depth,
    cameraPoint,
  };
}
