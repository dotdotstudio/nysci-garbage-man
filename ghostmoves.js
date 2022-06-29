import { DIRECTIONS, OBJECT_TYPE } from './setup';

// Primitive random movement.
export function randomMovement(position, direction, objectExist) {
  let dir = direction;
  let nextMovePos = position + dir.movement;
  // Create an array from the diretions objects keys
  const keys = Object.keys(DIRECTIONS);

  let iterationCount = 0;
  while (
    objectExist(nextMovePos, OBJECT_TYPE.WALL) ||
    objectExist(nextMovePos, OBJECT_TYPE.GHOST) ||
    objectExist(nextMovePos, OBJECT_TYPE.PACMAN)
  ) {
    if (!objectExist(nextMovePos, OBJECT_TYPE.PACMAN) && iterationCount < 10) {
      // Get a random key from that array
      const key = keys[Math.floor(Math.random() * keys.length)];
      // Set the new direction
      dir = DIRECTIONS[key];
      // Set the next move
      nextMovePos = position + dir.movement;
      iterationCount++;
    } else {
      return { nextMovePos: position, direction: dir };
    }
  }

  return { nextMovePos, direction: dir };
}
