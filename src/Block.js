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
      
      // Draw the block
      var img = blockImages[this.type];

      if (this.type == "dirt") {
        const { i, j } = worldToGrid(this.x, this.y);
        // If the block above is air, draw a grass block instead
        if (j - 1 >= 0 && blocks[i][j - 1].isEmpty) {
          img = blockImages["grass"];
        }
      }
      imageMode(CORNER);
      image(img, this.x, this.y, BLOCK_W, BLOCK_W);

      // Draw the crack images
      if (this.life < 1) {
        var crackLevel = min(floor((1 - this.life) * 10), 9);
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
