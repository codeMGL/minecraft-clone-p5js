class Item {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  show() {
    imageMode(CORNER);
    image(
      blockImages[this.type],
      this.x + BLOCK_W * 0.25,
      this.y + BLOCK_W * 0.25,
      BLOCK_W * 0.5,
      BLOCK_W * 0.5,
    );
  }
}
