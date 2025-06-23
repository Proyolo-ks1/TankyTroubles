import { setGlobalVariable, getGlobalVariable, getAllState } from './global-state.js';
import { loadMainMenu } from './gamestates/main-menu.js';
import { loadRunningGame } from './gamestates/running-game.js';
// import { preloadImages, rescaleImages, getImage } from "./asset-handler.js";






//      |==========================|
//      |      INITIALIZATION      |
//      |==========================|



// Set up the canvas
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Define a Full HD game world (in-game units)
const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

// Resize handler
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Determine the scale factor to fit the game world inside the canvas
    const scale = Math.min(canvas.width / GAME_WIDTH, canvas.height / GAME_HEIGHT)
    setGlobalVariable("canvasScale", scale);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);






//      |=====================|
//      |      GAME LOOP      |
//      |=====================|


const GameState = {
    MAIN_MENU: "MAIN_MENU",
    RUNNING: "RUNNING",
};

const OverlayState = {
    PAUSE_MENU: "PAUSE_MENU",
    SETTINGS: "SETTINGS",
    HELP: "HELP",
    PAUSED: "PAUSED",
    GAME_OVER: "GAME_OVER"
};

let currentGameState = GameState.RUNNING;
let overlayState = OverlayState.PAUSE_MENU;
overlayState = OverlayState.SETTINGS // EDIT
ctx.fillStyle = "#fff";

function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime; // Initialize lastTime on the first loop
    let deltaTime = (currentTime - lastTime) / 1000;  // Time difference in seconds

    switch (currentGameState) {
        case GameState.MAIN_MENU:
            loadMainMenu(ctx);
            break;

        case GameState.RUNNING:
            loadRunningGame(ctx);
            break;
    }
    
    lastTime = currentTime;

    // Simulate low FPS
    const simFPS = 60;
    const frameDelay = 1000 / simFPS;
    requestAnimationFrame(gameLoop);
}

const initialTime = performance.now();
gameLoop(initialTime);