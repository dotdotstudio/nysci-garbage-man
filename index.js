import {
  DIFFICULTY_LEVEL,
  LEVEL,
  OBJECT_TYPE,
  SPEED_DIVISOR,
  WARNING_TIME,
} from "./setup";
import { randomMovement } from "./vehiclemoves";
// Classes
import GameBoard from "./GameBoard";
import Garbageman from "./Garbageman";
import Vehicle from "./Vehicle";
// Sounds
import soundDot from "./sounds/munch.wav";
import soundGameStart from "./sounds/game_start.wav";
import soundGameOver from "./sounds/death.wav";
// Dom Elements
const landingPage = document.querySelector("#landing-page");
const lastScoreCont = document.querySelector("#last-score");
const hiScoreCont = document.querySelector("#hi-score");
const levelOnePointer = document.querySelector("#level-one-selector");
const levelTwoPointer = document.querySelector("#level-two-selector");
const levelThreePointer = document.querySelector("#level-three-selector");
const gamePage = document.querySelector("#game-page");
const gameGrid = document.querySelector("#game");
const scoreTable = document.querySelector("#score");
const timerDisplay = document.querySelector("#game-timer");
const result = document.querySelector("#result");
const status = document.querySelector("#result-status");
const levelScore = document.querySelector("#level-score");
const levelTime = document.querySelector("#level-time");
const residentComplaints = document.querySelector("#resident-complaints");
const ratSightings = document.querySelector("#rat-sighting");
const crash = document.querySelector("#crash");
const backToMenu = document.querySelector("#back-to-menu");
const nextLevel = document.querySelector("#next-level");

// Game constants
const GLOBAL_SPEED = 120; // ms

landing();

const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);
// Initial setup
let score = 0;
let timer = null;
let gameWin = false;
let gameTime = 0;
let gameTimer;
let levelSelected = 1;

//shows landing page
function landing() {
  document.getElementById("wrapper").style.height = `${window.innerHeight}px`;
  document.getElementById("wrapper").style.width = `${window.innerWidth}px`;

  let lastScore = sessionStorage.getItem("lastScore");
  let hiScore = sessionStorage.getItem("hiScore");
  lastScoreCont.innerHTML = lastScore ?? 0;
  hiScoreCont.innerHTML = hiScore ?? 0;

  landingPage.classList.add("show");
  gamePage.classList.add("hide");

  levelTwoPointer.classList.add("hide");
  levelThreePointer.classList.add("hide");

  document.addEventListener("keydown", handleKeyInput);
}

function handleKeyInput(e) {
  if (e.keyCode === 38) {
    levelSelected--;
  } else if (e.keyCode === 40) {
    levelSelected++;
  } else if (e.keyCode === 13) {
    landingPage.classList.remove("show");
    landingPage.classList.add("hide");
    gamePage.classList.remove("hide");
    gamePage.classList.add("show");

    startGame(levelSelected);
  } else {
    return;
  }

  if (levelSelected < 1) levelSelected = 3;
  if (levelSelected > 3) levelSelected = 1;

  levelOnePointer.classList.remove("show", "hide");
  levelTwoPointer.classList.remove("show", "hide");
  levelThreePointer.classList.remove("show", "hide");

  switch (levelSelected) {
    case 1:
      levelOnePointer.classList.add("show");
      levelTwoPointer.classList.add("hide");
      levelThreePointer.classList.add("hide");
      break;
    case 2:
      levelOnePointer.classList.add("hide");
      levelTwoPointer.classList.add("show");
      levelThreePointer.classList.add("hide");
      break;
    case 3:
      levelOnePointer.classList.add("hide");
      levelTwoPointer.classList.add("hide");
      levelThreePointer.classList.add("show");
      break;
  }
}

// --- AUDIO --- //
function playAudio(audio) {
  const soundEffect = new Audio(audio);
  soundEffect.play();
}

// --- GAME CONTROLLER --- //
function gameOver(garbageman, grid, gameCrash, restart) {
  result.classList.add("show");
  result.classList.remove("hide");
  levelScore.innerHTML = `${score/10} ton`;
  let minutes = Math.floor(gameTime / 60);
  let seconds = gameTime - minutes * 60;
  levelTime.innerHTML = `${minutes} : ${
    seconds < 10 ? `0${seconds}` : seconds
  }`;
  residentComplaints.innerHTML =
    gameTime * (Math.floor(Math.random() * (9 - 3)) + 3);
  ratSightings.innerHTML =
    gameTime * (Math.floor(Math.random() * (17 - 11)) + 11);
  crash.innerHTML = gameCrash;

  //This will reset the game back to the menu
  endOfLevel();

  //This shows buttons that don't work on the arcade set up
  /*if (restart === undefined) {
    if (levelSelected === 3) {
      nextLevel.remove();
    } else {
      nextLevel.innerHTML = "Next Level";
    }
  } else {
    nextLevel.innerHTML = "Try Again";
  }*/

  if (gameCrash === 0) {
    if (gameTime <= 120) {
      status.innerHTML = "Well Done";
    } else if (gameTime > 120) {
      status.innerHTML = "Too Slow";
    }
  } else {
    status.innerHTML = "Bad Luck";
  }
  clearInterval(gameTimer);
  playAudio(soundGameOver);

  document.removeEventListener("keydown", window.garbagemanEventHandler);

  gameBoard.showGameStatus(gameWin);

  clearInterval(timer);

  let lastScore = sessionStorage.getItem("lastScore");
  if (score > lastScore) sessionStorage.setItem("hiScore", score);

  sessionStorage.setItem("lastScore", score);
}

function gameLoop(garbageman, vehicles, difficultyLevel) {
  // 1. Move Garbageman
  gameBoard.moveCharacter(garbageman);

  // 2. Move vehicles
  vehicles.forEach((vehicle) => gameBoard.moveCharacter(vehicle));

  // 3. Check if Garbageman collects a bin
  if (gameBoard.objectExist(garbageman.pos, OBJECT_TYPE.BIN)) {
    playAudio(soundDot);

    gameBoard.removeObject(garbageman.pos, [OBJECT_TYPE.BIN]);
    // Remove a bin
    gameBoard.binCount--;
    // Add Score
    score += 10;
  }

  // 3. Check if all bins have been collected
  if (gameBoard.binCount === 0) {
    gameWin = true;
    gameOver(garbageman, gameGrid, 0);
  }

  // 4. Show new score
  scoreTable.innerHTML = score;

  // 5. Display time elapsed
  timerDisplay.innerHTML = `${Math.floor(gameTime / 60)
    .toString()
    .padStart(2, "0")}: ${(gameTime % 60).toString().padStart(2, "0")}`;
  switch (difficultyLevel) {
    case DIFFICULTY_LEVEL.LEVEL_ONE:
      if (gameTime > WARNING_TIME.LEVEL_ONE) timerDisplay.style.color = "red";
      break;
    case DIFFICULTY_LEVEL.LEVEL_TWO:
      if (gameTime > WARNING_TIME.LEVEL_TWO) timerDisplay.style.color = "red";
      break;

    case DIFFICULTY_LEVEL.LEVEL_THREE:
      if (gameTime > WARNING_TIME.LEVEL_THREE) timerDisplay.style.color = "red";
      break;
  }

  // 6. check if garbageman is completely blocked
  if (gameBoard.isGarbagemanCompletelyBlocked(garbageman))
    gameOver(garbageman, gameGrid, 1, "Try Again");
}

function startGame(difficultyLevel) {
  result.classList.remove("show");
  result.classList.add("hide");
  document.removeEventListener("keydown", handleKeyInput);

  gameTimer = setInterval(() => gameTime++, 1000);
  playAudio(soundGameStart);

  gameWin = false;
  score = 0;

  gameBoard.createGrid(LEVEL, difficultyLevel);

  const garbageman = new Garbageman(2, 287);
  gameBoard.addObject(287, [OBJECT_TYPE.GARBAGEMAN]);

  window.garbagemanEventHandler = (e) =>
    garbageman.handleKeyInput(e, gameBoard.objectExist.bind(gameBoard));
  document.addEventListener("keydown", window.garbagemanEventHandler);

  let vehicles = [
    new Vehicle(5, 207, randomMovement, OBJECT_TYPE.LORRY),
    new Vehicle(4, 228, randomMovement, OBJECT_TYPE.TAXI),
    new Vehicle(3, 249, randomMovement, OBJECT_TYPE.POLICECAR),
    new Vehicle(5, 208, randomMovement, OBJECT_TYPE.LORRY),
    new Vehicle(4, 227, randomMovement, OBJECT_TYPE.TAXI),
    new Vehicle(3, 247, randomMovement, OBJECT_TYPE.POLICECAR),
    new Vehicle(5, 248, randomMovement, OBJECT_TYPE.LORRY),
    new Vehicle(4, 229, randomMovement, OBJECT_TYPE.TAXI),
    new Vehicle(3, 209, randomMovement, OBJECT_TYPE.POLICECAR),
  ];

  vehicles.length = difficultyLevel * 3;
  let speedDivisor;
  switch (difficultyLevel) {
    case DIFFICULTY_LEVEL.LEVEL_ONE:
      speedDivisor = SPEED_DIVISOR.LEVEL_ONE;
      break;
    case DIFFICULTY_LEVEL.LEVEL_TWO:
      speedDivisor = SPEED_DIVISOR.LEVEL_TWO;
      break;
    case DIFFICULTY_LEVEL.LEVEL_THREE:
      speedDivisor = SPEED_DIVISOR.LEVEL_THREE;
      break;
  }

  // Gameloop
  timer = setInterval(
    () => gameLoop(garbageman, vehicles, difficultyLevel),
    GLOBAL_SPEED / speedDivisor
  );
}

backToMenu.addEventListener("click", () => {
  location.reload();
});

nextLevel.addEventListener("click", () => {
  clearInterval(timer);
  clearInterval(gameTimer);
  gameTime = 0;
  timerDisplay.style.color = "white";
  const label = nextLevel.innerHTML;
  if (label === "Next Level") {
    if (levelSelected === 1) {
      startGame(2);
    } else if (levelSelected === 2) {
      startGame(3);
    } else if (levelSelected === 3) {
      startGame(3);
    }
  } else {
    startGame(levelSelected);
  }
});

function endOfLevel() {
  setTimeout(backToMainMenu, 4000);
}

function backToMainMenu() {
  location.reload();
}