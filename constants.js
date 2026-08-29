// 'true' if debugging is active
const DEBUG = false;

// --- WORLD VARIABLES ---

// World constants (in number of blocks)
const WORLD_W = DEBUG ? 100 : 2000;
const WORLD_H = DEBUG ? 90 : 500;
const BLOCK_W = 40;
// Number of extra blocks to draw on the edges
const EXTRA_BLOCKS = 2;

// --- PLAYER VARIABLES ---

// Velocity and acceleration
const MAX_SPEED = DEBUG ? 10 : 5;
const MIN_SPEED = DEBUG ? 1.5 : 1;
const ACCELERATION = DEBUG ? 1.0 : 0.5;
const JUMP_VEL = DEBUG ? 20 : 12;
const FRICTION = DEBUG ? 0.1 : 0.2;

// Mass and volume
const PLAYER_MASS = 50;

const PLAYER_W = BLOCK_W * 0.8;
const PLAYER_H = BLOCK_W * 1.6;
const PLAYER_H_SNEAK = BLOCK_W * 0.9;

// --- HAND VARIABLES ---

// Hand breaking force
const HAND_BREAK_FORCE = DEBUG ? 1.0 : 0.2;
const HAND_MAX_LEN = BLOCK_W * 2;

// Time (in milliseconds) that needs to pass until the next mouse action is listened
const MOUSE_ACTION_SLEEP_TIME = DEBUG ? 0 : 100;

// --- PHYSICS & OTHER VARIABLES ---

// Clouds
const CLOUDS_COUNT = 10;

// Gravity
const GRAVITY_FORCE = 30;
