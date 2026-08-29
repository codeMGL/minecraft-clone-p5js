# 🐛 Bugs, Errors & Code Quality Audit (BUGS.md)

This document contains a comprehensive audit of all identified bugs, runtime errors, edge-case vulnerabilities, physics/math flaws, and unclean code across the **My Craft** (`minecraft-clone-p5js`) codebase.

---

## 📑 Summary of Findings

| Category | Critical / High | Medium | Low / Unclean | Total |
| :--- | :---: | :---: | :---: | :---: |
| 💥 **Runtime Exceptions & Crashes** | 4 | 0 | 0 | **4** |
| 🕹️ **Physics, Movement & Gameplay Flaws** | 3 | 2 | 0 | **5** |
| 🎨 **Rendering, UI & Animation Issues** | 1 | 3 | 2 | **6** |
| 🧹 **Code Smells, Scoping & Dead Code** | 0 | 2 | 5 | **7** |
| **Total** | **8** | **7** | **7** | **22** |

---

## 🔴 1. Critical & High-Severity Bugs

### 1.1 Out-of-Bounds Crash on Grid Access in `Hand.actions()`
- **File**: [`src/Hand.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Hand.js#L60-L80) (Lines 60–64)
- **Bug**:
  ```javascript
  actions() {
    var block = blocks[this.i][this.j]; // <-- Line 61: Accesses 2D array BEFORE validation!

    if (isValidGridPos(this.i, this.j)) { // <-- Line 64: Boundary check is too late
      if (mouseButton == LEFT && !block.isEmpty) { ... }
    }
  }
  ```
- **Impact**: If the player moves the cursor or hand outside the world boundaries (e.g. `this.i < 0` or `this.i >= WORLD_W`), `blocks[this.i]` is `undefined`. Reading `blocks[this.i][this.j]` throws an uncaught `TypeError: Cannot read properties of undefined`, immediately freezing the game loop.
- **Fix**: Move `var block = blocks[this.i][this.j];` inside the `if (isValidGridPos(this.i, this.j))` guard.

---

### 1.2 Undefined Variable Crash in `Item.show()`
- **File**: [`src/Item.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Item.js#L8-L10) (Line 9)
- **Bug**:
  ```javascript
  show() {
    image(this.type, this.x + blockW * 0.25, this.y + blockW * 0.25, blockW * 0.5, blockW * 0.5);
  }
  ```
- **Impact**: `blockW` is used instead of the globally defined constant `BLOCK_W`. Any invocation of `Item.show()` throws `ReferenceError: blockW is not defined`. Furthermore, `this.type` is passed directly to `image()`, but block types across the codebase are stored as string identifiers (e.g. `"dirt"`, `"stone"`) rather than `p5.Image` references (`blockImages[this.type]`).
- **Fix**: Replace `blockW` with `BLOCK_W` and resolve texture lookup via `blockImages[this.type]`.

---

### 1.3 Out-of-Bounds `undefined.isEmpty` in `Block.draw()`
- **File**: [`src/Block.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Block.js#L22-L28) (Line 25)
- **Bug**:
  ```javascript
  if (this.type == "dirt") {
    const { i, j } = worldToGrid(this.x, this.y);
    if (blocks[i][j - 1].isEmpty) { // <-- If j == 0 (top row), j - 1 is -1
      img = blockImages["grass"];
    }
  }
  ```
- **Impact**: If a dirt block exists at the very top of the world grid (`j = 0`), `blocks[i][-1]` returns `undefined`. Accessing `.isEmpty` throws `TypeError: Cannot read properties of undefined (reading 'isEmpty')`.
- **Fix**: Ensure `j > 0` before checking `blocks[i][j - 1]`.

---

### 1.4 Crack Texture Array Index Out-of-Bounds
- **File**: [`src/Block.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Block.js#L32-L35) (Lines 33–34)
- **Bug**:
  ```javascript
  if (this.life < 1) {
    var crackLevel = floor((1 - this.life) * 10);
    image(crackImages[crackLevel], this.x, this.y, BLOCK_W, BLOCK_W);
  }
  ```
- **Impact**: When `this.life == 0` (e.g. upon fatal damage before removal), `(1 - 0) * 10 = 10`. `crackImages` only contains 10 textures (indices `0` to `9`). `crackImages[10]` is `undefined`, causing p5.js to log render warnings or fail drawing.
- **Fix**: Clamp `crackLevel` using `min(floor((1 - this.life) * 10), 9)`.

---

### 1.5 Broken Stepping / Sweeping Collision Loops in Player Physics
- **File**: [`src/Player.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Player.js#L153-L222) (Lines 154–186 and 189–222)
- **Bug**:
  ```javascript
  // Horizontal check:
  for (var vel = min(this.vel.x, BLOCK_W); vel <= this.vel.x; vel += BLOCK_W) {
    ...
    this.pos.x += this.vel.x; // <-- Inside loop!
  }
  ```
- **Impact**:
  1. **Negative Velocity Failure**: When moving left (`vel.x < 0`, e.g. `-5`), `min(-5, 40)` returns `-5`. `vel <= -5` evaluates to `-5 <= -5` (true). The next step does `vel += 40` (`35 <= -5` = false). The loop only executes once with the full velocity, skipping intermediate sweep steps.
  2. **Multiple Position Additions**: If `vel.x > BLOCK_W` (e.g. when sprinting or during high velocity), `this.pos.x += this.vel.x` is placed **inside** the loop body instead of adding incremental steps, adding the full velocity multiple times in a single frame.
  3. The exact same flaw exists in `checkVerticalCollisions()` (lines 189–222).
- **Fix**: Rework collision sweeping with a proper sign-aware delta step loop (or Raycast/AABB sweep).

---

### 1.6 Cloud Texture Recycling Property Typo
- **File**: [`src/Cloud.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Cloud.js#L24-L32) (Line 26)
- **Bug**:
  ```javascript
  restart() {
    if (this.x <= -this.w - random(20, 70)) {
      this.image = this.getImage(); // <-- Sets 'this.image' instead of 'this.img'
      ...
    }
  }
  ```
- **Impact**: `Cloud.show()` renders `this.img` (`image(this.img, ...)`). In `restart()`, assigning `this.image` creates a dead property, so recycled clouds never update their visual texture.
- **Fix**: Change `this.image` to `this.img`.

---

### 1.7 Broken Inventory Item Stacking Priority
- **File**: [`src/Inventory.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Inventory.js#L88-L100) (Lines 88–100)
- **Bug**:
  ```javascript
  for (const item of this.items) {
    if (item.type == null) {
      item.type = blockType;
      item.count++;
      break;
    } else {
      if (item.type == blockType && item.count < 9) {
        item.type = blockType;
        item.count++;
        break;
      }
    }
  }
  ```
- **Impact**: In each slot check, `item.type == null` is evaluated first. If an empty slot precedes an existing matching stack of the same block type, the game creates a new stack in the empty slot rather than stacking onto the existing stack.
- **Fix**: Check for existing non-full matching slots (`item.type === blockType && item.count < 9`) in a first pass, and only fallback to the first empty slot if no matching stack exists.

---

### 1.8 Unbounded Grid Array Indexing in `canJump()` & `checkOverlap()`
- **File**: [`src/Player.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Player.js#L141-L149) (Lines 141–149 & 273–280)
- **Bug**:
  `getBoxRange()` performs raw `worldToGrid()` calculations without clamping to `[0, WORLD_W - 1]` and `[0, WORLD_H - 1]`.
- **Impact**: If a player falls near the bottom of the world or touches edges, `range.bottom >= WORLD_H` or `range.left < 0`. `blocks[i][range.bottom]` is `undefined`, causing `this.colliding(box, blocks[i][...])` to fail with `Cannot read properties of undefined (reading 'isEmpty')`.
- **Fix**: Clamp `range.left`, `range.right`, `range.top`, and `range.bottom` within valid grid bounds, or add safe boundary guards.

---

## 🟡 2. Medium-Severity Bugs & Logic Issues

### 2.1 Double Action Invocation on Mouse Click
- **Files**: [`sketch.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/sketch.js#L207-L210) (Lines 207–210) & [`sketch.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/sketch.js#L318-L321) (Lines 318–321)
- **Bug**: `hand.actions()` is invoked in `mousePressed()` and is also invoked inside `drawGame()` when `mouseIsPressed` is true.
- **Impact**: Single clicking immediately runs `actions()` twice in rapid succession (once in the event callback and once in the frame draw loop), causing doubled block damage or unintended immediate re-actions.
- **Fix**: Centralize block interaction handling into a single controlled input flow.

---

### 2.2 Duplicate Rendering & Accelerated Regeneration on World Edges
- **File**: [`sketch.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/sketch.js#L302-L308) (Lines 302–308)
- **Bug**:
  ```javascript
  for (var i = -halfW; i < halfW; i++) {
    for (var j = -halfH; j < halfH; j++) {
      var blockI = max(0, min(playerI + i, WORLD_W - 1));
      var blockJ = max(0, min(playerJ + j, WORLD_H - 1));
      blocks[blockI][blockJ].draw();
    }
  }
  ```
- **Impact**: When near the world edges, out-of-bounds indices are clamped to `0` or `WORLD_W - 1`. The edge blocks are drawn dozens of times per frame, and `regenerateLife()` is executed dozens of times per frame for those edge blocks, causing rapid unnatural healing and wasted draw calls.
- **Fix**: Only call `blocks[playerI + i][playerJ + j].draw()` if the coordinates satisfy `isValidGridPos(playerI + i, playerJ + j)`.

---

### 2.3 `canPlace` Returns `true` for Empty Hands / Out-of-Bounds Coordinates
- **File**: [`src/Hand.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Hand.js#L10-L21) (Lines 10–21)
- **Bug**:
  ```javascript
  get canPlace() {
    if (inventory.current.type == null) return true; // <-- Returns true when holding nothing!
    if (isValidGridPos(this.i, this.j)) {
      return !player.checkOverlap(blocks[this.i][this.j], false);
    }
    return false;
  }
  ```
- **Impact**: When the player has nothing in the active inventory slot, `canPlace` evaluates to `true`, causing `Hand.show()` to render a white selector outline rather than showing placement is impossible. Furthermore, it bypasses the `isValidGridPos` check if `inventory.current.type == null`.
- **Fix**: Return `false` when no item is selected or when pointing outside the grid.

---

### 2.4 Button Position Reset & Layout Thrashing in `drawSettings()`
- **File**: [`sketch.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/sketch.js#L270-L280) (Lines 270–280)
- **Bug**:
  ```javascript
  function drawSettings() {
    ...
    seedInp.position(width / 2 + 10, 235);
    saveGameBtn.position(width / 2 - 75, 280);
    loadGameBtn.position(width / 2 - 75, 325);
    backButton.setPosition(width / 2, 400); // <-- Resets button position every frame!
    backButton.update();
  }
  ```
- **Impact**:
  1. `backButton.setPosition()` resets `drawingPos` on every frame (60 FPS), interfering with hover expansion animations.
  2. Mutating DOM `.position()` on every frame induces unnecessary browser layout reflows.
  3. `backButton` Y-coordinate is inconsistent: instantiated at `Y = 380` in `setup()`, but reset to `Y = 400` in `drawSettings()` and `windowResized()`.
- **Fix**: Position DOM elements and buttons only on initialization and inside `windowResized()`.

---

### 2.5 Redundant Tree Trunk Assignments in World Generation
- **File**: [`sketch.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/sketch.js#L358-L374) (Lines 358–360)
- **Bug**:
  ```javascript
  for (var tree = round(random(3, 8)); tree >= 2; tree--) {
    blocks[i][start - 1].type = "trunk"; // <-- Re-assigned on every iteration of tree loop
    blocks[i][start - tree].type = "trunk";
    ...
  }
  ```
- **Impact**: Setting `blocks[i][start - 1].type = "trunk"` inside the loop causes redundant assignments on every tree segment step.
- **Fix**: Set base trunk once outside the `tree` loop.

---

## 🟢 3. Low-Severity Issues, Code Smells & Cleanup

### 3.1 Script Loading Order in `index.html`
- **File**: [`index.html`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/index.html#L14-L24) (Lines 14–24)
- **Issue**: `sketch.js` is loaded **before** `src/Player.js`, `src/Inventory.js`, `src/Hand.js`, `src/Item.js`, `src/Block.js`, and `src/Cloud.js`.
- **Impact**: While p5 defers `setup()` until runtime, any top-level access in `sketch.js` to these classes will fail with a `ReferenceError`.
- **Fix**: Move `<script src="sketch.js"></script>` after all class dependencies.

---

### 3.2 Undeclared Global Variable `font`
- **File**: [`sketch.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/sketch.js#L64) (Line 64)
- **Issue**: `font = loadFont("fonts/Pixel.ttf");` assigns to implicit global `window.font` without a `let`, `const`, or `var` declaration.
- **Fix**: Declare `let font;` alongside other global variables at the top of `sketch.js`.

---

### 3.3 Dead Code & Incomplete Refactoring Artefacts
- **Files**:
  - [`sketch.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/sketch.js#L11) (Line 11): `let changedBlocks = [];` is declared and populated in `Inventory.js`, but never consumed or saved.
  - [`sketch.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/sketch.js#L342) (Line 342): `var sX = WORLD_W;` unused alias.
  - [`src/Inventory.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Inventory.js#L102-L106) (Lines 102–106): Commented out legacy code blocks.
  - [`sketch.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/sketch.js#L135-L154) (Lines 135–154): Save & Load Game buttons contain placeholder `print(...)` callbacks with no actual implementation.

---

### 3.4 Inconsistent Variable Scoping (`var` vs `let` / `const`)
- **Files**: Across all `.js` files.
- **Issue**: Extensive use of function-scoped `var` instead of modern block-scoped `let` and `const`. Loop indices (`var i`, `var j`, `var tree`) leak into enclosing function scopes.
- **Fix**: Modernize all declarations to `const` and `let`.

---

### 3.5 Hardcoded Keycodes
- **Files**: [`src/Player.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Player.js#L39-L96), [`sketch.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/sketch.js#L312-L316)
- **Issue**: Uses numeric key codes (`16` for Shift, `83` for S, `68` for D, `65` for A, `87` for W, `32` for Space, `49`-`54` for 1–6, `72` for H) which are deprecated in standard web APIs.
- **Fix**: Define semantic key mapping constants in `constants.js` or check `key`.

---

### 3.6 Overly Broad CSS Global Selector & Orphan Selector
- **File**: [`style.css`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/style.css#L12-L24) (Lines 12–24)
- **Issue**:
  1. `img, input { transform: translate(-50%, -50%); }` applies a global translation to all `<img>` and `<input>` elements in the DOM.
  2. `#game { ... }` styles an element that does not exist in `index.html`.
- **Fix**: Scope CSS classes specifically to p5 UI elements and remove orphaned selectors.

---

## 📋 Recommended Action Plan

1. **Phase 1: Fix High-Severity Runtime Crashes**
   - Fix out-of-bounds guards in [`src/Hand.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Hand.js) and [`src/Block.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Block.js).
   - Fix `blockW` typo in [`src/Item.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Item.js).
   - Fix `this.image` typo in [`src/Cloud.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Cloud.js).
   - Fix crack image indexing clamp in [`src/Block.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Block.js).
2. **Phase 2: Fix Core Mechanics & Physics**
   - Correct collision sweeping steps in [`src/Player.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Player.js).
   - Fix inventory stacking logic in [`src/Inventory.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/src/Inventory.js).
   - Fix edge rendering and regeneration in [`sketch.js`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/sketch.js).
3. **Phase 3: Clean Code & Architecture Modernization**
   - Correct script order in [`index.html`](file:///c:/Users/marco/Desktop/Marco/p5.js/My%20Craft/minecraft-clone-p5js/index.html).
   - Remove dead code and unused variables.
   - Clean up `style.css` and modernize `var` to `let`/`const`.
