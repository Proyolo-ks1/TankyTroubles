import { GAME_STATE_KEYS, OVERLAY_STATE_KEYS, getGlobal, GLOBAL_COLOR_KEYS } from './global-state.js';
import { loadMainMenu } from './gamestates/main-menu.js';
import { initializeGame, ExecuteGameLoop } from './gamestates/running-game.js';
import { renderGameStatistics } from './overlay.js';
import { drawDebugIni, drawDebug } from './debugging/canvas-testing-script.js';
import { globalGameControlsStep } from './global-game-controls.js'
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
    const e = getGlobal().entities;
    const totalEntities = e.tanks.length + e.bullets.length + e.particles.length;
    const debugGlobals = {
        ...g,
        entities: totalEntities,
        statsRingBuffers: {
            buffers: "calculateTime, renderTime, fps",
            index: g.statsRingBuffers.index,
            count: g.statsRingBuffers.count,
        },
        tanks: g.entities.tanks.length,
        bullets: g.entities.bullets.length,
        particles: g.entities.particles.length,
        gameApi 
    };

    const newJSON = JSON.stringify(debugGlobals, null, 2);

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
getGlobal().debugMode = true;
getGlobal().showStatistics = true;

// Statistics
let lastTime = performance.now();

// debugging
let lastDebugPrint = 0;
const DEBUG_INTERVAL = 100; // ms

// Just normal stuff i guess?
let realDeltaTime = 0;
let gameDeltaTime = 0;
const gameTime = getGlobal().gameTime






//      |=====================|
//      |      GAME LOOP      |
//      |=====================|



let gameInitialized = false;

function gameLoop(currentTime) {
    const ctx = gameApi.canvasCtx
    const canvasWidth = gameApi.canvasWidth
    const canvasHeight = gameApi.canvasHeight
    getGlobal().canvasScale = canvasWidth;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    if (!lastTime) lastTime = currentTime;  // Initialize lastTime on the first loop
    realDeltaTime = (currentTime - lastTime) / 1000;  // Time difference in seconds
    
    // Game State
    switch (getGlobal().gameState) {
        case GAME_STATE_KEYS.MAIN_MENU:
            loadMainMenu(ctx);
            break;
            
        case GAME_STATE_KEYS.RUNNING:
            if (!gameInitialized) {
                initializeGame();
                gameInitialized = true;
            }
            if (gameTime.paused) {
                if (gameTime.stepOnce) {
                    gameDeltaTime = gameTime.maxDelta;
                    gameTime.stepOnce = false; // consume step
                } else {
                    gameDeltaTime = 0;
                }
            } else {
                gameDeltaTime = realDeltaTime * gameTime.gameSpeed;
            }
            ExecuteGameLoop(ctx, gameDeltaTime);

            break;
            
        case GAME_STATE_KEYS.WINDOW_DEBUGGING:
            if (!gameInitialized) {
                drawDebugIni();
                gameInitialized = true;
            }
            drawDebug();
            break;
    }
    
    // Game Overlay
    switch (getGlobal().overlayState) {
        case OVERLAY_STATE_KEYS.NONE:
            break;
            
        case OVERLAY_STATE_KEYS.SETTINGS:
            // Code that implements the settings overlay/menu

            break;
    
    }
    if (getGlobal().showStatistics) {
        renderGameStatistics(ctx, currentTime, realDeltaTime);
    }
    lastTime = currentTime;

    globalGameControlsStep(realDeltaTime);
    if (window.globalSyncConsoleLogStr) {
        // console.log(window.globalSyncConsoleLogStr);
    }

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