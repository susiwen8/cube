import React from 'react';

function renderTab(tab, activeMode, onChange) {
  return (
    <button
      key={tab.id}
      type="button"
      className={`mode-pill ${activeMode === tab.id ? 'mode-pill-active' : ''}`}
      onClick={() => onChange(tab.id)}
    >
      {tab.label}
    </button>
  );
}

export function TopBar({ viewState, actions }) {
  return (
    <header className="topbar">
      <div className="topbar-row">
        <p className="topbar-title">{viewState.statusLabel}</p>
        <div className="stats-cluster">
          <div className="stat-pill">
            <span className="stat-label">计时</span>
            <strong>{viewState.timerLabel}</strong>
          </div>
          <div className="stat-pill">
            <span className="stat-label">步数</span>
            <strong>{viewState.moveCount}</strong>
          </div>
        </div>
      </div>
      <div className="mode-strip">{viewState.tabs.map((tab) => renderTab(tab, viewState.mode, actions.handleModeChange))}</div>
    </header>
  );
}
