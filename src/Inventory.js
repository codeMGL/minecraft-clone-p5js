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

  draw() {
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
        image(item.type, x + strokeW / 2, h + strokeW / 2, imgW, imgW);
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
    stroke("red");
    noFill();
    rect(x, h, itemW);

  }

  storeBlock(i, j, blockType) {
    // REFACTOR: changedBlocks
    var block = {
      i: i,
      j: j,
      preType: blocks[i][j].type,
      actualType: null,
    };
    changedBlocks.push(block);
    ////
    blocks[i][j].type = null;

    // Store block into the array
    for (var i = 0; i < this.length; i++) {
      var item = this.items[i];
      if (item.type == null) {
        item.type = blockType;
        item.count++;
        break;
      } else {
        if (item.type == blockType && item.count < 9) {
          item.type = blockType;
          item.count++;
          break;
        }
      }
    }

    // REFACTOR: changedBlocks
    // var type = blocks[handX / w][handY / w].type;
    // var itemB = new Item(handX, handY, type);
    // items.push(itemB);
    /////
  }

  placeBlock(i, j, blockType) {
    if (this.current.type != null) {
      // REFACTOR: Add block to changedBlocks
      var blockB = {
        x: i,
        y: j,
        preType: null,
        actualType: this.selected.type,
      };
      changedBlocks.push(blockB);
      /////

      blocks[i][j].type = this.current.type;
      this.current.count--;
      if (this.current.count <= 0) {
        this.current.count = 0;
        this.current.type = null;
      }
    }
  }
}
