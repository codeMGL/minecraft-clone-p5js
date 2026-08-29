class Inventory {
  constructor(numItems) {
    this.length = numItems;
    this.items = [];
    this.selected = 0; // Selected index

    this.bckColor = color(139);

    this.reset();
  }

  /**
   * Returns the current selected item on the inventory
   */
  get current() {
    return this.items[this.selected];
  }

  reset() {
    for (var i = 0; i < this.length; i++) {
      this.items[i] = {
        type: null,
        count: 0,
      };
    }
  }

  show() {
    imageMode(CORNER);
    var itemW = 35;
    var w = this.length * itemW;
    var h = 30;
    var strokeW = 2;

    // Big inventory rect
    fill(this.bckColor);
    stroke(234);
    strokeWeight(strokeW);
    rect((width - w) / 2, h, this.length * itemW, itemW);

    // Individual item squares
    for (var i = 0; i < this.length; i++) {
      var item = this.items[i];
      var x = (width - w) / 2 + itemW * i;

      // Item image
      if (item.type != undefined) {
        push();
        var imgW = itemW - strokeW / 2;
        var txtSize = 25;
        image(blockImages[item.type], x + strokeW / 2, h + strokeW / 2, imgW, imgW);
        noStroke();
        fill(255);
        textSize(txtSize);
        text(item.count, x, h + itemW + txtSize);
        pop();
      }

      // Item white square
      noFill();
      rect(x, h, itemW);
    }
    // Selected item square
    var x = (width - w) / 2 + itemW * this.selected;
    stroke(0);
    noFill();
    rect(x, h, itemW);
  }

  /**
   * Mark the block as 'null' and store it in the inventory if it's not full
   */
  storeBlock(block) {
    // REFACTOR: changedBlocks
    const { i, j } = worldToGrid(block.x, block.y);
    const changedBlock = {
      i,
      j,
      preType: block.type,
      actualType: null,
    };
    changedBlocks.push(changedBlock);
    ////
    var blockType = block.type;
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

    // REFACTOR: changedBlocks
    // var type = blocks[handX / w][handY / w].type;
    // var itemB = new Item(handX, handY, type);
    // items.push(itemB);
    /////
  }

  placeBlock(block) {
    if (this.current.type != null) {
      // REFACTOR: changedBlocks
      const { i, j } = worldToGrid(block.x, block.y);
      const changedBlock = {
        i,
        j,
        preType: block.type,
        actualType: this.current.type,
      };
      changedBlocks.push(changedBlock);
      /////

      block.type = this.current.type;

      this.current.count--;
      if (this.current.count <= 0) {
        this.current.count = 0;
        this.current.type = null;
      }
    }
  }
}
