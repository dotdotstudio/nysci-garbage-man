import { OBJECT_TYPE, DIRECTIONS } from './setup';

class Garbageman {
  constructor(speed, startPos) {
    this.pos = startPos;
    this.speed = speed;
    this.dir = null;
    this.timer = 0;
    this.rotation = true;
  }

  shouldMove() {
    // Don't move before a key is pressed
    if (!this.dir) return;

    if (this.timer === this.speed) {
      this.timer = 0;
      return true;
    }
    this.timer++;
  }

  getNextMove(objectExist) {
    let nextMovePos = this.pos + this.dir.movement;
    // Do we collide with a wall?
    if (
      objectExist(nextMovePos, OBJECT_TYPE.WALL) ||
      objectExist(nextMovePos, OBJECT_TYPE.VEHICLELAIR) ||
      objectExist(nextMovePos, OBJECT_TYPE.VEHICLE)
    ) {
      nextMovePos = this.pos;
    }

    return { nextMovePos, direction: this.dir };
  }

  makeMove() {
    const classesToRemove = [OBJECT_TYPE.GARBAGEMAN];
    const classesToAdd = [OBJECT_TYPE.GARBAGEMAN];

    return { classesToRemove, classesToAdd };
  }

  setNewPos(nextMovePos) {
    this.pos = nextMovePos;
  }

  handleKeyInput = (e, objectExist) => {
    let dir;

    if (e.keyCode >= 37 && e.keyCode <= 40) {
      dir = DIRECTIONS[e.key];
    } else {
      return;
    }

    const nextMovePos = this.pos + dir.movement;
    if (objectExist(nextMovePos, OBJECT_TYPE.WALL)) return;
    this.dir = dir;
  };

  isGarbagemanCompletelyBlocked(objectExist) {
    let dirKeys = Object.keys(DIRECTIONS);
    let isCompletelyBlocked = dirKeys.every(key => {
      let dir = DIRECTIONS[key];
      const correspondingPos = this.pos + dir.movement;
      if (objectExist(correspondingPos, OBJECT_TYPE.WALL) ||
        objectExist(correspondingPos, OBJECT_TYPE.VEHICLE) ||
        objectExist(correspondingPos, OBJECT_TYPE.VEHICLELAIR)) return true;
      else return false;
    })
    return isCompletelyBlocked;
  }
}

export default Garbageman;
