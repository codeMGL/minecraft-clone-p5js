class Hand {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  /**
   * Whether it's posible to place a block or not
   */
  get canPlace() {
    const i = this.x / BLOCK_W;
    const j = this.y / BLOCK_W;

    // Do not check if there's no selected object
    if (inventory.current.type == null) return true;

    // If the mouse is inside the canvas
    if (i > 0 && i < WORLD_W * BLOCK_W && j > 0 && j < WORLD_H * BLOCK_W) {
      // If there's an overlap, it means the block cannot be placed
      return !player.checkOverlap(blocks[i][j], false);
    }
  }

  update() {
    // Center position of the player
    var plyrPos = createVector(
      player.pos.x + player.w / 2,
      player.pos.y - player.h / 2,
    );
    // Mouse translated position
    var mouse = createVector(mouseX + cameraX, mouseY + cameraY);
    // Vector pointing from the player to the mouse
    var pos = p5.Vector.sub(mouse, plyrPos).limit(HAND_MAX_LEN);
    this.x = plyrPos.x + pos.x - ((plyrPos.x + pos.x) % BLOCK_W);
    this.y = plyrPos.y + pos.y - ((plyrPos.y + pos.y) % BLOCK_W);
  }

  draw() {
    noFill();
    stroke(255);
    strokeWeight(2);
    if (!this.canPlace) {
      stroke(255, 0, 0);
    }

    rect(this.x, this.y, BLOCK_W, BLOCK_W);
  }

  /**
   * Check for mouse actions: break block, place block
   */
  actions() {
    var i = hand.x / BLOCK_W;
    var j = hand.y / BLOCK_W;
    var block = blocks[i][j];

    // If the mouse is inside the canvas
    if (i > 0 && i < WORLD_W * BLOCK_W && j > 0 && j < WORLD_H * BLOCK_W) {
      if (mouseButton == LEFT && !block.isEmpty) {
        player.breakBlock(block);
      }

      if (
        mouseButton == RIGHT &&
        this.canPlace &&
        block.isEmpty &&
        inventory.current.type != null
      ) {
        inventory.placeBlock(block);
        // We prevent the overlap between the new block and the player
        player.checkOverlap(block, true);
      }
    }
  }
}
