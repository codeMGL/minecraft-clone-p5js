// Canvas dimensions
const W = 2560, H = 1440;
const SCALE = 0.4;

// World constants (in number of blocks)
const WORLD_W = 70;
const WORLD_H = 40;
const BLOCK_W = 20;

// Clouds
const CLOUDS_COUNT = 6;

// Player variables
const H_VEL = 5, H_ACC = 5; // 3, 2
const JUMP_VEL = 20; // 10
const PLAYER_W = BLOCK_W * 0.8;
const PLAYER_H = BLOCK_W * 1.6;
const PLAYER_H_SNEAK = BLOCK_W * 0.9;

// Tools breaking force
const HAND_BREAK_FORCE = 1.0; // 0.2