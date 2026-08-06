class Inventary {
  constructor(numItems) {
    this.length = numItems;
    this.items = [];
    this.selected = 0; // Selected index

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
    imageMode(CENTER);
    image(invImg, width / 2, 20, 175, 32);
    for (var inv = 0; inv < this.length; inv++) {
      var item = this.items[inv];
      if (item.type != undefined) {
        image(item.type, 185 + inv * 28.5, 20, 20, 20);
        noStroke();
        fill(255);
        textSize(28);
        text(item.count, 185 + inv * 28.5, 50);
      }
    }
    noFill();
    stroke(255, 0, 0);
    strokeWeight(3);
    rect(173 + this.selected * 28.5, 8, 25, 25);
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
