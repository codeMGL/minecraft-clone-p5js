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
var title, settingsImg, playImg;
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
  const canvas = createCanvas(CANVAS_W * SCALE, CANVAS_H * SCALE);

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
    .position(width / 2, 270)
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
        createWorld();
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

    case "settings":
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
  drawWorld();

  if (mouseIsPressed) {
    mouseActions();
  }

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
  var scl = 0.8;
  image(title, width / 2, 120, 530 / scl, 125 / scl);
  playImg.show();
  settingsImg.position(width / 2, 350).show();
  loadGame.hide();
  saveGame.hide();
  seedInp.hide();
}

function drawSettings() {
  // REFACTOR
  background(0);
  settingsImg.position(width / 2, 50);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Seed:", 420, 98);
  seedInp.position(560, 100).show();
  if (initialized) {
    seedInp.html("42");
    var px = round(player.pos.x);
    var py = round(player.pos.y);
    var game = `x${stX}y${stY}s${seed}x${px}y${py}
`;
    for (var i = 0; i < changedBlocks.length; i++) {
      var block = changedBlocks[i];
      var type = image2name(block.actualType);
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
  text("Load game:", 380, 153);
  loadGame.position(560, 158).show();
  text("Save game:", 380, 208);
  saveGame.position(500, 190).show();
  textAlign(CENTER, CENTER);
  text("CLICK 'H' TO GO HOME", width / 2, 300);
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
 * Draw just the blocks near the player. Draw world limit lines near the edges
 */
function drawWorld() {
  // Half the number of blocks drawn on each "chunk"
  var halfW = floor(CANVAS_W / BLOCK_W / 2);
  var halfH = floor(CANVAS_H / BLOCK_W / 2);

  var playerI = max(0, floor(player.pos.x / BLOCK_W));
  var playerJ = max(0, floor(player.pos.y / BLOCK_W));
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
    mouseActions();
  }
}

function mouseActions() {
  let i = handX / BLOCK_W;
  let j = handY / BLOCK_W;

  // If the mouse is inside the canvas
  if (i > 0 && i < WORLD_W * BLOCK_W && j > 0 && i < WORLD_H * BLOCK_W) {
    if (!blocks[i][j].isEmpty && mouseButton == LEFT) {
      player.breakBlock(i, j);
    }
    if (blocks[i][j].isEmpty && mouseButton == RIGHT) {
      inventory.placeBlock(i, j);
    }
  }
}

function drawHand() {
  // Center position of the player
  plyrPos = createVector(
    player.pos.x + player.w / 2,
    player.pos.y - player.h / 2,
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
  var max = WORLD_H;
  var sX = WORLD_W;
  var noiseScl = 0.1;
  for (var i = 0; i < WORLD_W; i++) {
    // Trees
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

    // Dirt
    for (var rnd = start; rnd < WORLD_H; rnd++) {
      blocks[i][rnd].type = t; // Tierra
    }

    // Stone
    var n = noise(i * noiseScl);
    var s = round(random(16, 20));
    n = round(map(n, 0, 1, s, s + 8));
    for (var rnd2 = n; rnd2 < max; rnd2++) {
      blocks[i][rnd2].type = p; // Piedra
    }
  }
}
