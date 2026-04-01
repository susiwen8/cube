export function getWebTouchPoint(event = {}) {
  const touch =
    (event.changedTouches && event.changedTouches[0]) ||
    (event.touches && event.touches[0]) ||
    event;

  return {
    x: touch.clientX ?? touch.pageX ?? touch.x ?? 0,
    y: touch.clientY ?? touch.pageY ?? touch.y ?? 0,
  };
}
