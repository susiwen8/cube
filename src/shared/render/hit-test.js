export function hitTestSticker(scene, x, y, options = {}) {
  const hits = scene
    .filter((sticker) => sticker.interactive !== false)
    .filter((sticker) => pointInPolygon({ x, y }, sticker.points))
    .sort(
      (left, right) =>
        (right.hitPriority ?? 0) - (left.hitPriority ?? 0) || left.averageDepth - right.averageDepth,
    );

  if (hits[0]) {
    return hits[0];
  }

  const maxCenterDistance = options.maxCenterDistance ?? 0;
  if (maxCenterDistance <= 0) {
    return null;
  }

  const nearest = scene
    .filter((sticker) => sticker.interactive !== false)
    .map((sticker) => ({
      sticker,
      distance: Math.hypot(sticker.centerPoint.x - x, sticker.centerPoint.y - y),
    }))
    .filter((entry) => entry.distance <= maxCenterDistance)
    .sort(
      (left, right) =>
        (right.sticker.hitPriority ?? 0) - (left.sticker.hitPriority ?? 0) ||
        left.distance - right.distance ||
        left.sticker.averageDepth - right.sticker.averageDepth,
    );

  return nearest[0]?.sticker ?? null;
}

function pointInPolygon(point, polygon) {
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    const intersects =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          (previousPoint.y - currentPoint.y) +
          currentPoint.x;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}
