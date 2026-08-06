// 2D array for the blocks, initialized at createWorld()
let blocks = [];
// Inventary object
let inventary;
let items = [];
changedBlocks = [];
let clouds = [];

var player;
// Horizontal velocity and acceleration
var H_vel = 3,
  H_acc = 0;

var blockW = 20; // Block width
var GRAVITY; // Gravity vector
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
var t, tc, p, tr, h, font, invImg, n1, n2;
var title, settingsImg, playImg, settingsImg, playImg;
function preload() {
  t = loadImage("images/Tierra.jpeg");
  tc = loadImage("images/Tierra_Cesped.jpeg");
  p = loadImage("images/Piedra.jpeg");
  tr = loadImage("images/Tronco.jpeg");
  h = loadImage("images/Hoja.png");
  invImg = loadImage("images/Inventary.png");
  n1 = loadImage("images/nube1.png");
  n2 = loadImage("images/nube2.png");
  title = loadImage("images/MY-CRAFT.png");

  font = loadFont("fonts/Pixel.ttf");
}

function setup() {
  var scale = 0.4;
  createCanvas(2560 * scale, 1440 * scale);

  randomSeed(42);
  noiseSeed(42);

  noStroke();
  textFont(font);
  GRAVITY = createVector(0, 30);
  // g = createVector(0, 0);

  // Block coordinates where they start to generate
  stX = 300; // 300
  stY = 50; // 50

  player = new Player((stX / 2) * blockW + 2, -20);

  // Creating the inventary
  inventary = new Inventary(6);

  // Creating the clouds
  for (var j = 0; j < 6; j++) {
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
        handFunction(); // REFACTOR: Can be deleted?
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

  // (i, j) indexes of the player
  var playerI = round((player.pos.x - width / 2) / blockW);
  var playerJ = round((player.pos.y - height / 2) / blockW);

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
  // Number of blocks drawn on each axis
  chunkW = round(width / blockW);
  chunkH = round(height / blockW);
  for (var i = playerI - 1; i < min(stX, 26 + playerI + 1); i++) {
    for (var j = playerJ - 1; j < min(stY, 21 + playerJ + 1); j++) {
      var b = blocks[i][j];
      if (b.type != null) {
        imageMode(CORNER);
        image(b.type, b.x, b.y, blockW, blockW);
      }
    }
  }

  // Contrains player position & draw world limits
  worldLimits();

  player.applyForce(GRAVITY);
  player.update();
  player.show();

  handFunction();

  pop();

  // Inventary
  inventary.draw();

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
    for (var n = 0; n < inventary.length; n++) {
      var name = image2name(inventary.items[n].type);
      game += `${n}${name}${inventary.items[n].count}`;
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
  player.pos.x = constrain(
    player.pos.x,
    blockW * 3,
    stX * blockW - blockW * 3 - player.w,
  );
  player.pos.y = constrain(
    player.pos.y,
    -100,
    stY * blockW - blockW * 3 - player.h,
  );

  var off = blockW * 3;
  stroke(255, 0, 0);
  line(off, -stY * blockW, off, stY * blockW - off); // Left
  line(
    stX * blockW - off,
    -stY * blockW,
    stX * blockW - off,
    stY * blockW - off,
  ); // Right
  line(off, stY * blockW - off, stX * blockW - off, stY * blockW - off); // Bottom
  noStroke();
  var n = width / 2 + 50;
  rectMode(CORNER);
  fill(255, 0, 0, 100);
  rect(off - n, -200, n, stY * blockW - off + 200);
  rect(stX * blockW - off, -200, n, stY * blockW - off + 200);
  rect(-n, stY * blockW - off, stX * blockW, 200);
}

function keyPressed() {
  if (keyCode >= 49 && keyCode <= 54) {
    inventary.selected = keyCode - 49;
  }
  if (keyCode == 72) mode = "home";
}

function mousePressed() {
  if (mouseButton === RIGHT) {
    console.log("hey");
    return false;
  }
  if (mode == "game") {
    let i = handX / blockW,
      j = handY / blockW;
    if (blocks[i][j].type != null) {
      inventary.storeBlock(i, j, blocks[i][j].type);
    } else {
      inventary.placeBlock(i, j, blocks[i][j].type);
    }
  }
} 

/**
 * Adds a 'type' block into the inventary
 * @param {p5.Image} type
 */
function storeBlock(type) {
  
}

function handFunction() {
  // Center position of the player
  plyrPos = createVector(
    player.pos.x + player.w / 2,
    player.pos.y + player.h / 2,
  );
  // Mouse translated position
  var mouse = createVector(mouseX + trX, mouseY + trY);
  // Vector pointing from the player to the mouse
  handPos = p5.Vector.sub(mouse, plyrPos);
  handPos.limit(blockW * 1.5);
  noFill();
  stroke(255);
  strokeWeight(2);
  handX = plyrPos.x + handPos.x - ((plyrPos.x + handPos.x) % blockW);
  handY = plyrPos.y + handPos.y - ((plyrPos.y + handPos.y) % blockW);
  rect(handX, handY, blockW, blockW);

  if (keyCode == LEFT_ARROW) {
    let i = handX / blockW,
      j = handY / blockW;
    if (blocks[i][j].type != null) {
      // Break block and store it on the inventary
      inventary.storeBlock(i, j, blocks[i][j].type);
    } else {
      // Build a block and remove it from the inventary
      inventary.placeBlock(i, j, blocks[i][j].type);
    }
  }
}

function createWorld(sX, sY) {
  for (var i = -sX; i < sX; i++) {
    blocks[i] = [];
    for (var j = -sY; j < sY; j++) {
      blocks[i][j] = {
        x: i * blockW,
        y: j * blockW,
        type: null,
        s: 0,
      };
    }
  }
  var max = sY;
  var noiseScl = 0.1; // soy una caquita
  for (var i = 0; i < sX; i++) {
    var start = noise(i * noiseScl);
    start = round(map(start, 0, 1, 13, 16));

    var noise1 = noise((5 + i) * noiseScl * 100);
    // print(noise1);
    if (noise1 >= 0.7) {
      // 0.6
      var count = 1;
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

    for (var rnd = start; rnd < max; rnd++) {
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
