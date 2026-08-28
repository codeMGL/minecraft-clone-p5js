class Cloud {
  constructor() {
    this.x = random(20, width + 100);
    this.y = random(170, 230);

    var imgSize = random(0.1, 0.5);
    this.img = this.getImage();
    this.w = this.img.width * imgSize;
    this.h = this.img.height * imgSize;

    this.vel = random(-1, -0.2);
  }

  getImage() {
    var imgIndex = round(random(cloudImages.length - 1));
    return cloudImages[imgIndex];
  }

  show() {
    image(this.img, this.x, this.y, this.w, this.h);
    this.x += this.vel;
  }

  restart() {
    if (this.x <= -this.w - random(20, 70)) {
      this.image = this.getImage();

      this.x = random(width + 100, width + 175);
      this.y = random(10, 100);
      this.vel = random(-1, -0.2);
    }
  }
}
