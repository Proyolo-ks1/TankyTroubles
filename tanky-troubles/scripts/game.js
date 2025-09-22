import { GameState, OverlayState, setGlobalVariable, getGlobalVariable, getAllState } from './global-state.js';
import { loadMainMenu } from './gamestates/main-menu.js';
import { initializeGame, loadRunningGame } from './gamestates/running-game.js';
import { renderGameStatistics } from './overlay.js';
// import { preloadImages, rescaleImages, getImage } from "./asset-handler.js";







//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|






//      |==========================|
//      |      INITIALIZATION      |
//      |==========================|



// Set up the canvas (default 720x1080)
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
let canvasWidth = 1080;
let canvasHeight = 720;
ctx.fillStyle = "#fff";

// Game big Picture
setGlobalVariable("currentGameState", GameState.MAIN_MENU);
setGlobalVariable("overlayState", OverlayState.PAUSE_MENU);
let currentGameState;

// Statistics
let lastTime = performance.now();

// Resize handler
function resizeCanvas() {
    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

gameLoop(performance.now());






//      |=====================|
//      |      GAME LOOP      |
//      |=====================|

let gameInitialized = false;

function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime; // Initialize lastTime on the first loop
    let deltaTime = (currentTime - lastTime) / 1000;  // Time difference in seconds

    currentGameState = getGlobalVariable("currentGameState")

    switch (currentGameState) {
        case GameState.MAIN_MENU:
            loadMainMenu(ctx, canvasWidth, canvasHeight);
            break;

        case GameState.RUNNING:
            if (!gameInitialized) {
                initializeGame(canvasWidth, canvasHeight);
                gameInitialized = true;
            }
            loadRunningGame(ctx, canvasWidth, canvasHeight);

            break;
    }
    if (getGlobalVariable("statistics")) {
        renderGameStatistics(ctx, currentTime, deltaTime, getGlobalVariable("tanks"), getGlobalVariable("bullets"));
    }
    lastTime = currentTime;

    // Simulate low FPS
    const simFPS = 60;
    const frameDelay = 1000 / simFPS;
    requestAnimationFrame(gameLoop);
}