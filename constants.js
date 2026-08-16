// 'true' if debugging is active
const DEBUG = false;

// Canvas dimensions
const CANVAS_W = 2560;
const CANVAS_H = 1440;
const SCALE = 0.4;

// World constants (in number of blocks)
const WORLD_W = DEBUG ? 70 : 200;
const WORLD_H = DEBUG ? 40 : 60;
const BLOCK_W = 30;

// Clouds
const CLOUDS_COUNT = 6;

// Gravity
const GRAVITY_FORCE = 30;

// --- Player variables ---

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

// Hand breaking force
const HAND_BREAK_FORCE = 1.0; //DEBUG ? 1.0 : 0.2;
const HAND_MAX_LEN = BLOCK_W * 2;
