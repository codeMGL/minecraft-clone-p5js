// -- OBJECTS --
// 2D array for the blocks, initialized at createWorld()
let blocks = [];
// Inventory (stores blocks)
let inventory;
// Hand object (selects blocks to break or place)
let hand;
let clouds = [];
var player;

let changedBlocks = [];

var gravity; // Gravity vector

// If the game has started yet or not
var initialized = false;

// Start and translate variables
var cameraX, cameraY;
var txt = "",
  FPScount = 0;

// Game mode
var mode = "home";

// Save and load game buttons
var saveGameBtn,
  loadGameBtn;

// Seed input
var seedInp;
var seed;

var lastMouseAction = 0;

// Image variables
var blockImages = {};
var cloudImages = [];
var crackImages = [];
var logoImg, settingsImg, playImg, backImg;
var playButton, settingsButton, backButton;
function preload() {
  // -- Images --
  blockImages["dirt"] = loadImage("images/dirt.jpeg");
  blockImages["grass"] = loadImage("images/dirt_grass.jpeg");
  blockImages["stone"] = loadImage("images/stone.jpeg");
  blockImages["trunk"] = loadImage("images/trunk.jpeg");
  blockImages["leaf"] = loadImage("images/leaf.png");

  cloudImages.push(loadImage("images/cloud_1.png"));
  cloudImages.push(loadImage("images/cloud_2.png"));

  for (var i = 0; i <= 9; i++) {
    crackImages.push(loadImage("images/destroy_stage_" + i + ".png"));
  }

  logoImg = loadImage("images/logo.png");
  settingsImg = loadImage("images/settings.png");
  playImg = loadImage("images/play.png");
  backImg = loadImage("images/back.png");


  // -- Font --
  font = loadFont("fonts/Pixel.ttf");
}

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);

  if (DEBUG) {
    randomSeed(42);
    noiseSeed(42);
  }

  // Disable right-click context menu inside the canvas
  canvas.elt.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  noStroke();
  textFont(font);
  gravity = createVector(0, GRAVITY_FORCE);

  var startX = (WORLD_W * BLOCK_W) / 2;
  var startY = (WORLD_H * BLOCK_W) / 2 - 10 * BLOCK_W;
  player = new Player(startX, startY);

  // Create the inventory
  inventory = new Inventory(6);

  // Create the hand object
  hand = new Hand();

  // Create the clouds
  for (var j = 0; j < CLOUDS_COUNT; j++) {
    clouds[j] = new Cloud();
  }

  // Create the button objects
  playButton = new ImageButton(playImg, width / 2, 400, 149, 51, () => {
    mode = "game";
    if (!initialized) {
      createWorld();
      initialized = true;
    }
  });

  settingsButton = new ImageButton(settingsImg, width / 2, 480, 270, 51, () => {
    mode = "settings";
  });

  backButton = new ImageButton(backImg, width / 2, 380, 94, 30, () => {
    mode = "home";
  });

  // Seed input
  seed = floor(random(1, 100000));
  seedInp = createInput(seed + "");
  seedInp.size(160, 32);
  seedInp.style("font-family", "inherit");
  seedInp.style("font-size", "20px");
  seedInp.style("text-align", "center");
  seedInp.changed(() => {
    var s = float(seedInp.value());
    if (!isNaN(s) && !initialized) {
      print("Seed has changed to", s);
      randomSeed(s);
      noiseSeed(s);
      seed = s;
    }
  });
  seedInp.hide();

  // Save Game button (for localStorage)
  saveGameBtn = createButton("SAVE GAME");
  saveGameBtn.size(150, 30);
  saveGameBtn.style("font-family", "inherit");
  saveGameBtn.style("font-size", "18px");
  saveGameBtn.style("cursor", "pointer");
  saveGameBtn.mousePressed(() => {
    print("Save game button clicked");
  });
  saveGameBtn.hide();

  // Load Game button (for localStorage)
  loadGameBtn = createButton("LOAD GAME");
  loadGameBtn.size(150, 30);
  loadGameBtn.style("font-family", "inherit");
  loadGameBtn.style("font-size", "18px");
  loadGameBtn.style("cursor", "pointer");
  loadGameBtn.mousePressed(() => {
    print("Load game button clicked");
  });
  loadGameBtn.hide();
}

function draw() {
  cursor(ARROW);
  switch (mode) {
    case "game":
      drawGame();
      break;

    case "home":
      drawHome();
      break;

    case "settings":
      drawSettings();
      break;

    default:
      break;
  }
}

/**
 * Main game loop, update objects and draw on the canvas
 */
function drawGame() {
  seedInp.hide();
  saveGameBtn.hide();
  loadGameBtn.hide();

  background("skyblue");

  push();

  // Translate coordinates to draw the world (player, blocks and clouds)
  // Blocks are drawn at: player.pos +- width/2, so all the canvas is filled
  cameraX = round(player.pos.x - width / 2);
  cameraY = round(player.pos.y - height / 2);

  // Drawing clouds at the "top" of the screen
  push();
  translate(0, -cameraY);
  for (var c of clouds) {
    c.restart();
    c.show();
  }
  pop();

  // The camera follows the player
  translate(-cameraX, -cameraY);
  drawWorld();

  if (mouseIsPressed && millis() - lastMouseAction >= MOUSE_ACTION_SLEEP_TIME) {
    hand.actions();
    lastMouseAction = millis();
  }

  player.applyForce(gravity);
  player.update();
  player.show();

  hand.update();
  hand.show();

  pop();

  // Inventory
  inventory.show();

  // Drawing FPS
  if (FPScount >= 50) {
    txt = getFrameRate().toFixed(2);
    FPScount = 0;
  }
  FPScount++;
  noStroke();
  fill(0);
  textSize(26);
  text(txt, width - 80, 30);

  // Drawing the custom cursor
  noCursor();
  fill(255);
  circle(mouseX, mouseY, 10);
}

function drawHome() {
  background(0);
  imageMode(CENTER);
  image(logoImg, width / 2, 180, 530, 125);

  playButton.update();
  settingsButton.update();

  seedInp.hide();
  saveGameBtn.hide();
  loadGameBtn.hide();
}

function drawSettings() {
  background(20);

  // Header image
  imageMode(CENTER);
  image(settingsImg, width / 2, 120, 270, 51);

  // Seed section
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(26);

  text("Seed:", width / 2 - 120, 230);
  seedInp.position(width / 2 + 10, 235);
  seedInp.show();

  // Save and Load game buttons
  saveGameBtn.position(width / 2 - 75, 280);
  saveGameBtn.show();

  loadGameBtn.position(width / 2 - 75, 325);
  loadGameBtn.show();

  // Back button
  backButton.setPosition(width / 2, 400);
  backButton.update();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reset ImageButton default positions
  if (playButton && settingsButton && backButton) {
    playButton.setPosition(width / 2, 400);
    settingsButton.setPosition(width / 2, 480);
    backButton.setPosition(width / 2, 400);
  }
}

/**
 * Draw just the blocks near the player
 */
function drawWorld() {
  // Half the number of blocks drawn on each "chunk"
  var halfW = floor(width / BLOCK_W / 2) + EXTRA_BLOCKS;
  var halfH = floor(height / BLOCK_W / 2) + EXTRA_BLOCKS;

  const { i: playerI, j: playerJ } = worldToGrid(player.pos.x, player.pos.y);

  for (var i = -halfW; i < halfW; i++) {
    for (var j = -halfH; j < halfH; j++) {
      var blockI = max(0, min(playerI + i, WORLD_W - 1));
      var blockJ = max(0, min(playerJ + j, WORLD_H - 1));
      blocks[blockI][blockJ].draw();
    }
  }
}

function keyPressed() {
  if (keyCode >= 49 && keyCode <= 54) {
    inventory.selected = keyCode - 49;
  }
  if (keyCode == 72) mode = "home";
}

function mousePressed() {
  if (mode == "game") {
    hand.actions();
  } else if (mode == "home") {
    playButton.click();
    settingsButton.click();
  } else if (mode == "settings") {
    backButton.click();
  }
}

/**
 * Procedurally generates the 2D world
 */
function createWorld() {
  // Initializing the 2D array
  for (var i = 0; i < WORLD_W; i++) {
    blocks[i] = [];
    for (var j = 0; j < WORLD_H; j++) {
      blocks[i][j] = new Block(i * BLOCK_W, j * BLOCK_W);
    }
  }

  // REFACTOR
  var sX = WORLD_W;
  var noiseScl = 0.1;
  for (var i = 0; i < WORLD_W; i++) {
    // Trees
    // 'start': Y coordinate to start creating terrain (dirt)
    const startNoise = noise(i * noiseScl);
    const terrainNoise = 7;
    const start = round(
      map(startNoise, 0, 1, WORLD_H / 2, WORLD_H / 2 + terrainNoise),
    );

    const noise1 = noise((5 + i) * noiseScl * 100);
    if (noise1 >= 0.7) {
      var count = 1;
      // Leaves
      // Tree height goes from 3 to 6 blocks
      for (var tree = round(random(3, 8)); tree >= 2; tree--) {
        blocks[i][start - 1].type = "trunk";
        blocks[i][start - tree].type = "trunk";
        // Number of leaves at each size of the trunk
        var num = min(pow(count, 2), 2);
        for (var leaf = -num; leaf <= num; leaf++) {
          var x = i + leaf;
          if (i + leaf < 0) {
            x = 0;
          }
          if (i + leaf > sX - 1) {
            x = sX - 1;
          }
          blocks[x][start - tree].type = "leaf";
        }
        count++;
      }
    }

    // Dirt
    for (var rnd = start; rnd < WORLD_H; rnd++) {
      blocks[i][rnd].type = "dirt";
    }

    // Stone
    const stoneStartIndex = WORLD_H / 2 + terrainNoise;
    const stoneNoise = 15;
    var n = noise((15 + i) * noiseScl * 2);
    n = round(map(n, 0, 1, stoneStartIndex, stoneStartIndex + stoneNoise));
    // Draw a stone vertical line from 'n' to the bottom
    for (var rnd2 = n; rnd2 < WORLD_H; rnd2++) {
      blocks[i][rnd2].type = "stone";
    }
  }
}
