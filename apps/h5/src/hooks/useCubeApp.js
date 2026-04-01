import { startTransition, useEffect, useRef, useState } from 'react';

import { createWebPlatform } from '../../../../src/shared/adapters/web-runtime.js';
import { createAppRuntime, createInitialViewData } from '../../../../src/shared/runtime/app-runtime.js';

export function useCubeApp({ wrapRef, surfaceRef, canvasRef }) {
  const runtimeRef = useRef(null);
  const [viewState, setViewState] = useState(() => createInitialViewData());

  useEffect(() => {
    const host = getHostRefs(wrapRef, surfaceRef, canvasRef);
    if (!host.wrap || !host.touchSurface || !host.canvas) {
      return undefined;
    }

    const runtime = createAppRuntime(
      createWebPlatform({
        storage: typeof window !== 'undefined' ? window.localStorage : null,
        updateView(_patch, nextViewState) {
          startTransition(() => {
            setViewState(nextViewState);
          });
        },
      }),
    );

    runtimeRef.current = runtime;
    setViewState(runtime.getViewState());
    runtime.load(host);
    runtime.ready(host);

    const handleResize = () => {
      runtime.ready(getHostRefs(wrapRef, surfaceRef, canvasRef));
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        runtime.ready(getHostRefs(wrapRef, surfaceRef, canvasRef));
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      runtime.unload();
      runtimeRef.current = null;
    };
  }, [wrapRef, surfaceRef, canvasRef]);

  const actions = {
    handleModeChange(mode) {
      runtimeRef.current?.handleModeChange(mode);
    },
    handleSizeChange(size) {
      runtimeRef.current?.handleSizeChange(size);
    },
    handlePuzzleChange(puzzleId) {
      runtimeRef.current?.handlePuzzleChange(puzzleId);
    },
    handleMovePadMove(move) {
      runtimeRef.current?.handleMovePadMove(move);
    },
    handleShuffle() {
      runtimeRef.current?.handleShuffle();
    },
    handleTimedShuffle() {
      runtimeRef.current?.handleTimedShuffle();
    },
    handleReset() {
      runtimeRef.current?.handleReset();
    },
    handleAutoSolve() {
      runtimeRef.current?.handleAutoSolve();
    },
    handleStepSolve() {
      runtimeRef.current?.handleStepSolve();
    },
    handleTogglePlayback() {
      runtimeRef.current?.handleTogglePlayback();
    },
    handlePrevLesson() {
      runtimeRef.current?.handlePrevLesson();
    },
    handleNextLesson() {
      runtimeRef.current?.handleNextLesson();
    },
    handleLessonDemo() {
      runtimeRef.current?.handleLessonDemo();
    },
    handleTouchStart(event) {
      runtimeRef.current?.handleTouchStart(event);
    },
    handleTouchMove(event) {
      runtimeRef.current?.handleTouchMove(event);
    },
    handleTouchEnd(event) {
      runtimeRef.current?.handleTouchEnd(event);
    },
  };

  return { viewState, actions };
}

function getHostRefs(wrapRef, surfaceRef, canvasRef) {
  return {
    wrap: wrapRef.current,
    surface: surfaceRef.current,
    touchSurface: surfaceRef.current,
    canvas: canvasRef.current,
  };
}
