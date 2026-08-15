class Player {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.w = PLAYER_W;
    this.h = PLAYER_H;
    this.mass = PLAYER_MASS;

    // Bounding box
    this.box = this.getBoundingBox();

    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.dir = "";

    this.i = round(x / BLOCK_W);
    this.j = round(y / BLOCK_W);

    this.bent = false;
    this.wasBent = false;

    this.H_vel = H_VEL;
    this.H_acc = 0;

    // Force applied to break a block, [0.0, 1.0]
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
    rect(this.pos.x, this.pos.y, this.w, this.h);
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

    // this.vel.limit(MAX_VEL);
    // this.move(this.vel.x, 0);
    // this.move(0, this.vel.y);
    // this.preventOverlap(this.pos.x, this.pos.y);
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
          stroke(0);
          noFill();
          rect(block.x, block.y, BLOCK_W);
          if (this.vel.x > 0) {
            // Moving to the right
            this.pos.x = block.x - this.w;
            print("touched > right block");
          } else {
            // Moving to the left
            print("touched < left block");
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
            this.pos.y = block.y - this.h;
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

  preventOverlap(x, y) {
    var si = round((x + this.w / 2) / BLOCK_W);
    var sj = round((y + this.h / 2) / BLOCK_W);
    si = max(0, si);
    sj = max(0, sj);
    var newX = 0,
      newY = 0;

    for (var i = si - 1; i <= si + 1; i++) {
      for (var j = sj; j <= sj + 1; j++) {
        var b = blocks[i][j];
        if (this.colliding(x, y, b) && b.type != null) {
          if (x + this.w >= b.x) {
            newX += 2;
          }
          if (x <= b.x + BLOCK_W) {
            newX -= 2;
          }
          if (y + this.h >= b.y) {
            newY += 2;
          }
          if (y <= b.y + BLOCK_W) {
            newY -= 2;
          }
        } // end colliding
      }
    }
    // print(newX, newY);
    this.pos.x += newX;
    this.pos.y += newY;
  }

  /**
   * Modifies this.vel so the bounding box doesn't intersect with any block
   */
  move() {
    this.vel.limit(BLOCK_W); /////////////////////////////////////////////////
    this.box = this.getBoundingBox();

    // Stores the minimum recorded length the this.vel vector can have for each vertex on this.body
    var minLength = 1000;
    for (var vertex of this.box) {
      // New coordinates of the vertex
      var newVertex = p5.Vector.add(vertex, this.vel);
      var i = max(0, round(newVertex.x / BLOCK_W));
      var j = max(0, round(newVertex.y / BLOCK_W));

      var block = blocks[i][j];
      noFill();
      stroke("black");
      line(vertex.x, vertex.y, newVertex.x, newVertex.y);
      stroke("red");
      if (
        this.colliding(newVertex.x, newVertex.y, block) &&
        block.type != null
      ) {
        var vect = p5.Vector.sub(newVertex, this.pos);
        print("vect", vect);
        minLength = min(minLength, vect.mag());
        stroke("green");
      }
      rect(block.x, block.y, BLOCK_W);
    }
    print("minLength", minLength);
    this.vel.limit(minLength);
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
      top: this.pos.y,
      bottom: this.pos.y + this.h,
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
