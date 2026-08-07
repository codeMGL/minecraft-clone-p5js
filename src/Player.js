class Player {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.w = PLAYER_W;
    this.h = PLAYER_H;

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
    fill(0);
    noStroke();
    if (!this.bent) {
      this.h = PLAYER_H;
    } else {
      this.h = PLAYER_H_SNEAK;

      if (this.bent && !this.wasBent) {
        // Move the player down
        this.pos.y += BLOCK_W * (1.6 - 0.9);
      }
    }
    rect(this.pos.x, this.pos.y, this.w, this.h);
  }

  canJump() {
    var x = this.pos.x,
      y = this.pos.y;
    var si = round((x + this.w / 2) / BLOCK_W); // Start i
    var sj = round((y + this.h / 2) / BLOCK_W);
    si = max(1, si);
    sj = max(1, sj);
    for (var i = si - 1; i <= si + 1; i++) {
      for (var j = sj - 1; j <= sj + 1; j++) {
        if (
          blocks[i][j].type != null &&
          this.colliding(x, y + 0.1, blocks[i][j])
        ) {
          if (abs(y + this.h - blocks[i][j].y) > 0.02) {
            return true;
          }
        }
      }
    }
    return false;
  }

  update() {
    this.wasBent = this.bent;
    this.bent = false;

    // REFACTOR: Why don't just decrease this.vel instead of this.this.H_acc
    if (this.dir == "right") {
      this.vel.x = this.H_acc;
    } else {
      this.vel.x = -this.H_acc;
    }
    if (keyIsDown(68)) {
      this.dir = "right";
      this.vel.x = this.H_vel;
      this.H_acc = H_ACC;
    }
    if (keyIsDown(65)) {
      this.dir = "left";
      this.vel.x = -this.H_vel;
      this.H_acc = H_ACC;
    }
    this.H_acc -= 0.2;
    if (this.H_acc < 0) this.H_acc = 0;

    if (keyIsDown(16) || keyIsDown(83)) {
      this.bent = true;
    }
    if (keyIsDown(87) || keyIsDown(32)) {
      this.jump = this.canJump();
      if (this.jump && !this.bent) {
        //var jump = createVector(0, -350);
        //this.applyForce(jump);
        //this.acc.y -= 1;
        this.vel.y -= JUMP_VEL;
        this.jump = false;
      }
    }
    // Prevents overlapping when changing from bent to straight
    if (this.wasBent && !this.bent) {
      this.pos.y -= BLOCK_W * 0.8;
      this.vel.y = 0;
    }

    this.vel.add(this.acc);
    //print("acc", this.acc.y)
    this.vel.limit(20);
    this.move(this.vel.x, 0);
    this.move(0, this.vel.y);
    this.preventOverlap(this.pos.x, this.pos.y);
    this.acc.set(0, 0);
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

  move(a, b) {
    var x = this.pos.x + a;
    var y = this.pos.y + b;
    var si = round(x / BLOCK_W); // Start i
    var sj = round(y / BLOCK_W);
    si = max(0, si);
    sj = max(0, sj);
    var newPos = createVector(a, b);
    for (var i = si - 1; i <= si + 1; i++) {
      for (var j = sj; j <= sj + 1; j++) {
        var block = blocks[i][j];
        if (this.colliding(x, y, block) && block.type != null) {
          if (newPos.mag() > 0.2) {
            newPos.mult(0.5);
            newPos.y = float(nf(newPos.y, 2, 3));
            this.move(newPos.x, newPos.y);
            this.vel.x = 0;
            if (a == 0) this.vel.y = 0;
            return 0;
          } else {
            return 0;
          }
        }
      }
    }
    this.pos.add(newPos);
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
    this.mass = 50;
    let acc = p5.Vector.div(force, this.mass);
    this.acc.add(acc);
  }

  colliding(x, y, other) {
    return (
      x + this.w >= other.x &&
      x <= other.x + BLOCK_W &&
      y + this.h >= other.y &&
      y <= other.y + BLOCK_W
    );
  }
}
