# Cube Miniapps Optimization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Rubik miniapps with stronger page architecture, a unified runtime scheduler, improved gesture disambiguation, a state-aware solver path, and a real shared-code build pipeline.

**Architecture:** Shared runtime logic moves into a miniapp page factory so WeChat and Alipay keep only platform-specific wrappers. Solver and gesture layers become more state-aware: the solver can search from cube state before falling back to recorded history, and gesture mapping uses projected sticker axes plus intent locking to reduce false turns under oblique camera angles.

**Tech Stack:** Plain JavaScript ES modules, Node built-in test runner, esbuild for miniapp shared bundling, WeChat mini program native APIs, Alipay mini program native APIs, Canvas 2D.

---

## Chunk 1: Solver and Gesture Accuracy

### Task 1: Add state-aware solve planning

**Files:**
- Modify: `src/shared/core/solver.js`
- Modify: `src/shared/core/session.js`
- Test: `tests/core/solver-state.test.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `node --test tests/core/solver-state.test.js` and verify it fails**
- [ ] **Step 3: Implement state-search solve planning with explicit fallback metadata**
- [ ] **Step 4: Run `node --test tests/core/solver-state.test.js` and verify it passes**

### Task 2: Improve gesture mapping with projected-axis intent locking

**Files:**
- Modify: `src/shared/render/cube-renderer.js`
- Modify: `src/shared/render/gesture-mapper.js`
- Test: `tests/render/gesture-locking.test.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `node --test tests/render/gesture-locking.test.js` and verify it fails**
- [ ] **Step 3: Implement projected-axis basis vectors, confidence thresholds, and locked move intent**
- [ ] **Step 4: Run `node --test tests/render/gesture-locking.test.js` and verify it passes**

## Chunk 2: Shared Page Runtime

### Task 3: Create a shared miniapp page runtime

**Files:**
- Create: `src/shared/adapters/miniapp-page.js`
- Modify: `src/shared/adapters/app-controller.js`
- Test: `tests/adapters/miniapp-page.test.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `node --test tests/adapters/miniapp-page.test.js` and verify it fails**
- [ ] **Step 3: Implement the shared runtime with one scheduler for timer, playback, and animation**
- [ ] **Step 4: Run `node --test tests/adapters/miniapp-page.test.js` and verify it passes**

### Task 4: Replace duplicated WeChat/Alipay page logic with thin wrappers

**Files:**
- Modify: `miniapps/wechat/pages/index/index.js`
- Modify: `miniapps/alipay/pages/index/index.js`

- [ ] **Step 1: Replace large page files with platform wrappers around the shared runtime**
- [ ] **Step 2: Run `node --check miniapps/wechat/pages/index/index.js`**
- [ ] **Step 3: Run `node --check miniapps/alipay/pages/index/index.js`**

## Chunk 3: Build Pipeline and Integration

### Task 5: Replace regex sync with esbuild bundling

**Files:**
- Modify: `package.json`
- Modify: `scripts/sync-miniapp-shared.mjs`
- Test: `tests/integration/build-sync.test.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `node --test tests/integration/build-sync.test.js` and verify it fails**
- [ ] **Step 3: Use esbuild to bundle CommonJS miniapp runtime copies**
- [ ] **Step 4: Run `node --test tests/integration/build-sync.test.js` and verify it passes**

### Task 6: Full regression verification

**Files:**
- Modify: `README.md`
- Modify: `tests/integration/app-flow.test.js`

- [ ] **Step 1: Expand integration coverage for solver metadata and shared runtime**
- [ ] **Step 2: Run `npm run sync:shared`**
- [ ] **Step 3: Run `npm test`**
- [ ] **Step 4: Run `node --check miniapps/wechat/pages/index/index.js`**
- [ ] **Step 5: Run `node --check miniapps/alipay/pages/index/index.js`**
