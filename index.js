import { DIFFICULTY_LEVEL, LEVEL, OBJECT_TYPE } from './setup';
import { randomMovement } from './ghostmoves';
// Classes
import GameBoard from './GameBoard';
import Pacman from './Pacman';
import Ghost from './Ghost';
// Sounds
import soundDot from './sounds/munch.wav';
import soundPill from './sounds/pill.wav';
import soundGameStart from './sounds/game_start.wav';
import soundGameOver from './sounds/death.wav';
import soundGhost from './sounds/eat_ghost.wav';
// Dom Elements
const landingPage = document.querySelector('#landing-page');
const levelOnePointer = document.querySelector('#level-one-selector');
const levelTwoPointer = document.querySelector('#level-two-selector');
const levelThreePointer = document.querySelector('#level-three-selector');
const gamePage = document.querySelector('#game-page');
const gameGrid = document.querySelector('#game');
const scoreTable = document.querySelector('#score');
const timerDisplay = document.querySelector('#game-timer');

// Game constants
const POWER_PILL_TIME = 10000; // ms
const GLOBAL_SPEED = 120; // ms

landing()

const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);
// Initial setup
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;
let gameTime = 0;
let gameTimer;
let levelSelected = 1;


//shows landing page
function landing() {

  landingPage.classList.add('show');
  gamePage.classList.add('hide');

  levelTwoPointer.classList.add('hide');
  levelThreePointer.classList.add('hide');

  document.addEventListener('keydown', e => handleKeyInput(e));
}

const handleKeyInput = (e) => {

  if (e.keyCode === 38) {
    levelSelected--
  } else if (e.keyCode === 40) {
    levelSelected++
  } else if (e.keyCode === 13) {
    // document.removeEventListener('keydown', (e) =>
    //   handleKeyInput(e)
    // );
    landingPage.classList.remove('show');
    landingPage.classList.add('hide');
    gamePage.classList.remove('hide');
    gamePage.classList.add('show');

    startGame(levelSelected);
  } else {
    return;
  }

  if (levelSelected < 1)
    levelSelected = 3
  if (levelSelected > 3)
    levelSelected = 1

  levelOnePointer.classList.remove('show', 'hide');
  levelTwoPointer.classList.remove('show', 'hide');
  levelThreePointer.classList.remove('show', 'hide');

  switch (levelSelected) {
    case 1:
      levelOnePointer.classList.add('show');
      levelTwoPointer.classList.add('hide');
      levelThreePointer.classList.add('hide');
      break;
    case 2:
      levelOnePointer.classList.add('hide');
      levelTwoPointer.classList.add('show');
      levelThreePointer.classList.add('hide');
      break;
    case 3:
      levelOnePointer.classList.add('hide');
      levelTwoPointer.classList.add('hide');
      levelThreePointer.classList.add('show');
      break;
  }
};

// --- AUDIO --- //
function playAudio(audio) {
  const soundEffect = new Audio(audio);
  soundEffect.play();
}

// --- GAME CONTROLLER --- //
function gameOver(pacman, grid) {
  clearInterval(gameTimer);
  playAudio(soundGameOver);

  document.removeEventListener('keydown', (e) =>
    pacman.handleKeyInput(e, gameBoard.objectExist.bind(gameBoard))
  );

  gameBoard.showGameStatus(gameWin);

  clearInterval(timer);

  setTimeout(() => location.reload(), 5000);
}

function checkCollision(pacman, ghosts) {
  const collidedGhost = ghosts.find((ghost) => pacman.pos === ghost.pos);

  if (collidedGhost) {
    if (pacman.powerPill) {
      playAudio(soundGhost);
      gameBoard.removeObject(collidedGhost.pos, [
        OBJECT_TYPE.GHOST,
        OBJECT_TYPE.SCARED,
        collidedGhost.name
      ]);
      collidedGhost.pos = collidedGhost.startPos;
      score += 100;
    } else {
      gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
      gameBoard.rotateDiv(pacman.pos, 0);
      gameOver(pacman, gameGrid);
    }
  }
}

function gameLoop(pacman, ghosts) {
  // 1. Move Pacman
  gameBoard.moveCharacter(pacman);

  // 2. Check Ghost collision on the old positions
  // checkCollision(pacman, ghosts);

  // 3. Move ghosts
  ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));

  // 4. Do a new ghost collision check on the new positions
  // checkCollision(pacman, ghosts);

  // 5. Check if Pacman eats a dot
  if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)) {
    playAudio(soundDot);

    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.DOT]);
    // Remove a dot
    gameBoard.dotCount--;
    // Add Score
    score += 10;
  }

  // 6. Check if Pacman eats a power pill
  if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)) {
    playAudio(soundPill);

    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PILL]);

    pacman.powerPill = true;
    score += 50;

    clearTimeout(powerPillTimer);
    powerPillTimer = setTimeout(
      () => (pacman.powerPill = false),
      POWER_PILL_TIME
    );
  }

  // 7. Change ghost scare mode depending on powerpill
  if (pacman.powerPill !== powerPillActive) {
    powerPillActive = pacman.powerPill;
    ghosts.forEach((ghost) => (ghost.isScared = pacman.powerPill));
  }

  // 8. Check if all dots have been eaten
  if (gameBoard.dotCount === 0) {
    gameWin = true;
    gameOver(pacman, gameGrid);
  }

  // 9. Show new score
  scoreTable.innerHTML = score;

  //10. Display time elapsed
  timerDisplay.innerHTML = `${Math.floor(gameTime / 60).toString().padStart(2, '0')}: ${(gameTime % 60).toString().padStart(2, '0')}`;

  //11. check if garbageman is completely blocked
  if (gameBoard.isPacmanCompletelyBlocked(pacman))
    gameOver(pacman, gameGrid);
}

function startGame(difficultyLevel) {

  document.removeEventListener('keydown', e => handleKeyInput(e));

  gameTimer = setInterval(() => gameTime++, 1000);
  playAudio(soundGameStart);

  gameWin = false;
  powerPillActive = false;
  score = 0;

  gameBoard.createGrid(LEVEL, difficultyLevel);

  const pacman = new Pacman(2, 287);
  gameBoard.addObject(287, [OBJECT_TYPE.PACMAN]);
  document.addEventListener('keydown', (e) =>
    pacman.handleKeyInput(e, gameBoard.objectExist.bind(gameBoard))
  );


  let ghosts = [
    new Ghost(5, 207, randomMovement, OBJECT_TYPE.BLINKY),
    new Ghost(4, 228, randomMovement, OBJECT_TYPE.PINKY),
    new Ghost(3, 249, randomMovement, OBJECT_TYPE.INKY),
    new Ghost(5, 208, randomMovement, OBJECT_TYPE.BLINKY),
    new Ghost(4, 227, randomMovement, OBJECT_TYPE.PINKY),
    new Ghost(3, 247, randomMovement, OBJECT_TYPE.INKY),
    new Ghost(5, 248, randomMovement, OBJECT_TYPE.BLINKY),
    new Ghost(4, 229, randomMovement, OBJECT_TYPE.PINKY),
    new Ghost(3, 209, randomMovement, OBJECT_TYPE.INKY)
  ];

  ghosts.length = difficultyLevel * 3;

  // Gameloop
  timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED / difficultyLevel);
}
