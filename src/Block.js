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

  /* Debug method */
  d(r, g, b) {
    stroke(r, g, b);
    noFill();
    rect(this.x, this.y, BLOCK_W);
  }

  draw() {
    if (!this.isEmpty) {
      imageMode(CORNER);
      image(this.type, this.x, this.y, BLOCK_W, BLOCK_W);

      if (this.life < 1) {
        // We draw the crack images
        var crackLevel = floor((1 - this.life) * 10);
        print(crackLevel);
        image(crackImages[crackLevel], this.x, this.y, BLOCK_W, BLOCK_W);
      }
    }

    this.regenerateLife();
  }

  getDamage(amount) {
    this.life = constrain(this.life - amount, 0, 1);
    this.lastDamage = millis();
  }

  regenerateLife() {
    const delay = 3000; // espera 3 segundos tras recibir daño

    if (millis() - this.lastDamage > delay && this.life < 1) {
      this.life = constrain(this.life + 0.01, 0, 1);
    }
  }
}
