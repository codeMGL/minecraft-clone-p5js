class Inventory {
  constructor(numItems) {
    this.length = numItems;
    this.items = [];
    this.selected = 0; // Selected index

    this.bckColor = color(139);

    this.reset();

    this.itemW = 35;
    this.w = this.length * this.itemW;
    this.h = 30;
    this.strokeW = 2;
    this.txtSize = 25;
  }

  /**
   * Returns the current selected item on the inventory
   */
  get current() {
    return this.items[this.selected];
  }

  reset() {
    for (let i = 0; i < this.length; i++) {
      this.items[i] = {
        type: null,
        count: 0,
      };
    }
  }

  show() {
    push();
    imageMode(CORNER);

    // Big inventory rect
    fill(this.bckColor);
    stroke(234);
    strokeWeight(this.strokeW);
    rect((width - this.w) / 2, this.h, this.length * this.itemW, this.itemW);

    // Individual item squares
    for (let i = 0; i < this.length; i++) {
      const item = this.items[i];
      const x = (width - this.w) / 2 + this.itemW * i;

      // Item image
      if (item.type != undefined) {
        const imgW = this.itemW - this.strokeW / 2;
        image(
          blockImages[item.type],
          x + this.strokeW / 2,
          this.h + this.strokeW / 2,
          imgW,
          imgW,
        );
        noStroke();
        fill(255);
        textSize(this.txtSize);
        text(item.count, x, this.h + this.itemW + this.txtSize);
      }

      // Item white square
      noFill();
      stroke(255)
      rect(x, this.h, this.itemW);
    }
    // Selected item square
    const x = (width - this.w) / 2 + this.itemW * this.selected;
    stroke(0);
    noFill();
    rect(x, this.h, this.itemW);
    pop();
  }

  /**
   * Mark the block as 'null' and store it in the inventory if it's not full
   */
  storeBlock(block) {
    const blockType = block.type;
    block.type = null;

    // -- Store block into the array --

    // 1. Check first if there is a non full slot
    for (const item of this.items) {
      if (item.type == blockType && item.count < 9) {
        item.type = blockType;
        item.count++;
        return;
      }
    }

    // 2. No non full slots found, create one
    for (const item of this.items) {
      if (item.type == null) {
        item.type = blockType;
        item.count++;
        return;
      }
    }
  }

  placeBlock(block) {
    if (this.current.type != null) {
      block.type = this.current.type;

      this.current.count--;
      if (this.current.count <= 0) {
        this.current.count = 0;
        this.current.type = null;
      }
    }
  }
}
