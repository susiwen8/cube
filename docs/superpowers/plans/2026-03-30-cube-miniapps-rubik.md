# Cube Miniapps Rubik Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build native WeChat and Alipay miniapps for a 3x3 Rubik's Cube with gesture-based layer turns, camera rotation, auto-solve playback, tutorial mode, and timer mode.

**Architecture:** A shared plain-JavaScript engine under `src/shared` owns cube state, move history, solve playback, tutorial metadata, timer state, projection, hit testing, and gesture mapping. The two miniapp shells under `miniapps/wechat` and `miniapps/alipay` provide canvas setup, touch normalization, storage adapters, and native page configuration.

**Tech Stack:** Plain JavaScript ES modules, Node built-in test runner, WeChat mini program native APIs, Alipay mini program native APIs, Canvas 2D.

---

## Chunk 1: Scaffold and Shared Core

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `README.md`
- Create: `src/shared/core/`
- Create: `src/shared/render/`
- Create: `src/shared/adapters/`
- Create: `tests/`

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';

test('package scripts are documented in README expectations', () => {
  assert.ok(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because scaffold files are missing

- [ ] **Step 3: Write minimal implementation**

Create `package.json`, `README.md`, and empty directories for the shared engine and tests.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for scaffold expectation test

### Task 2: Cube state and move primitives

**Files:**
- Create: `src/shared/core/moves.js`
- Create: `src/shared/core/cube-state.js`
- Test: `tests/core/cube-state.test.js`

- [ ] **Step 1: Write the failing test**

Write tests for:
- solved cube is recognized as solved
- quarter turn mutates state
- applying a move followed by its inverse restores the solved state
- four quarter turns restore the solved state

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/cube-state.test.js`
Expected: FAIL because core modules do not exist

- [ ] **Step 3: Write minimal implementation**

Implement sticker-based cube representation with standard moves `U D L R F B` and their prime/double variants.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/core/cube-state.test.js`
Expected: PASS

### Task 3: Scramble and solve playback history

**Files:**
- Create: `src/shared/core/scramble.js`
- Create: `src/shared/core/solver.js`
- Modify: `src/shared/core/moves.js`
- Test: `tests/core/solver.test.js`

- [ ] **Step 1: Write the failing test**

Write tests for:
- scramble length and adjacency rules
- inverse solution returned by solver restores solved state
- normalized history removes adjacent inverse pairs

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/solver.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Implement scramble generator and history-based solve sequence generator.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/core/solver.test.js`
Expected: PASS

## Chunk 2: Session, Timer, Tutorial, Renderer

### Task 4: Timer, score records, and session state

**Files:**
- Create: `src/shared/core/timer.js`
- Create: `src/shared/core/session.js`
- Test: `tests/core/session.test.js`

- [ ] **Step 1: Write the failing test**

Write tests for:
- pending start -> running transition on first valid move
- solved state stops timer
- assisted solve marks session as assisted

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/session.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Implement a session controller that tracks mode, history, timer, move count, solve playback, and local-record payloads.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/core/session.test.js`
Expected: PASS

### Task 5: Tutorial metadata and lesson flow

**Files:**
- Create: `src/shared/core/tutorial.js`
- Test: `tests/core/tutorial.test.js`

- [ ] **Step 1: Write the failing test**

Write tests for:
- seven lesson stages exist
- each lesson has title, summary, notation, and optional demo moves
- tutorial stage lookup is stable

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/tutorial.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Add beginner lesson definitions and helpers for mode UI consumption.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/core/tutorial.test.js`
Expected: PASS

### Task 6: Projection, hit-testing, and gesture mapping

**Files:**
- Create: `src/shared/render/math.js`
- Create: `src/shared/render/projection.js`
- Create: `src/shared/render/hit-test.js`
- Create: `src/shared/render/gesture-mapper.js`
- Create: `src/shared/render/cube-renderer.js`
- Test: `tests/render/gesture-mapper.test.js`
- Test: `tests/render/projection.test.js`

- [ ] **Step 1: Write the failing test**

Write tests for:
- projected face points are ordered and finite
- hit testing finds front-face stickers for canonical camera angles
- drag vectors map to expected standard moves or camera-rotate intent

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/render`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Implement cube geometry, projection helpers, painter ordering, sticker hit tests, and a gesture intent mapper.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/render`
Expected: PASS

## Chunk 3: Platform Adapters and Native Miniapps

### Task 7: Shared platform adapters

**Files:**
- Create: `src/shared/adapters/storage.js`
- Create: `src/shared/adapters/platform-session.js`
- Test: `tests/adapters/platform-session.test.js`

- [ ] **Step 1: Write the failing test**

Write tests for:
- adapter wraps storage get/set
- adapter normalizes touch records
- adapter converts session state to page-friendly view models

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/adapters/platform-session.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Implement platform-agnostic storage and page-view-model helpers.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/adapters/platform-session.test.js`
Expected: PASS

### Task 8: WeChat miniapp shell

**Files:**
- Create: `miniapps/wechat/app.js`
- Create: `miniapps/wechat/app.json`
- Create: `miniapps/wechat/app.wxss`
- Create: `miniapps/wechat/project.config.json`
- Create: `miniapps/wechat/sitemap.json`
- Create: `miniapps/wechat/pages/index/index.js`
- Create: `miniapps/wechat/pages/index/index.json`
- Create: `miniapps/wechat/pages/index/index.wxml`
- Create: `miniapps/wechat/pages/index/index.wxss`

- [ ] **Step 1: Write the failing test**

Write tests for the shared adapter behavior the WeChat page depends on.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/adapters/platform-session.test.js`
Expected: FAIL until adapter/page contract exists

- [ ] **Step 3: Write minimal implementation**

Build a native WeChat page that mounts the shared session, binds touch events, renders to canvas, and shows mode panels.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for shared tests

### Task 9: Alipay miniapp shell

**Files:**
- Create: `miniapps/alipay/app.js`
- Create: `miniapps/alipay/app.json`
- Create: `miniapps/alipay/app.acss`
- Create: `miniapps/alipay/mini.project.json`
- Create: `miniapps/alipay/pages/index/index.js`
- Create: `miniapps/alipay/pages/index/index.json`
- Create: `miniapps/alipay/pages/index/index.axml`
- Create: `miniapps/alipay/pages/index/index.acss`

- [ ] **Step 1: Write the failing test**

Reuse shared adapter expectations for Alipay touch and storage normalization.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/adapters/platform-session.test.js`
Expected: FAIL until adapter/page contract exists

- [ ] **Step 3: Write minimal implementation**

Build a native Alipay page mirroring the WeChat shell with platform-specific API bindings.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for shared tests

## Chunk 4: Integration and Verification

### Task 10: End-to-end shared integration helpers

**Files:**
- Create: `tests/integration/app-flow.test.js`
- Modify: `src/shared/core/session.js`
- Modify: `src/shared/render/cube-renderer.js`

- [ ] **Step 1: Write the failing test**

Write tests for:
- scramble -> first move starts timer -> auto solve returns to solved state
- tutorial lesson metadata is surfaced in page model
- solve playback marks session as assisted

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/integration/app-flow.test.js`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Wire shared modules together so pages can drive complete flows through one session facade.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/integration/app-flow.test.js`
Expected: PASS

### Task 11: Final verification and polish

**Files:**
- Modify: `README.md`
- Modify: `miniapps/wechat/pages/index/index.wxml`
- Modify: `miniapps/alipay/pages/index/index.axml`

- [ ] **Step 1: Run the full verification suite**

Run: `npm test`
Expected: all shared tests pass

- [ ] **Step 2: Manually verify file structure**

Check:
- both miniapps have native entry files
- shared modules are imported without third-party dependencies
- README documents how to open each miniapp project

- [ ] **Step 3: Polish labels and instructions**

Ensure copy and controls clearly explain gesture behavior, teaching mode, and timer rules.
