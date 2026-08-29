class Hand {
  constructor() {
    this.i = 0;
    this.j = 0;
  }

  /**
   * Whether it's posible to place a block or not
   */
  get canPlace() {
    // Do not check if there's no selected object
    if (inventory.current.type == null) return true;

    // If the mouse is inside the world
    if (isValidGridPos(this.i, this.j)) {
      // If there's an overlap, it means the block cannot be placed
      return !player.checkOverlap(blocks[this.i][this.j], false);
    }

    return false;
  }

  update() {
    // Center position of the player
    const plyrPos = createVector(
      player.pos.x + player.w / 2,
      player.pos.y - player.h / 2,
    );
    // Mouse translated position
    const mouse = createVector(mouseX + cameraX, mouseY + cameraY);
    // Vector pointing from the player to the mouse
    const playerToMouse = p5.Vector.sub(mouse, plyrPos).limit(HAND_MAX_LEN);
    const handPos = p5.Vector.add(plyrPos, playerToMouse);
    ({ i: this.i, j: this.j } = worldToGrid(handPos.x, handPos.y));

  }

  show() {
    push();
    noFill();
    stroke(255);
    strokeWeight(2);
    if (!this.canPlace) {
      stroke(255, 0, 0);
    }

    const { x, y } = gridToWorld(this.i, this.j);
    rect(
      x,
      y,
      BLOCK_W,
      BLOCK_W,
    );
    pop();
  }

  /**
   * Check for mouse actions: break block, place block
   */
  actions() {

    // If the mouse is inside the world
    if (isValidGridPos(this.i, this.j)) {
      const block = blocks[this.i][this.j];
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
