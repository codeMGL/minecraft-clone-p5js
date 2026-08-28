class Block {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.type = null;

    this.life = 1.0;
    this.lastDamage = 0;
  }

  get isEmpty() {
    return this.type == null;
  }

  draw() {
    if (!this.isEmpty) {
      imageMode(CORNER);

      // Draw the block
      var img = blockImages[this.type];

      if (this.type == "dirt") {
        const topBlock = blocks[this.x / BLOCK_W][this.y / BLOCK_W - 1];
        if (topBlock.isEmpty) {
          // We draw a dirt & grass block instead
          img = blockImages["grass"];
        }
      }
      image(img, this.x, this.y, BLOCK_W, BLOCK_W);

      // Draw the crack images
      if (this.life < 1) {
        var crackLevel = floor((1 - this.life) * 10);
        image(crackImages[crackLevel], this.x, this.y, BLOCK_W, BLOCK_W);
      }
    }

    this.regenerateLife();
  }

  getDamage(amount) {
    this.life = constrain(this.life - amount, 0, 1);
    if (this.life < 0.001) {
      this.life = 0;
    }
    this.lastDamage = millis();
  }

  regenerateLife() {
    // Wait 3 seconds
    const delay = 3000;

    if (millis() - this.lastDamage > delay && this.life < 1) {
      this.life = constrain(this.life + 0.005, 0, 1);
    }
  }
}
