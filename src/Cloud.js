class Cloud {
  constructor(img, x, y, vel) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.vel = vel;
    var scl = random(1.5, 3);
    this.w = (this.img.width / 10) * scl;
    this.h = (this.img.height / 10) * scl;
  }

  show() {
    image(this.img, this.x, this.y, this.w, this.h);
    this.x += this.vel;
  }

  restart() {
    if (this.x <= -this.w - random(20, 70)) {
      var img = n1;
      if (random(1) > 0.5) {
        img = n2;
      }
      this.img = img;
      this.x = random(width + 100, width + 175);
      this.y = random(10, 100);
      this.vel = random(-1, -0.2);
    }
  }
}
