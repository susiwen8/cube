import React from 'react';

function getPointerSupport() {
  return typeof window !== 'undefined' && 'PointerEvent' in window;
}

function forwardTouch(handler, options = {}) {
  return (event) => {
    if (options.preventDefault) {
      event.preventDefault();
    }
    handler(event.nativeEvent);
  };
}

function forwardPointer(handler, options = {}) {
  return (event) => {
    if (options.capture) {
      safePointerCapture(event.currentTarget, event.pointerId);
    }
    if (options.release) {
      safeReleasePointerCapture(event.currentTarget, event.pointerId);
    }
    event.preventDefault();
    handler(event.nativeEvent);
  };
}

function safePointerCapture(element, pointerId) {
  try {
    element?.setPointerCapture?.(pointerId);
  } catch {}
}

function safeReleasePointerCapture(element, pointerId) {
  try {
    element?.releasePointerCapture?.(pointerId);
  } catch {}
}

export function CubeCanvas({ wrapRef, surfaceRef, canvasRef, actions }) {
  const supportsPointer = getPointerSupport();
  const pointerHandlers = supportsPointer
    ? {
        onPointerDown: forwardPointer(actions.handleTouchStart, { capture: true }),
        onPointerMove: forwardPointer(actions.handleTouchMove),
        onPointerUp: forwardPointer(actions.handleTouchEnd, { release: true }),
        onPointerCancel: forwardPointer(actions.handleTouchEnd, { release: true }),
      }
    : {};
  const touchHandlers = supportsPointer
    ? {}
    : {
        onTouchStart: forwardTouch(actions.handleTouchStart, { preventDefault: true }),
        onTouchMove: forwardTouch(actions.handleTouchMove, { preventDefault: true }),
        onTouchEnd: forwardTouch(actions.handleTouchEnd, { preventDefault: true }),
        onTouchCancel: forwardTouch(actions.handleTouchEnd, { preventDefault: true }),
      };

  return (
    <div ref={wrapRef} className="stage-wrap">
      <div
        ref={surfaceRef}
        className="touch-surface"
        role="application"
        aria-label="魔方操作区域"
        {...pointerHandlers}
        {...touchHandlers}
      >
        <canvas ref={canvasRef} className="cube-canvas" />
      </div>
    </div>
  );
}
