import { GRID_SIZE, CELL_SIZE, OBJECT_TYPE, CLASS_LIST, DIFFICULTY_LEVEL } from './setup';

class GameBoard {
  constructor(DOMGrid) {
    this.binCount = 0;
    this.grid = [];
    this.DOMGrid = DOMGrid;
  }

  showGameStatus(gameWin) {
    // Create and show game win or game over
    const div = document.createElement('div');
    div.classList.add('game-status');
    div.innerHTML = `${gameWin ? 'WIN!' : 'GAME OVER!'}`;
    this.DOMGrid.appendChild(div);
  }

  createGrid(level, difficultyLevel) {
    this.binCount = 0;
    this.grid = [];
    this.DOMGrid.innerHTML = '';
    // First set correct amount of columns based on Grid Size and Cell Size
    this.DOMGrid.style.cssText = `grid-template-columns: repeat(${GRID_SIZE}, ${CELL_SIZE}px);`;

    const indexOfBin = CLASS_LIST.indexOf(OBJECT_TYPE.BIN);
    const indexOfBlank = CLASS_LIST.indexOf(OBJECT_TYPE.BLANK);

    let originalBinCount = 0;
    level.forEach((square) => {
      if (square === indexOfBin) {
        if (!difficultyLevel) {
          square = indexOfBlank
        } else {
          switch (difficultyLevel) {
            case DIFFICULTY_LEVEL.LEVEL_ONE:
              if (originalBinCount % 3 !== 0)
                square = indexOfBlank
              break;
            case DIFFICULTY_LEVEL.LEVEL_TWO:
              if (originalBinCount % 2 !== 0)
                square = indexOfBlank
              break;
            case DIFFICULTY_LEVEL.LEVEL_THREE:
              square = indexOfBin
              break;
          }
          originalBinCount++;
        }
      }

      const div = document.createElement('div');
      div.classList.add('square', CLASS_LIST[square]);
      div.style.cssText = `width: ${CELL_SIZE}px; height: ${CELL_SIZE}px;`;
      this.DOMGrid.appendChild(div);
      this.grid.push(div);

      // Add bins
      if (CLASS_LIST[square] === OBJECT_TYPE.BIN) this.binCount++;
    });
  }

  addObject(pos, classes) {
    this.grid[pos].classList.add(...classes);
  }

  removeObject(pos, classes) {
    this.grid[pos].classList.remove(...classes);
  }
  // Can have an arrow function here cause of this binding
  objectExist(pos, object) {
    return this.grid[pos].classList.contains(object);
  };

  rotateDiv(pos, deg) {
    this.grid[pos].style.transform = `rotate(${deg}deg)`;
  }

  moveCharacter(character) {
    if (character.shouldMove()) {
      const { nextMovePos, direction } = character.getNextMove(
        this.objectExist.bind(this)
      );

      const { classesToRemove, classesToAdd } = character.makeMove();

      if (character.rotation && nextMovePos !== character.pos) {
        // Rotate
        this.rotateDiv(nextMovePos, direction.rotation);
        // Rotate the previous div back
        this.rotateDiv(character.pos, 0);
      }

      this.removeObject(character.pos, classesToRemove);
      this.addObject(nextMovePos, classesToAdd);

      character.setNewPos(nextMovePos, direction);
    }
  }

  isGarbagemanCompletelyBlocked(garbageman) {
    return garbageman.isGarbagemanCompletelyBlocked(this.objectExist.bind(this));
  }

  static createGameBoard(DOMGrid, level) {
    const board = new this(DOMGrid);
    board.createGrid(level);
    return board;
  }
}

export default GameBoard;
