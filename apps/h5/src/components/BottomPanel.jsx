import React from 'react';

function renderPuzzleOption(option, viewState, actions) {
  return (
    <button
      key={option.id}
      type="button"
      className={`puzzle-chip ${viewState.puzzleId === option.id ? 'puzzle-chip-active' : ''}`}
      onClick={() => actions.handlePuzzleChange(option.id)}
    >
      {option.label}
    </button>
  );
}

function renderSizeOption(option, viewState, actions) {
  return (
    <button
      key={option.value}
      type="button"
      className={`size-chip ${viewState.cubeSize === option.value ? 'size-chip-active' : ''}`}
      onClick={() => actions.handleSizeChange(option.value)}
    >
      {option.label}
    </button>
  );
}

function renderRecord(record) {
  return (
    <li key={record.label} className="record-row">
      {record.label}
    </li>
  );
}

function renderMovePadRow(row, rowIndex, actions) {
  return (
    <div key={`move-row-${rowIndex}`} className="move-pad-row">
      {row.map((move) => (
        <button
          key={move}
          type="button"
          className="secondary-button move-pad-button"
          onClick={() => actions.handleMovePadMove(move)}
        >
          {move}
        </button>
      ))}
    </div>
  );
}

export function BottomPanel({ viewState, actions }) {
  return (
    <section className="bottom-panel">
      <div className="control-block">
        <div className="section-heading">
          <h2>操作</h2>
        </div>
        <div className="button-grid">
          <button type="button" className="primary-button" onClick={actions.handleShuffle}>打乱</button>
          <button type="button" className="secondary-button" onClick={actions.handleTimedShuffle}>打乱并开始</button>
          <button type="button" className="secondary-button" onClick={actions.handleReset}>复位</button>
          <button type="button" className="primary-button" onClick={actions.handleAutoSolve}>自动求解</button>
          <button type="button" className="secondary-button" onClick={actions.handleStepSolve}>下一步</button>
          <button type="button" className="secondary-button" onClick={actions.handleTogglePlayback}>{viewState.playbackLabel}</button>
        </div>
      </div>

      <div className="control-block">
        <div className="section-heading">
          <h2>谜题</h2>
        </div>
        <div className="puzzle-grid">{viewState.puzzleOptions.map((option) => renderPuzzleOption(option, viewState, actions))}</div>
      </div>

      {viewState.showSizePicker ? (
        <div className="control-block">
          <div className="section-heading">
            <h2>阶数</h2>
          </div>
          <div className="size-grid">{viewState.sizeOptions.map((option) => renderSizeOption(option, viewState, actions))}</div>
        </div>
      ) : null}

      {viewState.movePad.length ? (
        <div className="control-block">
          <div className="section-heading">
            <h2>转动</h2>
          </div>
          <div className="move-pad-grid">{viewState.movePad.map((row, rowIndex) => renderMovePadRow(row, rowIndex, actions))}</div>
        </div>
      ) : null}

      {viewState.showLessons ? (
        <details className="control-block collapsible-block">
          <summary className="collapse-summary">教学</summary>
          <div className="collapse-content">
            <div className="section-heading">
              <h2>{viewState.lessonTitle}</h2>
            </div>
            <p className="lesson-copy">{viewState.lessonSummary}</p>
            <p className="support-line">重点面：{viewState.lessonFocus}</p>
            <p className="support-line">公式：{viewState.lessonNotation}</p>
            <div className="button-grid compact-grid">
              <button type="button" className="secondary-button" onClick={actions.handlePrevLesson}>上一课</button>
              <button type="button" className="secondary-button" onClick={actions.handleNextLesson}>下一课</button>
              <button type="button" className="primary-button button-span" onClick={actions.handleLessonDemo}>演示当前课</button>
            </div>
          </div>
        </details>
      ) : null}

      <details className="control-block collapsible-block">
        <summary className="collapse-summary">{viewState.recordsTitle}</summary>
        <div className="collapse-content">
          {viewState.records.length ? (
            <ul className="record-list">{viewState.records.map(renderRecord)}</ul>
          ) : (
            <p className="empty-records">暂无成绩记录</p>
          )}
        </div>
      </details>
    </section>
  );
}
