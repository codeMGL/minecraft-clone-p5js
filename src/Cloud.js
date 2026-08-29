class Cloud {
  constructor() {
    const imgSize = random(0.1, 0.5);
    this.img = this.getImage();
    this.w = this.img.width * imgSize;
    this.h = this.img.height * imgSize;

    // Set the initial camera value
    this.camera = player.pos.x - width / 2;

    // Set initial values
    this.reset();

    // Make some clouds initially appear on the screen
    if (random(1) < 0.7) this.x -= width;
  }

  getImage() {
    const imgIndex = round(random(cloudImages.length - 1));
    return cloudImages[imgIndex];
  }

  show() {
    image(this.img, this.x, this.y, this.w, this.h);
  }

  update(cameraX) {
    // Apply wind horizontal velocity
    this.x += this.vel;

    // Apply parallax effect
    const cameraChange = cameraX - this.camera;
    this.x -= cameraChange * (1 - this.parallax_effect);
    // Update this.camera value
    this.camera = cameraX;

    if (this.x <= -this.w - random(20, 70)) {
      this.img = this.getImage();
      this.reset();
    }
  }
  reset() {
    this.x = width + random(20, width);
    this.y = random(20, height / 2);
    this.vel = random(-1.5, -0.1);

    // Higher effect means farther from the player, they move slower
    this.parallax_effect = random(0.6, 0.9)
  }
}
