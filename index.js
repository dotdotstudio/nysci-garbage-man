import { LEVEL, OBJECT_TYPE } from './setup';
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
const gameGrid = document.querySelector('#game');
const scoreTable = document.querySelector('#score');
const startButton = document.querySelector('#start-button');
const levelSelect = document.querySelector('#level-select');
const timerDisplay = document.querySelector('#game-timer');

// Game constants
const POWER_PILL_TIME = 10000; // ms
const GLOBAL_SPEED = 140; // ms
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);
// Initial setup
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;
let gameTime = 0;
let gameTimer;

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
  // Show startbutton
  startButton.classList.remove('hide');
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
  timerDisplay.innerHTML = `${Math.floor(gameTime/60).toString().padStart(2,'0')}: ${(gameTime%60).toString().padStart(2,'0')}`;
}

function startGame(difficultyLevel) {

  gameTimer = setInterval(() => gameTime++, 1000);
  playAudio(soundGameStart);

  gameWin = false;
  powerPillActive = false;
  score = 0;

  levelSelect.classList.add('hide');

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

// Initialize game
levelSelect.addEventListener('change', (e) => {
  if (e.target.value)
    startGame(e.target.value);
})
