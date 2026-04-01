# True Puzzle Mechanisms Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current H5-only shape-mod selector with three genuinely different twisty puzzles: Pyraminx, Skewb, and Megaminx.

**Architecture:** Introduce a puzzle-definition layer that separates puzzle identity, sticker geometry, move notation, scramble pools, and solve fallback from the current cube-specific core. Keep the existing H5 shell and runtime loop, but route rendering and session logic through the selected puzzle definition so each mechanism owns its own state, permutations, and visible geometry. Use button-driven move pads for non-cubic puzzles first so we can ship fully playable puzzles without depending on cube-only drag heuristics.

**Tech Stack:** Node.js, shared runtime adapters, custom puzzle geometry/permutation logic, Vite + React H5 UI, node:test.

---

## Chunk 1: Puzzle Definition Foundation

### Task 1: Add a shared puzzle catalog

**Files:**
- Create: `src/shared/puzzles/catalog.js`
- Test: `tests/core/puzzle-catalog.test.js`

- [ ] **Step 1: Write the failing test**

```js
test('puzzle catalog exposes cube, pyraminx, skewb, and megaminx definitions', () => {
  const ids = getPuzzleCatalog().map((entry) => entry.id);
  assert.deepEqual(ids, ['cube', 'pyraminx', 'skewb', 'megaminx']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/core/puzzle-catalog.test.js`
Expected: FAIL because `catalog.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create a catalog that exports labels, supported sizes, default puzzle id, and lightweight metadata for each puzzle.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/core/puzzle-catalog.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/core/puzzle-catalog.test.js src/shared/puzzles/catalog.js
git commit -m "feat: add puzzle catalog"
```

### Task 2: Add a puzzle-aware session model

**Files:**
- Modify: `src/shared/core/session.js`
- Modify: `src/shared/adapters/platform-session.js`
- Test: `tests/core/session-puzzle.test.js`

- [ ] **Step 1: Write the failing test**

```js
test('session state tracks the selected puzzle id and resets with puzzle defaults', () => {
  const session = createSessionState({ puzzleId: 'pyraminx' });
  assert.equal(session.puzzleId, 'pyraminx');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/core/session-puzzle.test.js`
Expected: FAIL because `puzzleId` is not supported.

- [ ] **Step 3: Write minimal implementation**

Store `puzzleId`, route solved-state creation through puzzle definitions, and expose puzzle label in the page view model.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/core/session-puzzle.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/core/session-puzzle.test.js src/shared/core/session.js src/shared/adapters/platform-session.js
git commit -m "feat: track puzzle identity in session state"
```

## Chunk 2: Puzzle Engines

### Task 3: Implement Pyraminx definition

**Files:**
- Create: `src/shared/puzzles/pyraminx.js`
- Create: `tests/core/pyraminx.test.js`

- [ ] **Step 1: Write the failing test**

```js
test('pyraminx move followed by inverse restores solved state', () => {
  const puzzle = getPuzzleDefinition('pyraminx');
  const scrambled = puzzle.applyMove(puzzle.createSolvedState(), 'R');
  const restored = puzzle.applyMove(scrambled, "R'");
  assert.equal(puzzle.isSolved(restored), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/core/pyraminx.test.js`
Expected: FAIL because puzzle definition is missing.

- [ ] **Step 3: Write minimal implementation**

Add sticker metadata, move permutations, scramble pool, and history-fallback solve support for Pyraminx.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/core/pyraminx.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/core/pyraminx.test.js src/shared/puzzles/pyraminx.js
git commit -m "feat: add pyraminx puzzle engine"
```

### Task 4: Implement Skewb definition

**Files:**
- Create: `src/shared/puzzles/skewb.js`
- Create: `tests/core/skewb.test.js`

- [ ] **Step 1: Write the failing test**

```js
test('skewb supports scrambling and inverse restoration', () => {
  const puzzle = getPuzzleDefinition('skewb');
  const state = puzzle.applyMoves(puzzle.createSolvedState(), ['R', 'L']);
  const restored = puzzle.applyMoves(state, ["L'", "R'"]);
  assert.equal(puzzle.isSolved(restored), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/core/skewb.test.js`
Expected: FAIL because puzzle definition is missing.

- [ ] **Step 3: Write minimal implementation**

Add sticker metadata, move permutations, scramble pool, and history-fallback solve support for Skewb.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/core/skewb.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/core/skewb.test.js src/shared/puzzles/skewb.js
git commit -m "feat: add skewb puzzle engine"
```

### Task 5: Implement Megaminx definition

**Files:**
- Create: `src/shared/puzzles/megaminx.js`
- Create: `tests/core/megaminx.test.js`

- [ ] **Step 1: Write the failing test**

```js
test('megaminx supports scrambling and inverse restoration', () => {
  const puzzle = getPuzzleDefinition('megaminx');
  const state = puzzle.applyMoves(puzzle.createSolvedState(), ['R++', 'D--']);
  const restored = puzzle.applyMoves(state, ['D++', 'R--']);
  assert.equal(puzzle.isSolved(restored), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/core/megaminx.test.js`
Expected: FAIL because puzzle definition is missing.

- [ ] **Step 3: Write minimal implementation**

Add sticker metadata, move permutations, scramble pool, and history-fallback solve support for Megaminx.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/core/megaminx.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/core/megaminx.test.js src/shared/puzzles/megaminx.js
git commit -m "feat: add megaminx puzzle engine"
```

## Chunk 3: Runtime and Rendering Integration

### Task 6: Generalize runtime rendering to selected puzzle geometry

**Files:**
- Modify: `src/shared/runtime/app-runtime.js`
- Modify: `src/shared/render/cube-renderer.js`
- Create: `tests/runtime/puzzle-runtime.test.js`

- [ ] **Step 1: Write the failing test**

```js
test('runtime renders the selected puzzle geometry instead of assuming cube stickers', () => {
  const runtime = createAppRuntime(...);
  runtime.handlePuzzleChange('pyraminx');
  timers.tick();
  assert.equal(runtime.getViewState().puzzleId, 'pyraminx');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/runtime/puzzle-runtime.test.js`
Expected: FAIL because runtime is cube-only.

- [ ] **Step 3: Write minimal implementation**

Route scene building, solved-state resets, scramble generation, and auto-solve fallback through the active puzzle definition.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/runtime/puzzle-runtime.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/runtime/puzzle-runtime.test.js src/shared/runtime/app-runtime.js src/shared/render/cube-renderer.js
git commit -m "feat: route runtime through puzzle definitions"
```

### Task 7: Add move-pad input for true puzzle mechanisms

**Files:**
- Modify: `apps/h5/src/components/BottomPanel.jsx`
- Modify: `apps/h5/src/hooks/useCubeApp.js`
- Modify: `apps/h5/src/styles.css`
- Create: `tests/integration/h5-puzzle-controls.test.js`

- [ ] **Step 1: Write the failing test**

```js
test('h5 shows puzzle selection and move-pad controls for non-cube puzzles', () => {
  const panel = fs.readFileSync(...);
  assert.match(panel, /Pyraminx/);
  assert.match(panel, /Skewb/);
  assert.match(panel, /Megaminx/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/integration/h5-puzzle-controls.test.js`
Expected: FAIL because the H5 panel does not expose true puzzle controls.

- [ ] **Step 3: Write minimal implementation**

Replace the current shape-mod block with a puzzle picker and move pad that adapts to the current puzzle’s notation.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/integration/h5-puzzle-controls.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/integration/h5-puzzle-controls.test.js apps/h5/src/components/BottomPanel.jsx apps/h5/src/hooks/useCubeApp.js apps/h5/src/styles.css
git commit -m "feat: add true puzzle controls to h5"
```

## Chunk 4: Clean-up and Verification

### Task 8: Remove temporary 3x3 shape-mod-only code and update regression coverage

**Files:**
- Modify: `src/shared/render/shape-variants.js`
- Modify: `tests/integration/h5-shape-picker.test.js`
- Modify: `tests/render/shape-variants.test.js`
- Modify: any superseded shape-mod-specific files

- [ ] **Step 1: Write the failing cleanup test**

Add assertions that the H5 puzzle picker references true puzzle ids instead of the temporary shape-mod-only labels.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because old shape-mod expectations remain.

- [ ] **Step 3: Write minimal implementation**

Remove obsolete temporary shape-mod entry points or repurpose them into the true puzzle picker plumbing.

- [ ] **Step 4: Run verification**

Run: `npm test`
Expected: PASS

Run: `npm run build --prefix apps/h5`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shared/render/shape-variants.js tests/integration/h5-shape-picker.test.js tests/render/shape-variants.test.js apps/h5
git commit -m "refactor: replace temporary shape mods with true puzzle picker"
```
