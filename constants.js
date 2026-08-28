// 'true' if debugging is active
const DEBUG = false;

// --- WORLD VARIABLES ---

// World constants (in number of blocks)
const WORLD_W = DEBUG ? 70 : 200;
const WORLD_H = DEBUG ? 40 : 60;
const BLOCK_W = 40;
// Number of extra blocks to draw on the edges
const EXTRA_BLOCKS = 2;

// --- PLAYER VARIABLES ---

// Velocity and acceleration
const MAX_SPEED = DEBUG ? 6 : 5;
const MIN_SPEED = DEBUG ? 1.5 : 1;
const ACCELERATION = DEBUG ? 0.8 : 0.5;
const JUMP_VEL = DEBUG ? 18 : 10;
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
const MOUSE_ACTION_SLEEP_TIME = 100;

// --- PHYSICS & OTHER VARIABLES ---

// Clouds
const CLOUDS_COUNT = 6;

// Gravity
const GRAVITY_FORCE = 30;