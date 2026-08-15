class Player {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.w = PLAYER_W;
    this.h = PLAYER_H;
    this.mass = PLAYER_MASS;

    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.dir = "";

    this.i = round(x / BLOCK_W);
    this.j = round(y / BLOCK_W);

    this.bent = false;
    this.wasBent = false;

    this.H_vel = H_VEL;
    this.H_acc = 0;

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

    var box = this.getBoundingBox();
    noFill();
    stroke(220)
    rect(box.left, box.top, box.right - box.left, box.bottom - box.top);
  }

  update() {
    this.wasBent = this.bent;
    this.bent = false;

    // REFACTOR: Why don't just decrease this.vel instead of this.H_acc
    if (keyIsDown(16) || keyIsDown(83)) {
      // 'S' / 'Shift'
      this.bent = true;
    }

    // Applying horizontal movement ('A' and 'D' keys)
    if (this.dir == "right") {
      this.vel.x = this.H_acc;
    } else {
      this.vel.x = -this.H_acc;
    }
    if (keyIsDown(68)) {
      // 'D'
      this.dir = "right";
      this.vel.x = this.H_vel;
      this.H_acc = H_ACC;
    }
    if (keyIsDown(65)) {
      // 'A'
      this.dir = "left";
      this.vel.x = -this.H_vel;
      this.H_acc = H_ACC;
    }
    this.H_acc -= 0.2;
    if (this.H_acc < 0) this.H_acc = 0;

    if (keyIsDown(87) || keyIsDown(32)) {
      // 'W' / 'Space'
      this.jump = this.canJump();
      if (this.jump && !this.bent) {
        this.vel.y -= JUMP_VEL;
        this.jump = false;
        print("jump!");
      }
    }

    // Prevents overlapping when changing from bent to straight
    if (this.wasBent && !this.bent) {
      this.pos.y -= PLAYER_W;
      this.vel.y = 0;
    }

    // Move the player down if it is bent
    if (!this.wasBent && this.bent) {
      this.pos.y += (PLAYER_H - PLAYER_H_SNEAK) * 1;
      this.vel.y = 0;
    }

    // Add accelaration
    this.vel.add(this.acc);

    // Calculate this.vel vector that doesn't collide
    // this.move();

    this.vel.limit(BLOCK_W * 0.45);

    // Add horizontal velocity
    this.checkHorizontalCollisions();

    // Add vertical velocity
    this.checkVerticalCollisions();

    // Reset acceleration
    this.acc.set(0, 0);
  }

  canJump() {
    var box = this.getBoundingBox();
    // Add a small threshold to make the bounding box touch the ground
    box.bottom += 0.01;

    var range = this.getBoxRange(box);
    var j = max(0, floor(box.bottom / BLOCK_W));

    for (var i = range.left; i <= range.right; i++) {
      var block = blocks[i][j];

      if (!block.isEmpty && this.colliding(box, block)) {
        return true;
      }
    }

    return false;
  }

  checkHorizontalCollisions() {
    var newX = this.pos.x + this.vel.x;

    var box = this.getBoundingBox();
    // Future positions before correcting collisions
    box.left += this.vel.x;
    box.right += this.vel.x;
    var range = this.getBoxRange(box);

    for (var i = range.left; i <= range.right; i++) {
      for (var j = range.top; j < range.bottom; j++) {
        var block = blocks[i][j];

        if (!block.isEmpty && this.colliding(box, block)) {
          if (this.vel.x > 0) {
            // Moving to the right
            this.pos.x = block.x - this.w;
          } else {
            // Moving to the left
            this.pos.x = block.x + BLOCK_W;
          }

          this.vel.x = 0;
          return;
        }
      }

      // If it doesn't hit any block
      this.pos.x = newX;
    }
  }

  checkVerticalCollisions() {
    var newY = this.pos.y + this.vel.y;

    var box = this.getBoundingBox();
    // Future positions before correcting collisions
    box.top += this.vel.y;
    box.bottom += this.vel.y;
    var range = this.getBoxRange(box);

    for (var i = range.left; i <= range.right; i++) {
      for (var j = range.top; j <= range.bottom; j++) {
        var block = blocks[i][j];

        if (!block.isEmpty && this.colliding(box, block)) {
          if (this.vel.y > 0) {
            // Falling
            this.pos.y = block.y;
          } else {
            // Going up
            this.pos.y = block.y + BLOCK_W;
          }

          this.vel.y = 0;
          return;
        }
      }

      // If it doesn't hit any block
      this.pos.y = newY;
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
    var b = blocks[i][j];
    b.getDamage(this.breakingForce);
    if (b.life <= 0) {
      // Remove the block and restore block
      b.life = 1.0;
      inventory.storeBlock(i, j);
    }
  }

  applyForce(force) {
    let acc = p5.Vector.div(force, this.mass);
    this.acc.add(acc);
  }

  colliding(box, block) {
    return (
      box.left < block.x + BLOCK_W &&
      box.right > block.x &&
      box.top < block.y + BLOCK_W &&
      box.bottom > block.y
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
