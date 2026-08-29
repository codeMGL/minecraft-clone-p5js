class ImageButton {
  constructor(img, x, y, w, h, onClick = null) {
    this.img = img;
    this.onClick = onClick;

    // Default properties
    this.defaultPos = createVector(x, y);
    this.defaultW = w;
    this.defaultH = h;

    // Active drawing properties
    this.drawingPos = this.defaultPos.copy();
    this.drawingW = w;
    this.drawingH = h;

    this.hoverScale = 1.1;
  }

  show() {
    push();
    imageMode(CENTER);
    image(
      this.img,
      this.drawingPos.x,
      this.drawingPos.y,
      this.drawingW,
      this.drawingH
    );
    pop();
  }

  /**
   * Increase drawing dimensions by a given factor
   */
  increaseSize(factor = 1.08) {
    this.drawingW = this.defaultW * factor;
    this.drawingH = this.defaultH * factor;
  }

  /**
   * Reset the button back to its initial position and size.
   */
  reset() {
    this.drawingPos.set(this.defaultPos.x, this.defaultPos.y);
    this.drawingW = this.defaultW;
    this.drawingH = this.defaultH;
  }

  /**
   * Update hovering size and draw
   */
  update() {
    if (this.mouseOver()) {
      cursor(HAND);
      this.increaseSize(this.hoverScale);
    } else {
      this.reset();
    }
    this.show();
  }

  /**
   * Update the default position
   */
  setPosition(x, y) {
    this.defaultPos.set(x, y);
    this.drawingPos.set(x, y);
  }

  mouseOver() {
    const halfW = this.drawingW / 2;
    const halfH = this.drawingH / 2;
    return (
      mouseX >= this.drawingPos.x - halfW &&
      mouseX <= this.drawingPos.x + halfW &&
      mouseY >= this.drawingPos.y - halfH &&
      mouseY <= this.drawingPos.y + halfH
    );
  }

  /**
   * Register a click callback or handle click if no argument passed
   */
  click(fn = null) {
    // Assign a new onClick function
    if (typeof fn === "function") {
      this.onClick = fn;
      return this;
    }

    // Register a click event
    if (this.mouseOver() && this.onClick) {
      this.onClick();
      return true;
    }
    return false;
  }
}



