// 2D array for the blocks, initialized at createWorld()
let blocks = [];
// Inventory object
let inventory;
let items = [];
let changedBlocks = [];
let clouds = [];

var player;

var gravity; // Gravity vector
// Hand global variables and player's center position
var handPos, handX, handY, plyrPos;
var initialized = false;

// Start and translate variables
var stX, stY, trX, trY;
var txt = "",
  FPScount = 0;

// Game variables
var mode = "home",
  saveGame,
  seedInp,
  loadGame;
var seed;

// Image variables
var t, tc, p, tr, h, font, n1, n2;
var title, settingsImg, playImg, settingsImg, playImg;
function preload() {
  t = loadImage("images/Tierra.jpeg");
  tc = loadImage("images/Tierra_Cesped.jpeg");
  p = loadImage("images/Piedra.jpeg");
  tr = loadImage("images/Tronco.jpeg");
  h = loadImage("images/Hoja.png");
  n1 = loadImage("images/nube1.png");
  n2 = loadImage("images/nube2.png");
  title = loadImage("images/MY-CRAFT.png");

  font = loadFont("fonts/Pixel.ttf");
}

function setup() {
  const canvas = createCanvas(W * SCALE, H * SCALE);

  randomSeed(42);
  noiseSeed(42);

  // Disable right-click context menu inside the canvas
  canvas.elt.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  noStroke();
  textFont(font);
  gravity = createVector(0, GRAVITY_FORCE);

  // Block indexes where they start to generate the world
  stX = 300; // 300
  stY = 50; // 50

  // stX = random(20, WORLD_W * BLOCK_W);
  // stX = round((WORLD_W * BLOCK_W) / 2);
  stX = width / 2;

  player = new Player(stX, -20);

  // Creating the inventory
  inventory = new Inventory(6);

  // Creating the clouds
  for (var j = 0; j < CLOUDS_COUNT; j++) {
    var img = n1;
    if (random(1) > 0.5) {
      img = n2;
    }
    clouds[j] = new Cloud(
      img,
      random(20, width + 100),
      random(170, 230),
      random(-1, -0.2),
    );
  }

  // DOM elements
  playImg = select("#playB");
  playImg
    .position(width / 2, 180)
    .hide()
    .mouseOver(() => {
      playImg.size(149 * 1.1, 51 * 1.1);
    })
    .mouseOut(() => {
      playImg.size(149, 51);
    })
    .mousePressed(() => {
      mode = "game";
      playImg.hide();
      settingsImg.hide();
      if (!initialized) {
        // Initialize game
        createWorld(stX, stY);
        drawHand(); // REFACTOR: Can be deleted?
        initialized = true;
      }
    });
  settingsImg = select("#settingsB");
  settingsImg
    .position(width / 2, 240)
    .hide()
    .mouseOver(() => {
      if (mode != "settings") {
        settingsImg.size(270 * 1.1, 51 * 1.1);
      }
    })
    .mouseOut(() => {
      if (mode != "settings") {
        settingsImg.size(270, 51);
      }
    })
    .mousePressed(() => {
      settingsImg.size(270 * 0.9, 51 * 0.9);
      playImg.hide();
      mode = "settings";
    });
  playImg.show();
  settingsImg.show();

  saveGame = select("#game");
  saveGame.center(LEFT, TOP);
  seedInp = createInput(random(20) + "");
  seedInp.changed(() => {
    var s = float(seed.value());
    if (!isNaN(s) && !initialized) {
      print("Seed has changed to", s);
      randomSeed(s);
      noiseSeed(s);
      seed = s;
    }
  });
  loadGame = createInput();
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

    case "settingss":
      drawSettings();
      break;

    default:
      break;
  }
}

function drawGame() {
  background("skyblue");

  push();

  // (i, j) indexes of the player minus the center of the world
  // It's used to as the starting coordinates of the world
  // They start at (playerI - trX, playerJ - trY)
  var playerI = round(player.pos.x / BLOCK_W);
  var playerJ = round(player.pos.y / BLOCK_W);

  // Translate coordinates to draw blocks
  // Blocks are drawn at: player.pos +- width/2, so all the canvas is filled
  trX = round(player.pos.x - width / 2);
  trY = round(player.pos.y - height / 2);

  // Drawing clouds at the "top" of the screen
  push();
  translate(0, -trY);
  for (var c of clouds) {
    c.restart();
    c.show();
  }
  pop();

  translate(-trX, -trY);
  // Extra blocks at both sides, so the screen is fully drawn
  var extraBlocks = 1;
  // Number of blocks drawn on each axis
  chunkW = round(width / BLOCK_W) + extraBlocks;
  chunkH = round(height / BLOCK_W) + extraBlocks;

  // for (var i = playerI - 1; i < min(stX, 26 + playerI + 1); i++) {
  //   for (var j = playerJ - 1; j < min(stY, 21 + playerJ + 1); j++) {
  for (var i = 0; i < blocks.length; i++) {
    for (var j = 0; j < blocks[i].length; j++) {
      // print("player", playerI, playerJ);
      // print(playerI + i, playerJ + j);
      // var b = blocks[playerI + i][playerJ + j];
      blocks[i][j].draw();

    }
  }

  // Contrains player position & draw world limits
  worldLimits();

  player.applyForce(gravity);
  player.update();
  player.show(); 

  drawHand();

  pop();

  // Inventory
  inventory.draw();

  // Drawing FPS
  if (FPScount >= 50) {
    txt = getFrameRate().toFixed(2);
    FPScount = 0;
  }
  FPScount++;
  noStroke();
  fill(0);
  textSize(22);
  text(txt, width - 60, 20);

  // Drawing the custom cursor
  noCursor();
  fill(255);
  circle(mouseX, mouseY, 8);
}

function drawHome() {
  background(0);
  imageMode(CENTER);
  image(title, width / 2, 65, 530 / 1.2, 125 / 1.2);
  playImg.show();
  settingsImg.position(width / 2, 240).show();
  loadGame.hide();
  saveGame.hide();
  seedInp.hide();
}

function drawSettings() {
  // REFACTOR
  background(0);
  settingsImg.position(width / 2, 30);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Seed:", 220, 98);
  seedInp.position(360, 100).show();
  if (initialized) {
    seedInp.html("2"); // ?????
    var px = round(player.pos.x);
    var py = round(player.pos.y);
    var game = `x${stX}y${stY}s${seed}x${px}y${py}
`;
    for (var i = 0; i < changedBlocks.length; i++) {
      var block = changedBlocks[i];
      var type = image2name(block.actualType);
      print(type, block.actualType);
      game += `i${block.i}j${block.j}t${type}`;
    }
    game += `inv
`;
    for (var n = 0; n < inventory.length; n++) {
      var name = image2name(inventory.items[n].type);
      game += `${n}${name}${inventory.items[n].count}`;
    }
    seed = float(seedInp.value());
    saveGame.html(game);
  }
  text("Load game:", 180, 153);
  loadGame.position(360, 158).show();
  text("Save game:", 180, 208);
  saveGame.position(270, 203).show();
  text("HOME", 456, 250);
  if (
    mouseX > 415 &&
    mouseX < 495 &&
    mouseY > 238 &&
    mouseY < 268 &&
    mouseIsPressed
  ) {
    mode = "home"; // REFACTOR
  }
}

function image2name(img) {
  if (img == t) {
    return "t";
  } else if (img == tr) {
    return "tr";
  } else if (img == h) {
    return "h";
  } else if (img == p) {
    return "p";
  } else if (img == null) {
    return "n";
  }
  return "00";
}

/**
 * Constrains the player's position and draws the World's red line limits
 */
function worldLimits() {
  var off = BLOCK_W * 3;
  player.pos.x = constrain(
    player.pos.x,
    off,
    (WORLD_W - 3) * BLOCK_W - player.w,
  );
  player.pos.y = constrain(
    player.pos.y,
    -100,
    (WORLD_H - 3) * BLOCK_W - player.h,
  );

  stroke(255, 0, 0);
  // Left border
  line(off, -WORLD_H * BLOCK_W, off, WORLD_H * BLOCK_W - off);
  // Right border
  line(
    WORLD_W * BLOCK_W - off,
    -WORLD_H * BLOCK_W,
    WORLD_W * BLOCK_W - off,
    WORLD_H * BLOCK_W - off,
  );
  // Bottom border
  line(
    off,
    WORLD_H * BLOCK_W - off,
    WORLD_W * BLOCK_W - off,
    WORLD_H * BLOCK_W - off,
  );
  noStroke();
  var n = width / 2 + 50;
  rectMode(CORNER);
  fill(255, 0, 0, 100);
  rect(off - n, -200, n, WORLD_H * BLOCK_W - off + 200);
  rect(WORLD_W * BLOCK_W - off, -200, n, WORLD_H * BLOCK_W - off + 200);
  rect(-n, WORLD_H * BLOCK_W - off, WORLD_W * BLOCK_W, 200);
}

function keyPressed() {
  if (keyCode >= 49 && keyCode <= 54) {
    inventory.selected = keyCode - 49;
  }
  if (keyCode == 72) mode = "home";
}

function mousePressed(e) {
  if (mode == "game") {
    let i = handX / BLOCK_W;
    let j = handY / BLOCK_W;

    // If the mouse is inside the canvas
    if (i > 0 && i < WORLD_W * BLOCK_W && j > 0 && i < WORLD_H * BLOCK_W) {
      if (blocks[i][j].type != null && mouseButton == LEFT) {
        player.breakBlock(i, j);
      }
      if (blocks[i][j].type == null && mouseButton == RIGHT) {
        inventory.placeBlock(i, j);
        player.preventOverlap(blocks[i][j]);
      }
    }
  }
}

function drawHand() {
  // Center position of the player
  plyrPos = createVector(
    player.pos.x + player.w / 2,
    player.pos.y + player.h / 2,
  );
  // Mouse translated position
  var mouse = createVector(mouseX + trX, mouseY + trY);
  // Vector pointing from the player to the mouse
  handPos = p5.Vector.sub(mouse, plyrPos);
  handPos.limit(HAND_MAX_LEN);
  noFill();
  stroke(255);
  strokeWeight(2);
  handX = plyrPos.x + handPos.x - ((plyrPos.x + handPos.x) % BLOCK_W);
  handY = plyrPos.y + handPos.y - ((plyrPos.y + handPos.y) % BLOCK_W);
  rect(handX, handY, BLOCK_W, BLOCK_W);
}

/**
 * Procedurally generates the world from -sX to +sX and -sY to +sY
 */
function createWorld() {
  // Initializing the 2D array
  for (var i = 0; i < WORLD_W; i++) {
    blocks[i] = [];
    for (var j = 0; j < WORLD_H; j++) {
      blocks[i][j] = new Block(i * BLOCK_W, j*BLOCK_W);
    }
  }

  // Trees
  // REFACTOR
  var max = WORLD_H;
  var sX = WORLD_W;
  var noiseScl = 0.1;
  for (var i = 0; i < WORLD_W; i++) {
    var start = noise(i * noiseScl);
    start = round(map(start, 0, 1, 13, 16));

    var noise1 = noise((5 + i) * noiseScl * 100);
    if (noise1 >= 0.7) {
      var count = 1;
      // Leaves
      for (var tree = round(random(3, 6)); tree >= 2; tree--) {
        blocks[i][start - 1].type = tr; // Tronco
        blocks[i][start - tree].type = tr; // Tronco
        var num = min(pow(count, 2), 2);
        for (var leaf = 0 - num; leaf <= num; leaf++) {
          var x = i + leaf;
          if (i + leaf < 0) {
            x = 0;
          }
          if (i + leaf > sX - 1) {
            x = sX - 1;
          }
          blocks[x][start - tree].type = h;
        }
        count++;
      }
    }

    // Dirt and stone
    for (var rnd = start; rnd < WORLD_H; rnd++) {
      blocks[i][rnd].type = t; // Tierra
    }
    var n = noise(i * noiseScl);
    var s = round(random(16, 20));
    n = round(map(n, 0, 1, s, s + 8));
    for (var rnd2 = n; rnd2 < max; rnd2++) {
      blocks[i][rnd2].type = p; // Piedra
    }
  }
}
