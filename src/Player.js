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

    this.i = round(x / BLOCK_W);
    this.j = round(y / BLOCK_W);

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
    stroke(0, 255, 0);
    strokeWeight(1);
    line(
      this.pos.x + this.w / 2,
      this.pos.y,
      this.pos.x + this.w / 2 + this.vel.x * 5,
      this.pos.y,
    );

    // var box = this.getBoundingBox();
    // noFill();
    // stroke(220);
    // rect(box.left, box.top, box.right - box.left, box.bottom - box.top);
  }

  update() {
    // REFACTOR: Divide function into functionalities
    this.wasBent = this.bent;

    // Bend --
    if (keyIsDown(16) || keyIsDown(83)) {
      // 'S' / 'Shift'
      this.bent = true;
    } else if (this.bent) {
      // Check if the player can be straight (this.bent = false);
      var newJ = max(0, floor((this.pos.y - PLAYER_H) / BLOCK_W));
      var box = this.getBoundingBox();
      box.top = box.bottom - PLAYER_H;
      var range = this.getBoxRange(box);

      this.bent = false;
      for (var i = range.left; i <= range.right; i++) {
        if (this.colliding(box, blocks[i][newJ])) {
          // It will collide
          this.bent = true;
          break;
        }
      }
    }

    // Applying horizontal movement ('A' and 'D' keys) --
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

    // JUMP --
    if (keyIsDown(87) || keyIsDown(32)) {
      // 'W' / 'Space'
      if (this.canJump()) {
        this.vel.y -= JUMP_VEL;
        print("jump!");
      }
    }

    // Apply physics --
    // Add accelaration
    this.vel.add(this.acc);

    // Add horizontal velocity, if there are no collisions
    if (this.vel.x != 0) {
      this.checkHorizontalCollisions();
    }

    // Add vertical velocity, if there are no collisions
    if (this.vel.y != 0) {
      this.checkVerticalCollisions();
    }

    // Reset acceleration
    this.acc.set(0, 0);

    // Contrain player's position
    var blockOffset = HAND_MAX_LEN;
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
    var j = max(0, floor(box.bottom / BLOCK_W));

    for (var i = range.left; i <= range.right; i++) {
      if (this.colliding(box, blocks[i][j])) {
        return true;
      }
    }

    return false;
  }

  checkHorizontalCollisions() {
    // Check collisions step by step to prevent tunneling
    for (
      var vel = min(this.vel.x, BLOCK_W);
      vel <= this.vel.x;
      vel += BLOCK_W
    ) {
      var box = this.getBoundingBox();
      box.left += vel;
      box.right += vel;
      var range = this.getBoxRange(box);

      for (var i = range.left; i <= range.right; i++) {
        for (var j = range.top; j <= range.bottom; j++) {
          var block = blocks[i][j];

          if (this.colliding(box, block)) {
            if (this.vel.x > 0) {
              // Moving to the right
              this.pos.x = block.x - this.w;
            } else {
              // Moving to the left
              this.pos.x = block.x + BLOCK_W;
            }

            this.vel.x = 0;
            this.currentSpeed = 0;
            return;
          }
        }
      }
      // If it doesn't hit any block
      this.pos.x += this.vel.x;
    }
  }

  checkVerticalCollisions() {
    for (
      var vel = min(BLOCK_W, this.vel.y);
      vel <= this.vel.y;
      vel += BLOCK_W
    ) {
      var box = this.getBoundingBox();
      // Future positions before correcting collisions
      box.top += vel;
      box.bottom += vel;
      var range = this.getBoxRange(box);

      for (var i = range.left; i <= range.right; i++) {
        for (var j = range.top; j <= range.bottom; j++) {
          var block = blocks[i][j];

          if (this.colliding(box, block)) {
            if (this.vel.y > 0) {
              // Falling
              this.pos.y = block.y;
            } else {
              // Going up
              this.pos.y = block.y + BLOCK_W + this.h;
            }

            this.vel.y = 0;
            return;
          }
        }
      }

      // If it doesn't hit any block
      this.pos.y += this.vel.y;
    }
  }

  /**
   * Prevents the collision between the player an a new block
   * @param {Block} block
   */
  preventOverlap(block) {
    var box = this.getBoundingBox();

    if (this.colliding(box, block)) {
      // Check the horizontal distance between both centers
      var horDist = block.x + BLOCK_W / 2 - (this.pos.x + this.w / 2);

      // Move the player in the opposite direction
      if (horDist > 0) {
        // Block at the right, move the player to the left
        this.pos.x = block.x - this.w;
      } else {
        this.pos.x = block.x + this.w;
      }
    }
  }

  breakBlock(i, j) {
    var block = blocks[i][j];
    block.getDamage(this.breakingForce);
    if (block.life <= 0) {
      // Remove the block and restore block
      block.life = 1.0;
      inventory.storeBlock(i, j);
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
   * Returns if the bounding box is colliding with a non-empty block
   */
  colliding(box, block) {
    return (
      box.left < block.x + BLOCK_W &&
      box.right > block.x &&
      box.top < block.y + BLOCK_W &&
      box.bottom > block.y &&
      !block.isEmpty
    );
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
    return {
      left: max(0, floor(box.left / BLOCK_W)),
      right: max(0, floor(box.right / BLOCK_W)),
      top: max(0, floor(box.top / BLOCK_W)),
      bottom: max(0, floor(box.bottom / BLOCK_W)),
    };
  }
}
