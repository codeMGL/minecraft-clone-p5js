class Player {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.w = PLAYER_W;
    this.h = PLAYER_H;
    this.mass = PLAYER_MASS;

    this.vel = createVector(0, 0);
    // Scalar counting how much to increase the velocity
    this.currentSpeed = 0;
    this.acc = createVector(0, 0);
    this.dir = "";

    this.bent = false;
    this.wasBent = false;

    // Force applied to break a block, between 0.0 and 1.0
    this.breakingForce = HAND_BREAK_FORCE;
  }

  show() {
    // Update height if it's bent
    if (!this.bent) {
      this.h = PLAYER_H;
    } else {
      this.h = PLAYER_H_SNEAK;
    }

    fill(0);
    noStroke();
    // Start drawing the rectangle from the left-bottom corner
    rect(this.pos.x, this.pos.y - this.h, this.w, this.h);
  }

  update() {
    this.wasBent = this.bent;

    // -- BEND PLAYER --
    if (keyIsDown(16) || keyIsDown(83)) {
      // 'S' / 'Shift'
      this.bent = true;
    } else if (this.bent) {
      // Check if the player can be straight;
      this.bent = false;
      // Temporarily increase the height to check collisions
      this.h = PLAYER_H;
      var box = this.getBoundingBox();
      var range = this.getBoxRange(box);

      for (var i = range.left; i <= range.right; i++) {
        for (var j = range.top; j <= range.bottom; j++) {
          if (this.colliding(box, blocks[i][j])) {
            // It will collide, we revert the changes
            this.bent = true;
            this.h = PLAYER_H_SNEAK;
            break;
          }
        }
      }
    }

    // -- APPLY HORIZONTAL MOVEMENT ('A' and 'D' keys) --
    if (keyIsDown(68)) {
      // 'D'
      this.dir = "right";
      // The player's speed is constrained between it's minimum speed (when it goes from still to moving)
      // and it's maximum speed, increasing by a factor of 'ACCELERATION'
      this.currentSpeed = min(
        max(MIN_SPEED, this.currentSpeed + ACCELERATION),
        MAX_SPEED,
      );
    }
    if (keyIsDown(65)) {
      // 'A'
      this.dir = "left";
      this.currentSpeed = max(
        min(-MIN_SPEED, this.currentSpeed - ACCELERATION),
        -MAX_SPEED,
      );
    }
    // Apply friction
    if (this.currentSpeed > 0) {
      this.currentSpeed -= FRICTION;
    } else if (this.currentSpeed < 0) {
      this.currentSpeed += FRICTION;
    }
    // Speed is null if near zero
    this.currentSpeed =
      abs(this.currentSpeed) < MIN_SPEED / 2 ? 0 : this.currentSpeed;

    // Apply changes
    this.vel.x = this.currentSpeed;

    // -- APPLY VERTICAL MOVEMENT --
    if (keyIsDown(87) || keyIsDown(32)) {
      // 'W' / 'Space'
      if (this.canJump()) {
        this.vel.y -= JUMP_VEL;
      }
    }

    // -- APPLY PHYSICS --
    // Add accelaration
    this.vel.add(this.acc);

    // Add horizontal velocity
    this.checkCollisions("x");

    // Add vertical velocity
    this.checkCollisions("y");

    // Reset acceleration
    this.acc.set(0, 0);

    // -- CONSTRAIN PLAYER'S POSITION --
    var blockOffset = HAND_MAX_LEN * 2;
    this.pos.x = constrain(
      this.pos.x,
      blockOffset,
      WORLD_W * BLOCK_W - this.w - blockOffset,
    );
    this.pos.y = constrain(
      this.pos.y,
      this.h + blockOffset,
      WORLD_H * BLOCK_W - blockOffset,
    );
  }

  canJump() {
    if (this.bent) {
      return false;
    }

    var box = this.getBoundingBox();
    // Add a small threshold to make the bounding box touch the ground
    box.bottom += 0.01;
    var range = this.getBoxRange(box);

    for (var i = range.left; i <= range.right; i++) {
      if (
        isValidGridPos(i, range.bottom) &&
        this.colliding(box, blocks[i][range.bottom])
      ) {
        return true;
      }
    }

    return false;
  }

  checkCollisions(axis) {
    // Check collisions step by step to prevent tunneling
    const isX = axis == "x";
    const totalVel = this.vel[axis];
    if (totalVel == 0) return;

    let remainingVel = abs(totalVel);
    const stepDir = Math.sign(totalVel);

    while (remainingVel > 0) {
      const step = min(remainingVel, BLOCK_W) * stepDir;

      const box = this.getBoundingBox();
      if (isX) {
        box.left += step;
        box.right += step;
      } else {
        box.top += step;
        box.bottom += step;
      }
      let range = this.getBoxRange(box);

      for (var i = range.left; i <= range.right; i++) {
        for (var j = range.top; j <= range.bottom; j++) {
          if (!isValidGridPos(i, j)) continue;
          var block = blocks[i][j];
          if (this.colliding(box, block)) {
            if (isX) {
              this.pos.x = stepDir > 0 ? block.x - this.w : block.x + BLOCK_W;
              this.vel.x = 0;
              this.currentSpeed = 0;
            } else {
              this.pos.y = stepDir > 0 ? block.y : block.y + BLOCK_W + this.h;
              this.vel.y = 0;
            }
            return;
          }
        }
      }
      // If it doesn't hit any block, we update
      this.pos[axis] += step;
      remainingVel -= abs(step);
    }
  }

  /**
   * Check if there is an overlap between the current block and the player
   * @param {Block} block Block object
   * @param {bool} applyChanges Whether to move the player to prevent the overlap or not
   * @returns {bool} Returns true if there is an overlap (the block cannot be placed)
   */
  checkOverlap(block, applyChanges = false) {
    // We store the original attributes of the player in case we reverse them (applyChanges = true)
    const playerPos = this.pos.copy();
    const playerBent = this.bent;

    // -- VERTICAL OVERLAP --
    var box = this.getBoundingBox();

    if (this.collidingEmpty(box, block)) {
      const blockIsTopOfPlayer =
        this.pos.y - this.h / 2 - (block.y + BLOCK_W / 2) >= 0;

      if (blockIsTopOfPlayer) {
        // Block at the top, bend the player
        this.bent = true;
        this.h = PLAYER_H_SNEAK;
      } else {
        // Block at the bottom, move the player to its top
        this.pos.y = block.y;
      }
    }

    // -- HORIZONTAL OVERLAP --
    box = this.getBoundingBox();

    if (this.collidingEmpty(box, block)) {
      // Whether the player is at the right of the block or not
      const playerIsRightOfBlock =
        block.x + BLOCK_W / 2 - (this.pos.x + this.w / 2) >= 0;

      if (box.right > block.x && playerIsRightOfBlock) {
        // Block at the right, move the player to the left
        this.pos.x = block.x - this.w;
      } else if (block.x + BLOCK_W > box.left && !playerIsRightOfBlock) {
        // Block at the left, move the player to the right
        this.pos.x = block.x + BLOCK_W;
      }
    }

    // -- CHECK IF THE PLAYER IS STILL COLLIDING --
    // When preventing overlaps with 'block',
    // it may collide with the adjacent ones
    box = this.getBoundingBox();
    var range = this.getBoxRange(box);

    for (var i = range.left; i <= range.right; i++) {
      for (var j = range.top; j <= range.bottom; j++) {
        if (isValidGridPos(i, j) && this.colliding(box, blocks[i][j])) {
          // The new position collides with other block

          // Reset attributes
          if (!applyChanges) {
            this.pos = playerPos.copy();
            this.bent = playerBent;
            this.h = playerBent ? PLAYER_H_SNEAK : PLAYER_H;
          }
          // There's an overlap
          return true;
        }
      }
    }

    // Reset attributes
    if (!applyChanges) {
      this.pos = playerPos.copy();
      this.bent = playerBent;
      this.h = playerBent ? PLAYER_H_SNEAK : PLAYER_H;
    }
    // There's no overlap
    return false;
  }

  breakBlock(block) {
    block.getDamage(this.breakingForce);
    if (block.life <= 0) {
      // Remove the block and restore block
      block.life = 1.0;
      inventory.storeBlock(block);
    }
  }

  /**
   * Transforms a force vector into an acceleration
   * @param {p5.Vector} force
   */
  applyForce(force) {
    var acc = p5.Vector.div(force, this.mass);
    this.acc.add(acc);
  }

  /**
   * Returns if the bounding box is colliding with any block
   */
  collidingEmpty(box, block) {
    return (
      box.left < block.x + BLOCK_W &&
      box.right > block.x &&
      box.top < block.y + BLOCK_W &&
      box.bottom > block.y
    );
  }

  /**
   * Returns if the bounding box is colliding with a non-empty block
   */
  colliding(box, block) {
    return this.collidingEmpty(box, block) && !block.isEmpty;
  }

  getBoundingBox() {
    return {
      left: this.pos.x,
      right: this.pos.x + this.w,
      top: this.pos.y - this.h,
      bottom: this.pos.y,
    };
  }

  getBoxRange(box) {
    const leftTopCorner = worldToGrid(box.left, box.top);
    const rightBottomCorner = worldToGrid(box.right, box.bottom);
    return {
      left: leftTopCorner.i,
      right: rightBottomCorner.i,
      top: leftTopCorner.j,
      bottom: rightBottomCorner.j,
    };
  }
}
