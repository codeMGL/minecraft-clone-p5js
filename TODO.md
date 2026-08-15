- [ ] Use dict to store block types: block["tierra"] = tr (block.tierra = tr)
- [ ] Usar PLAY y SETTINGS images como p5.Image y no <image>
- [ ] Refactor: mouse = createVector(mouseX + trX, mouseY + trY) ?
- [ ] Add Items to Inventory.items.types (and refactor names) instead of adding Item.type(?)
- [ ] Check how changedBlocks and storage works (should be called on Inventory.storeBlock and Inventory.placeBlock?)
<<<<<<< Updated upstream
- [-] Add constants to change some variables (CLOUDS_NUM, INVENTARY_SIZE, BLOCK_W, etc)
- [-] Just draw the blocks on the canvas (make the world generate from [-100, 100] and set the player in the center)
- [ ] Fix canJump(), move() and preventOverlap() physics --> Make the player's starting position the bottom-left corner
- [x] Fix bending mechanics
- [ ] Fix clouds Paradax effect (and image colour)
=======
- [ ] Just draw the blocks on the canvas (make the world generate from [-100, 100] and set the player in the center)
>>>>>>> Stashed changes
- [ ] Add sprint
- [ ] Add mouse lateral keys
- [ ] Make removed blocks float until they're stored (or if storage is full)
- [ ] Improve visuals on broken blocks
<<<<<<< Updated upstream
- [ ] Don't let the hand break a far block if there's one near (break the nearest one first) 
=======
- [ ] Add a getBlockIndexFromCoordinates() function
- [ ] Make the jump a force rather than velocity
- [ ] Fix world borders restriction & drawing
- [x] Block could be a class
- [x] Add constants to change some variables (MAX_SPEED, BLOCK_W, etc)
- [x] Fix physics
- [x] Fix bending mechanics
- [x] Add Block.isEmpty on Player.colliding

>>>>>>> Stashed changes

- Generación procedural ✅
- Personaje ✅
- Colliding solo con los que están cerca ✅
- Pulir generacion (agua, árboles, césped) ✅
- Pulir personaje ✅
- Mover terreno (array infinita). Efecto paradax ✅
- Menu y seed ✅
- Item.js no sirve??
- Hand fuera del personaje
- Césped
- Agua con físicas
