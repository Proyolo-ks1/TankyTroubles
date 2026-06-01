import { GAME_STATE_KEYS, OVERLAY_STATE_KEYS, getGlobal, GLOBAL_COLOR_KEYS } from './global-state.js';
import { loadMainMenu } from './gamestates/main-menu.js';
import { initializeWorld, ExecuteGameLoop } from './gamestates/running-game.js';
import { renderGameStatistics } from './overlay.js';
import { drawDebugIni, drawDebug } from './debugging/canvas-testing-script.js';
import { globalGameControlsStep } from './global-game-controls.js'
import { preloadImages, rescaleImages, getImage } from "./asset-handler.js";

// RunningGameApi
const gameApi = document.getElementById("game-container").runningGameApi;






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// Streaming to /debugging.html through localStorage


function printArrayDebug(label, value, hue) {
    return `<span style="color:hsl(${hue}, 80%, 60%)">${label}:</span> ${value}`;
}

function generateDebugSubObjectCounts(obj) {
    const keys = Object.keys(obj);
    const step = 360 / keys.length;

    return keys.map((key, i) => {
        const hue = i * step;
        const value = obj[key];

        // if array → show length, otherwise raw value
        const displayValue = Array.isArray(value) ? value.length : value;

        return printArrayDebug(key, displayValue, hue);
    }).join("\n");
}

let lastDebugText = "";

function printDebugGlobals() {
    const globals = getGlobal();
    const entities = getGlobal().entities;
    const totalEntities = Object.values(entities).reduce((sum, arr) => sum + arr.length, 0);
    const debugGlobals = {
        ...globals, // dont forget, some lastFrameCanvas will be added dynamically to globals somehwere.
        entities: totalEntities, // this actually just replaces the entities node from globals
        statsRingBuffers: {
            buffers: "calculateTime, renderTime, fps - shown further down",
            index: globals.statsRingBuffers.index,
            count: globals.statsRingBuffers.count,
        },
    };
    const newJSON = JSON.stringify(debugGlobals, null, 2);

    const statsRingBufferValues = JSON.stringify({
        fps: Array.from(globals.statsRingBuffers.fps),
        calculationDurations: Array.from(globals.statsRingBuffers.calculationDurations),
        renderingDurations: Array.from(globals.statsRingBuffers.renderingDurations),
    }, null, 2)

    const calc = Array.from(globals.statsRingBuffers.calculationDurations);
    const render = Array.from(globals.statsRingBuffers.renderingDurations);
    const fps = Array.from(globals.statsRingBuffers.fps);

    const entityLines = generateDebugSubObjectCounts(globals.entities);

    const newDebugText = `
<pre>
${newJSON}

${entityLines}

<span style="color:orange">fps:</span> ${JSON.stringify(fps)}
<span style="color:cyan">calculationDurations:</span> ${JSON.stringify(calc)}
<span style="color:lime">renderingDurations:</span> ${JSON.stringify(render)}
${statsRingBufferValues}

</pre>
`;

    if (newDebugText !== lastDebugText) {
        const container = document.querySelector("#game-description > :first-child");
        if (container) {
            container.innerHTML =
                `<pre style="text-align:left; font-size:16px; overflow-x:auto;">${newDebugText}</pre>`;
        }
        localStorage.setItem('debugText', newDebugText);
        lastDebugText = newDebugText;
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
getGlobal().showParticles = true;
getGlobal().camera.zoomlevel = 1/8;

// Statistics
let lastTime = performance.now();

// debugging
let lastDebugPrint = 0;
const DEBUG_INTERVAL = 10; // ms

// Just normal stuff i guess?
let realDeltaTime = 0; //ms
let gameDeltaTime = 0; //ms
const gameTime = getGlobal().gameTime






//      |================|
//      |      BOOT      |
//      |================|



async function boot() {
    // time, spawning, score and stuff or something
    await preloadImages();
    initializeWorld();

    //start Game Loop
    requestAnimationFrame(gameLoop);
}






//      |=====================|
//      |      GAME LOOP      |
//      |=====================|



let debugInitialized = false;

function gameLoop(currentTime) {
    const ctx = gameApi.canvasCtx
    const canvasWidth = gameApi.canvasWidth
    const canvasHeight = gameApi.canvasHeight
    getGlobal().canvasScale = canvasWidth;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // underlying line could be deleted due to lastTime always exisiting since declared in ini above.
    // if (!lastTime) lastTime = currentTime;  // Initialize lastTime on the first loop
    realDeltaTime = (currentTime - lastTime) / 1000;  // Time difference in seconds
    
    // Game State Loop
    switch (getGlobal().gameState) {
        case GAME_STATE_KEYS.MAIN_MENU:
            loadMainMenu(ctx);
            break;
            
        case GAME_STATE_KEYS.RUNNING:
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
            if (!debugInitialized ) {
                drawDebugIni();
                debugInitialized = true;
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


// Boot Game
boot();