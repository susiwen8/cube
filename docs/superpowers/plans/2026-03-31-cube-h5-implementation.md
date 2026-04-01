# Cube H5 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-first H5 version of Cube as an independently deployable site while preserving the existing miniapp behavior.

**Architecture:** Extract a shared runtime from the existing miniapp page adapter, keep `src/shared/core` and `src/shared/render` as the single source of gameplay logic, then build a React + Vite web shell in `apps/h5` that connects browser input, Canvas rendering, storage, and responsive mobile UI to the shared runtime.

**Tech Stack:** JavaScript ES modules, React, Vite, HTML5 Canvas 2D, Node test runner

---

## Chunk 1: Shared Runtime Extraction

### Task 1: Create a shared runtime module that owns scene, playback, animation, viewport, and gesture state

**Files:**
- Create: `src/shared/runtime/app-runtime.js`
- Modify: `src/shared/adapters/miniapp-page.js`
- Test: `tests/runtime/app-runtime.test.js`

- [ ] **Step 1: Write the failing runtime test**

```js
test('runtime advances timer, solve playback, and scene rendering through one scheduler', () => {
  const runtime = createAppRuntime(/* fake platform */);
  runtime.load();
  runtime.ready();
  runtime.controller.scramble({ moves: ['R', 'U', 'F'], timed: true, at: 0 });
  runtime.controller.applyMove('L', { at: 120 });
  runtime.queueAutoSolve();
  runtime.tick(240);
  assert.equal(runtime.getSession().solveQueue.length < 4, true);
});
```

- [ ] **Step 2: Run the runtime test to verify it fails**

Run: `node --test tests/runtime/app-runtime.test.js`
Expected: FAIL because `createAppRuntime` does not exist yet.

- [ ] **Step 3: Implement the shared runtime with minimal browser/miniapp-agnostic APIs**

Key responsibilities:
- initialize controller, viewport, timers, and lesson state
- process touch/drag lifecycle
- manage playback and animation progress
- expose `refreshView`, `renderScene`, `tick`, and lifecycle hooks

- [ ] **Step 4: Refactor `miniapp-page` to delegate to the shared runtime**

Keep miniapp-specific behavior limited to:
- `setData`
- element measurement
- canvas context creation
- storage backend
- platform touch extraction

- [ ] **Step 5: Re-run the new runtime test**

Run: `node --test tests/runtime/app-runtime.test.js`
Expected: PASS

- [ ] **Step 6: Re-run the existing miniapp adapter tests**

Run: `node --test tests/adapters/miniapp-page.test.js tests/integration/app-flow.test.js`
Expected: PASS

- [ ] **Step 7: Commit the runtime extraction**

```bash
git add src/shared/runtime/app-runtime.js src/shared/adapters/miniapp-page.js tests/runtime/app-runtime.test.js tests/adapters/miniapp-page.test.js tests/integration/app-flow.test.js
git commit -m "refactor: extract shared cube app runtime"
```

## Chunk 2: H5 Runtime Bridge and Browser Adapters

### Task 2: Add browser-specific adapters for storage, canvas sizing, and pointer/touch normalization

**Files:**
- Create: `src/shared/adapters/web-storage.js`
- Create: `src/shared/adapters/web-events.js`
- Create: `src/shared/adapters/web-runtime.js`
- Test: `tests/adapters/web-storage.test.js`
- Test: `tests/adapters/web-events.test.js`

- [ ] **Step 1: Write the failing browser adapter tests**

```js
test('web storage falls back to memory when localStorage is unavailable', () => {
  const storage = createWebStorageAdapter(/* unavailable localStorage */);
  storage.setItem('key', 'value');
  assert.equal(storage.getItem('key'), 'value');
});

test('web events normalize pointer and touch input into shared coordinates', () => {
  const point = getWebTouchPoint(/* fake event */);
  assert.deepEqual(point, { x: 12, y: 24 });
});
```

- [ ] **Step 2: Run the adapter tests to verify they fail**

Run: `node --test tests/adapters/web-storage.test.js tests/adapters/web-events.test.js`
Expected: FAIL because the new browser adapters do not exist yet.

- [ ] **Step 3: Implement localStorage-backed storage with in-memory fallback**

Requirements:
- survive `localStorage` read/write exceptions
- store the same JSON payload format as existing adapters

- [ ] **Step 4: Implement browser event normalization and runtime wiring**

Requirements:
- support Pointer Events first
- fall back to Touch Events
- expose canvas measurement and touch-point extraction compatible with shared runtime

- [ ] **Step 5: Re-run the adapter tests**

Run: `node --test tests/adapters/web-storage.test.js tests/adapters/web-events.test.js`
Expected: PASS

- [ ] **Step 6: Commit the browser adapters**

```bash
git add src/shared/adapters/web-storage.js src/shared/adapters/web-events.js src/shared/adapters/web-runtime.js tests/adapters/web-storage.test.js tests/adapters/web-events.test.js
git commit -m "feat: add browser adapters for cube runtime"
```

## Chunk 3: H5 App Shell

### Task 3: Scaffold the H5 app and render the cube scene in a mobile-first React UI

**Files:**
- Create: `apps/h5/package.json`
- Create: `apps/h5/index.html`
- Create: `apps/h5/src/main.jsx`
- Create: `apps/h5/src/App.jsx`
- Create: `apps/h5/src/components/CubeCanvas.jsx`
- Create: `apps/h5/src/components/BottomPanel.jsx`
- Create: `apps/h5/src/components/TopBar.jsx`
- Create: `apps/h5/src/hooks/useCubeApp.js`
- Create: `apps/h5/src/styles.css`
- Create: `apps/h5/vite.config.js`
- Test: `tests/integration/h5-app.test.js`

- [ ] **Step 1: Write the failing H5 integration test**

```js
test('h5 app renders cube controls and can drive a scramble-to-solve flow', async () => {
  // render app, trigger shuffle, then auto solve
  assert.match(screen.getByText('自动求解').textContent, /自动求解/);
});
```

- [ ] **Step 2: Run the H5 integration test to verify it fails**

Run: `node --test tests/integration/h5-app.test.js`
Expected: FAIL because the H5 app files do not exist yet.

- [ ] **Step 3: Scaffold the Vite + React app**

Requirements:
- standalone app under `apps/h5`
- imports shared runtime through relative paths
- includes `npm run dev` and `npm run build`

- [ ] **Step 4: Implement a React hook that binds browser runtime updates to component state**

Requirements:
- subscribe to shared runtime snapshots
- expose view model, records, lesson state, and action handlers
- trigger Canvas redraw through refs rather than React re-render loops

- [ ] **Step 5: Implement the mobile-first UI**

Requirements:
- top status bar
- centered cube stage
- bottom sheet / stacked control panel
- large touch-friendly action buttons
- lesson and records sections

- [ ] **Step 6: Re-run the H5 integration test**

Run: `node --test tests/integration/h5-app.test.js`
Expected: PASS or fail only on missing DOM-specific infrastructure that must then be addressed explicitly.

- [ ] **Step 7: Build the H5 app**

Run: `npm run build --prefix apps/h5`
Expected: PASS and emit a production bundle.

- [ ] **Step 8: Commit the H5 app scaffold**

```bash
git add apps/h5 tests/integration/h5-app.test.js
git commit -m "feat: add cube h5 app shell"
```

## Chunk 4: H5 Polishing and Regression Coverage

### Task 4: Add responsive layout, compatibility handling, and regression tests

**Files:**
- Modify: `apps/h5/src/App.jsx`
- Modify: `apps/h5/src/components/CubeCanvas.jsx`
- Modify: `apps/h5/src/styles.css`
- Modify: `package.json`
- Test: `tests/integration/h5-runtime-flow.test.js`
- Test: `tests/render/performance-render.test.js`

- [ ] **Step 1: Write the failing regression tests**

```js
test('high-order h5 sessions preserve history fallback solve strategy', () => {
  const runtime = createWebRuntime(/* size 6 */);
  runtime.scramble({ moves: ['R', '2U', "2L'"] });
  runtime.queueAutoSolve();
  assert.equal(runtime.getViewModel().solveStrategyLabel, '历史回退');
});
```

- [ ] **Step 2: Run the regression tests to verify they fail**

Run: `node --test tests/integration/h5-runtime-flow.test.js`
Expected: FAIL until the H5 runtime flow is wired.

- [ ] **Step 3: Add layout and compatibility polish**

Requirements:
- responsive square stage sizing
- DPR-aware canvas scaling
- page visibility handling for playback
- graceful fallback messaging for storage/canvas issues

- [ ] **Step 4: Re-run the new regression tests**

Run: `node --test tests/integration/h5-runtime-flow.test.js`
Expected: PASS

- [ ] **Step 5: Run the full project test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Build the H5 app again**

Run: `npm run build --prefix apps/h5`
Expected: PASS

- [ ] **Step 7: Commit the final H5 compatibility work**

```bash
git add package.json apps/h5 src/shared tests
git commit -m "feat: finish cube h5 runtime and mobile ui"
```
