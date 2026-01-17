import { GAME_STATE_KEYS, OVERLAY_STATE_KEYS, getGlobal, GLOBAL_COLOR_KEYS } from './global-state.js';
import { loadMainMenu } from './gamestates/main-menu.js';
import { initializeGame, ExecuteGameLoop } from './gamestates/running-game.js';
import { renderGameStatistics } from './overlay.js';
import { drawDebug } from './debugging/canvas-testing-script.js';
// import { preloadImages, rescaleImages, getImage } from "./asset-handler.js";

// RunningGameApi
const gameApi = document.getElementById("game-container").runningGameApi;






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// Streaming to /debugging.html through localStorage
let lastDebugGlobalsJSON = "";

function printDebugGlobals() {
    const g = getGlobal();
    const DebugGlobals = {
        ...g,
        gameObjects: g.gameObjects.length,
        tanks: g.gameObjects.tanks.length,
        bullets: g.gameObjects.bullets.length,
        particles: g.gameObjects.particles.length,
        gameApi 
    };

    const newJSON = JSON.stringify(DebugGlobals, null, 2);

    if (newJSON !== lastDebugGlobalsJSON) {
        document.querySelector("#game-description > :first-child").innerHTML =
            `<pre style="text-align:left; font-size:16px; overflow-x:auto;">${newJSON}</pre>`;
        localStorage.setItem('debugGlobals', newJSON);
        lastDebugGlobalsJSON = newJSON;
    }
}






//      |==========================|
//      |      INITIALIZATION      |
//      |==========================|



// Game Big Picture
getGlobal().gameState = GAME_STATE_KEYS.RUNNING;
getGlobal().overlayState = OVERLAY_STATE_KEYS.NONE;
getGlobal().debugMode = false;
getGlobal().showStatistics = false;



// Statistics
let lastTime = performance.now();






//      |=====================|
//      |      GAME LOOP      |
//      |=====================|



// debugging
let lastDebugPrint = 0;
const DEBUG_INTERVAL = 100; // ms



let gameInitialized = false;

function gameLoop(currentTime) {
    const ctx = gameApi.canvasCtx
    const canvasWidth = gameApi.canvasWidth
    const canvasHeight = gameApi.canvasHeight

    if (!lastTime) lastTime = currentTime;  // Initialize lastTime on the first loop
    let deltaTime = (currentTime - lastTime) / 1000;  // Time difference in seconds
    
    // Game State
    switch (getGlobal().gameState) {
        case GAME_STATE_KEYS.MAIN_MENU:
            loadMainMenu(ctx, canvasWidth, canvasHeight);
            break;
            
        case GAME_STATE_KEYS.RUNNING:
            if (!gameInitialized) {
                initializeGame(canvasWidth, canvasHeight);
                gameInitialized = true;
            }
            ExecuteGameLoop(ctx, canvasWidth, canvasHeight, deltaTime);

            break;
            
        case GAME_STATE_KEYS.WINDOW_DEBUGGING:
            drawDebug();
            break;
    }
    
    // Game Overlay
    switch (getGlobal().overlayState) {
        case OVERLAY_STATE_KEYS.NONE:
            break;
            
        case OVERLAY_STATE_KEYS.SETTINGS:
            // Code that implements the settings overlay/menu
        
            // if (!gameInitialized) {
            //     initializeGame(canvasWidth, canvasHeight);
            //     gameInitialized = true;
            // }
            // ExecuteGameLoop(ctx, canvasWidth, canvasHeight, deltaTime);

            break;
    
    }
    if (getGlobal().showStatistics) {
        renderGameStatistics(ctx, currentTime, deltaTime);
    }
    lastTime = currentTime;

    // Debugging every 500 ms
    if (currentTime - lastDebugPrint >= DEBUG_INTERVAL) {
        printDebugGlobals();
        lastDebugPrint = currentTime;
    }

    // Simulate low FPS
    const simFPS = 60;
    const frameDelay = 1000 / simFPS;
    requestAnimationFrame(gameLoop);
}

gameLoop(performance.now());