// Imports
// none

// RunningGameApi
const gameApi = document.getElementById("game-container").runningGameApi;






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// none






//      |==========================|
//      |      INITIALIZATION      |
//      |==========================|



// Game Big Picture
time = 0;

// Statistics
let lastTime = performance.now();

// debugging
let lastDebugPrint = 0;
const DEBUG_INTERVAL = 10; // ms

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
    
    requestAnimationFrame(gameLoop);
}

gameLoop(performance.now());