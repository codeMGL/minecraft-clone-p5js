class Enemy {
  constructor(level) {
    this.level = level;
    var x = random(stX * 5, (stX - 5) * blockW);
    var y = -20;
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.w = blockW * 0.9;
    this.h = 44;
  }

  show() {
    fill(255, 0, 0);
    rect(this.pos.x, this.pos.y, this.w, this.h);
  }

  update() {
    this.vel.add(this.acc);
    //print("acc", this.acc.y)
    this.vel.limit(20);
    this.move(this.vel.x, 0);
    this.move(0, this.vel.y);
    this.preventOverlap(this.pos.x, this.pos.y);
    this.acc.set(0, 0);
  }

  move(a, b) {
    var x = this.pos.x + a;
    var y = this.pos.y + b;
    var si = round(x / blockW); // Start i
    var sj = round(y / blockW);
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

  chase() {
    var d = p5.Vector.dist(this.pos, player.pos);
    if (d > blockW) {
      this.vel.x = 0;
      var n = 2;
      if (this.pos.x > player.pos.x) {
        this.vel.x -= n;
      } else {
        this.vel.x += n;
      }
      if (this.pos.y > player.pos.y) {
        this.vel.y -= 1;
      }
    }
  }

  preventOverlap(x, y) {
    var si = round((x + this.w / 2) / blockW);
    var sj = round((y + this.h / 2) / blockW);
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
          if (x <= b.x + blockW) {
            newX -= 2;
          }
          if (y + this.h >= b.y) {
            newY += 2;
          }
          if (y <= b.y + blockW) {
            newY -= 2;
          }
        } // end colliding
      }
    }
    // print(newX, newY);
    this.pos.x += newX;
    this.pos.y += newY;
  }

  applyForce(force) {
    this.mass = 50;
    let acc = p5.Vector.div(force, this.mass);
    this.acc.add(acc);
  }

  colliding(x, y, other) {
    return (
      x + this.w >= other.x &&
      x <= other.x + blockW &&
      y + this.h >= other.y &&
      y <= other.y + blockW
    );
  }
}
