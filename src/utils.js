/**
 * Converts world pixel coordinates (x, y) to 2D grid indices (i, j)
 */
function worldToGrid(x, y) {
  return { i: floor(x / BLOCK_W), j: floor(y / BLOCK_W) };
}

/**
 * Converts 2D grid indices (i, j) to top-left world pixel coordinates (x, y)
 */
function gridToWorld(i, j) {
  return { x: i * BLOCK_W, y: j * BLOCK_W };
}

/**
 * Validates whether a grid position is within world boundaries
 */
function isValidGridPos(i, j) {
  return i >= 0 && i < WORLD_W && j >= 0 && j < WORLD_H;
}
