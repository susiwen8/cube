# Cube Miniapps 4x4-10x10 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the miniapp Rubik project from fixed 3x3 support to configurable 3x3 through 10x10 cubes, including rendering, gestures, scramble, timer flows, and miniapp UI size switching.

**Architecture:** Refactor the shared cube engine to a size-aware sticker model with cached slot metadata per order. Moves become depth-aware so outer and inner layers can be represented with one notation family, while the miniapp runtime exposes size selection and persists size-specific records.

**Tech Stack:** Plain JavaScript ES modules, Node built-in test runner, esbuild, WeChat/Alipay miniapp native APIs, Canvas 2D.

---

## Chunk 1: Generic Cube Core

### Task 1: Make cube state size-aware

**Files:**
- Modify: `src/shared/core/cube-state.js`
- Test: `tests/core/cube-state-orders.test.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `node --test tests/core/cube-state-orders.test.js` and verify it fails**
- [ ] **Step 3: Implement generic slot metadata and state serialization for 3-10 order cubes**
- [ ] **Step 4: Run `node --test tests/core/cube-state-orders.test.js` and verify it passes**

### Task 2: Add depth-aware move notation and scramble generation

**Files:**
- Modify: `src/shared/core/moves.js`
- Modify: `src/shared/core/scramble.js`
- Test: `tests/core/move-depth.test.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `node --test tests/core/move-depth.test.js` and verify it fails**
- [ ] **Step 3: Implement depth-aware move parsing, inversion, compression, and scramble generation**
- [ ] **Step 4: Run `node --test tests/core/move-depth.test.js` and verify it passes**

## Chunk 2: Session, Solver, Renderer, Gestures

### Task 3: Thread cube size through session and controller

**Files:**
- Modify: `src/shared/core/session.js`
- Modify: `src/shared/adapters/app-controller.js`
- Modify: `src/shared/adapters/platform-session.js`
- Test: `tests/core/session-orders.test.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `node --test tests/core/session-orders.test.js` and verify it fails**
- [ ] **Step 3: Implement size selection, size-aware reset/scramble/records, and view model output**
- [ ] **Step 4: Run `node --test tests/core/session-orders.test.js` and verify it passes**

### Task 4: Extend renderer and gestures to generic orders

**Files:**
- Modify: `src/shared/render/cube-renderer.js`
- Modify: `src/shared/render/gesture-mapper.js`
- Test: `tests/render/orders-render.test.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `node --test tests/render/orders-render.test.js` and verify it fails**
- [ ] **Step 3: Implement size-aware scaling, layer selection, and generic gesture-to-depth mapping**
- [ ] **Step 4: Run `node --test tests/render/orders-render.test.js` and verify it passes**

## Chunk 3: Miniapp Runtime and Integration

### Task 5: Add size switching to the shared miniapp runtime

**Files:**
- Modify: `src/shared/adapters/miniapp-page.js`
- Modify: `miniapps/wechat/pages/index/index.wxml`
- Modify: `miniapps/alipay/pages/index/index.axml`
- Test: `tests/adapters/miniapp-orders.test.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `node --test tests/adapters/miniapp-orders.test.js` and verify it fails**
- [ ] **Step 3: Add order selector UI, runtime handlers, and size-aware status/records**
- [ ] **Step 4: Run `node --test tests/adapters/miniapp-orders.test.js` and verify it passes**

### Task 6: Full regression

**Files:**
- Modify: `README.md`
- Modify: `tests/integration/app-flow.test.js`

- [ ] **Step 1: Update integration coverage for 4x4-10x10 flows**
- [ ] **Step 2: Run `npm run sync:shared`**
- [ ] **Step 3: Run `npm test`**
- [ ] **Step 4: Run `node --check miniapps/wechat/pages/index/index.js`**
- [ ] **Step 5: Run `node --check miniapps/alipay/pages/index/index.js`**
