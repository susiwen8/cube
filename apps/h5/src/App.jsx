import React, { useRef } from 'react';

import { CubeCanvas } from './components/CubeCanvas.jsx';
import { BottomPanel } from './components/BottomPanel.jsx';
import { useCubeApp } from './hooks/useCubeApp.js';

export default function App() {
  const wrapRef = useRef(null);
  const surfaceRef = useRef(null);
  const canvasRef = useRef(null);
  const { viewState, actions } = useCubeApp({
    wrapRef,
    surfaceRef,
    canvasRef,
  });
  const stageTitle = viewState.puzzleId === 'cube'
    ? viewState.sizeLabel
    : viewState.puzzleLabel;

  return (
    <div className="app-shell">
      <div className="page-frame">
        <main className="content-shell">
          <section className="stage-card">
            <div className="stage-header">
              <h1 className="hero-title">{stageTitle}</h1>
            </div>
            <CubeCanvas
              wrapRef={wrapRef}
              surfaceRef={surfaceRef}
              canvasRef={canvasRef}
              actions={actions}
            />
            <div className="stage-footer">
              <span>{viewState.statusLabel}</span>
              <span>{viewState.timerLabel}</span>
              <span>步数 {viewState.moveCount}</span>
            </div>
          </section>
          <BottomPanel viewState={viewState} actions={actions} />
        </main>
      </div>
    </div>
  );
}
