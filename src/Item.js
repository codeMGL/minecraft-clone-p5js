class Item {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }
  
  show() {
    image(this.type, this.x + blockW * 0.25, this.y + blockW * 0.25, blockW * 0.5, blockW * 0.5)
  }
}
