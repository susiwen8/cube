import { projectPoint, toCameraSpace } from './projection.js';

export function projectStickerGeometry(stickers, camera, colors, options = {}) {
  const highlightFaceSet = options.highlightFaces?.length ? new Set(options.highlightFaces) : null;
  const scene = [];

  for (const sticker of stickers) {
    const cameraNormal = toCameraSpace(camera, sticker.normal);

    if (cameraNormal[2] <= 0) {
      continue;
    }

    const points = sticker.corners.map((corner) => projectPoint(camera, corner));
    const centerPoint = projectPoint(camera, sticker.center);

    scene.push({
      face: sticker.face,
      index: sticker.index,
      points,
      centerPoint,
      averageDepth: points.reduce((sum, point) => sum + point.depth, 0) / points.length,
      color: sticker.fillColor ?? colors[sticker.colorIndex] ?? '#20242c',
      highlighted: highlightFaceSet?.has(sticker.face) ?? false,
      size: sticker.size ?? 3,
      row: sticker.row ?? 0,
      col: sticker.col ?? 0,
      cubie: sticker.cubie ?? [0, 0, 0],
      center: [...sticker.center],
      projectedBasis: sticker.projectedBasis ?? null,
      surfaceType: sticker.surfaceType ?? 'sticker',
      interactive: sticker.interactive ?? true,
      hitPriority: sticker.hitPriority ?? (sticker.surfaceType === 'shell' ? 1 : 2),
      strokeColor: sticker.strokeColor ?? null,
      strokeWidth: sticker.strokeWidth ?? null,
    });
  }

  return scene.sort((left, right) => right.averageDepth - left.averageDepth);
}
