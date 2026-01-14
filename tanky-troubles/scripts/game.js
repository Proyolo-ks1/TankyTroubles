import { GAME_STATES, OVERLAY_STATES, GLOBAL_VARIABLES, setGlobalVariable, getGlobalVariable, getAllGlobals, GLOBAL_COLORS } from './global-state.js';
import { loadMainMenu } from './gamestates/main-menu.js';
import { initializeGame, ExecuteGameLoop } from './gamestates/running-game.js';
import { renderGameStatistics } from './overlay.js';
// import { preloadImages, rescaleImages, getImage } from "./asset-handler.js";

// RunningGameApi
const gameApi = document.getElementById("game-container").runningGameApi;






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// Streaming to /debugging.html through localStorage
function printDebugGlobals() {
    const g = getAllGlobals();
    const DebugGlobals = {
        ...g,
        gameObjects: g.gameObjects.length,
        tanks: g.tanks.length,
        bullets: g.bullets.length,
        particles: g.particles.length,
        gameApi 
    };
    document.querySelector("#game-description > :first-child").innerHTML =
        `<pre style="text-align:left; font-size:16px; overflow-x:auto;">
    ${JSON.stringify(DebugGlobals, null, 2)}
    </pre>`;
    localStorage.setItem('debugGlobals', JSON.stringify(DebugGlobals));
}






//      |==========================|
//      |      INITIALIZATION      |
//      |==========================|



// Game Big Picture
setGlobalVariable(GLOBAL_VARIABLES.GAME_STATE, GAME_STATES.MAIN_MENU);
setGlobalVariable(GLOBAL_VARIABLES.OVERLAY_STATE, OVERLAY_STATES.NONE);
setGlobalVariable(GLOBAL_VARIABLES.DEBUG_MODE, false);
setGlobalVariable(GLOBAL_VARIABLES.SHOW_STATISTICS, false);


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
    switch (getGlobalVariable(GLOBAL_VARIABLES.GAME_STATE)) {
        case GAME_STATES.MAIN_MENU:
            loadMainMenu(ctx, canvasWidth, canvasHeight);
            break;
            
        case GAME_STATES.RUNNING:
            if (!gameInitialized) {
                initializeGame(canvasWidth, canvasHeight);
                gameInitialized = true;
            }
            ExecuteGameLoop(ctx, canvasWidth, canvasHeight, deltaTime);

            break;
    }
    
    // Game Overlay
    switch (getGlobalVariable(GLOBAL_VARIABLES.OVERLAY_STATE)) {
        case OVERLAY_STATES.NONE:
            break;
            
        case OVERLAY_STATES.SETTINGS:
            // Code that implements the settings overlay/menu
        
            // if (!gameInitialized) {
            //     initializeGame(canvasWidth, canvasHeight);
            //     gameInitialized = true;
            // }
            // ExecuteGameLoop(ctx, canvasWidth, canvasHeight, deltaTime);

            break;
    
    }
    if (getGlobalVariable(GLOBAL_VARIABLES.SHOW_STATISTICS)) {
        renderGameStatistics(ctx, currentTime, deltaTime, getGlobalVariable(GLOBAL_VARIABLES.TANKS), getGlobalVariable(GLOBAL_VARIABLES.BULLETS));
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