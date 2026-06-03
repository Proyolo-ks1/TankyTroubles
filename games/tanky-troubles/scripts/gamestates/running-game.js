import { getGlobal, GLOBAL_COLOR_KEYS, recordDebugFrame } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawRegPolygon, drawVectorArrow} from '../utils/graphics-utils.js';
import { signedPower } from '../utils/math-utils.js';
import { generateMaze} from '../generate-maze.js';
import { Tank } from '../classes/tank.js';
import { loadMainMenu } from '../gamestates/main-menu.js';
import { spawnAllTestObjects } from '../debugging/spawn-all-objects-static.js';
import { camera } from '../classes/camera.js';

// RunningGameApi
const gameApi = document.getElementById("game-container").runningGameApi;






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// Function to render the background theme and maze
function renderBackground(ctx) {

    const mazeWidth = 16 // tiles
    const mazeHeight = 9 // tiles

    // Loop through the rows and columns to draw the checkerboard pattern
    for (let row = 0; row < Math.ceil(mazeHeight); row++) {
        for (let col = 0; col < Math.ceil(mazeWidth); col++) {
            const color = (row + col) % 2 === 0 ? GLOBAL_COLOR_KEYS.CHECKERBOARD_1 : GLOBAL_COLOR_KEYS.CHECKERBOARD_2;
            const pos = { x: col, y: row };
            const size = { w: 1, h: 1 };

            drawRect(ctx, pos, size, color);
        }
    }
}

// Function to update game events like power-ups
function updateGame(currentTime) {
    // Calculate the time passed since the last power-up spawn check
    const timeSinceLastPowerUpCheck = (currentTime - lastPowerUpSpawnTime) / 1000;  // in seconds
    
    // If enough time has passed, check for spawning a power-up
    if (timeSinceLastPowerUpCheck >= powerUpSpawnCooldown) {
        console.log(`%cPowerup spawn chance (${powerUpSpawnChance * 100}%)`, "color: magenta; font-weight: bold;");
        // Random chance for power-up spawn
        if (Math.random() < powerUpSpawnChance) {
            spawnPowerUp();
        }

        // Update last power-up spawn check time
        lastPowerUpSpawnTime = currentTime;
    }
}

let spawns = 0;
function spawnPowerUp() {
    spawns += 1
    console.log(`%cspawnPowerUp() (${spawns})`, "color: lime; font-weight: bold;");
}

async function startGame() {
    await preloadImages(); // Load images before the game starts
//     rescaleImages(0.5);  // Example scale

//     // Example usage:
//     const missileImage = getImage("projectile", "missile");
//     console.log(missileImage); // Should log the cached scaled image
}

// Clean up inactive objects of an array
function cleanupInactiveEntries(objectArray) {
    for (let i = objectArray.length - 1; i >= 0; i--) {
        if (!objectArray[i].active) objectArray.splice(i, 1);
    }
}

function processEntities(array, ctx, gameDeltaTime, debugActive, timers) {
    array.forEach(entity => {
        let t0 = performance.now();

        entity.update(gameDeltaTime);
        timers.calc += performance.now() - t0;

        t0 = performance.now();
        entity.render(ctx, gameDeltaTime);
        timers.render += performance.now() - t0;

        if (debugActive) {
            t0 = performance.now();
            entity.debugrender(ctx, gameDeltaTime);
            timers.render += performance.now() - t0;
        }
        if (windEnabled) {
            updateWindEffect(entity, gameDeltaTime); // should not move tanks etc, lets see
        }
    });

    // Cleanup inactive entities (every frame single for now)
    cleanupInactiveEntries(array);
}

function updateAndRenderWind(ctx, realDeltaTime) {
    const maxSpeed = 1;       // max wind speed in any direction (tiles per second)
    const dampingFactor = 0.1;  // how strong the wind drifts back to zero
    const randomness = 2;   // max random change per update

    // Add some random noise
    windJerk.x = (Math.random() * 2 - 1 - signedPower(windVel.x, 1.1)) * randomness;
    windJerk.y = (Math.random() * 2 - 1 - signedPower(windVel.y, 1.1)) * randomness;

    windAcc.x += windJerk.x * realDeltaTime;
    windAcc.y += windJerk.y * realDeltaTime;
    
    windAcc.x *= 0.999
    windAcc.y *= 0.999

    windVel.x += windAcc.x * realDeltaTime;
    windVel.y += windAcc.y * realDeltaTime;

    // Drift back to zero (damping)
    windVel.x -= windVel.x * dampingFactor * realDeltaTime;
    windVel.y -= windVel.y * dampingFactor * realDeltaTime;

    // Clamp max speed so it doesn't go wild
    windVel.x = Math.max(-maxSpeed, Math.min(maxSpeed, windVel.x));
    windVel.y = Math.max(-maxSpeed, Math.min(maxSpeed, windVel.y));

    // Draw the Wind indicator vector arrow at position (50, 50)
    const windIndicatorPos = { x: 5, y: 1 };
    drawCircle(ctx, windIndicatorPos, 1, null, "#000", 0.01);
    drawVectorArrow(ctx, windIndicatorPos, { x: windVel.x * 1, y: windVel.y * 1 }, "#ffcc23", 0.05);

    // debugging
    // drawVectorArrow(ctx, { x: 5, y: 1 }, { x: windAcc.x * 5, y: windAcc.y * 5 }, "#b39a48", 0.05);
    // drawVectorArrow(ctx, { x: 5, y: 1 }, { x: windJerk.x * 5, y: windJerk.y * 5 }, "#776835", 0.05);
    // console.log(`wind velocity vector: (${windVel.x},${windVel.y})`);
}

function updateWindEffect(entity, realDeltaTime) {
    const windForceFactor = 1; // strength of wind force (can be tuned)
    const mass = entity.mass || 1; // default to 1 if no mass set

    const dx = windVel.x - entity.vel.x;
    const dy = windVel.y - entity.vel.y;

    // acceleration = force / mass
    const accelX = (dx * windForceFactor) / mass;
    const accelY = (dy * windForceFactor) / mass;

    entity.vel.x += accelX * realDeltaTime;
    entity.vel.y += accelY * realDeltaTime;

    entity.pos.x += entity.vel.x * realDeltaTime;
    entity.pos.y += entity.vel.y * realDeltaTime;
    console.log(`entity: (${entity.shortName}, mass: ${entity.mass})`);
}

// Draw grid
function drawGrid(ctx, canvasWidth, canvasHeight) {
    const gridSize = 1; // 50px grid cells
    const rows = Math.ceil(canvasHeight / zoomLevel);
    const cols = Math.ceil(canvasWidth / zoomLevel);

    ctx.strokeStyle = "#ddd";  // Grid line color
    ctx.lineWidth = 1;

    for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvasHeight);
        ctx.stroke();
    }

    for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvasWidth, i * gridSize);
        ctx.stroke();
    }
}

// Draw corner markers
function drawCorners(ctx, canvasWidth, canvasHeight) {
    const cornerSize = 10;
    ctx.fillStyle = "#ff0000"; // Red

    ctx.fillRect(0, 0, cornerSize, cornerSize);
    ctx.fillRect(canvasWidth - cornerSize, 0, cornerSize, cornerSize);
    ctx.fillRect(0, canvasHeight - cornerSize, cornerSize, cornerSize);
    ctx.fillRect(canvasWidth - cornerSize, canvasHeight - cornerSize, cornerSize, cornerSize);
}

// Draw the game scene
export function drawWindowDebug(ctx, canvasWidth, canvasHeight, realDeltaTime) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);  // Clear
    drawGrid(ctx, canvasWidth, canvasHeight);
    drawCorners(ctx, canvasWidth, canvasHeight);
}

// updateGlobalVariables I guess
function updateGlobalVariables() {
    getGlobal().renderScale = getGlobal().canvasScale * camera.zoomLevel
}






//      |=====================|
//      |      GAME SETUP     |
//      |=====================|



// Settings
let powerUpSpawnCooldown = 1; // seconds 
let powerUpSpawnChance = 1;
let windVel = {x: 0, y: 0};
let windAcc = {x: 0, y: 0};
let windJerk = {x: 0, y: 0};
let windEnabled = false;

const iniDebugging = true;

// Support Variables
let lastPowerUpSpawnTime = 0;

let Maze = generateMaze()

getGlobal().lastFrameCanvas = getGlobal().lastFrameCanvas || document.createElement("canvas");
getGlobal().lastFrameCanvas.width = gameApi.canvasWidth;
getGlobal().lastFrameCanvas.height = gameApi.canvasHeight;
const lastFrameCtx = getGlobal().lastFrameCanvas.getContext("2d");

window.globalSyncConsoleLogStr = "";

// Extract globals references
const entities = getGlobal().entities

export function initializeWorld() {

    // Create 2 tanks with position, color, and controls
    let angleSpawn = Math.random() * Math.PI * 2;
    const posSpawn1 = { x: 1, y: 1 }
    const tank0 = new Tank(posSpawn1, angleSpawn, undefined, undefined, undefined, "#ff0000", { up: "e", down: "d", left: "s", right: "f", shoot: "q" });

    angleSpawn = Math.random() * Math.PI * 2;
    const posSpawn2 = { x: 2, y: 1 }
    const tank1 = new Tank(posSpawn2, angleSpawn, undefined, undefined, undefined, "#00ff00", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "m" });

    // Debugging
    if (iniDebugging) {
        spawnAllTestObjects();

    // Cam
    camera.setTargets([tank0, tank1]);
    // camera.setTargets(getGlobal().entities.tanks);
    }
}






//      |============================|
//      |      RUNNING GAME LOOP     |
//      |============================|



export function ExecuteGameLoop(ctx, gameDeltaTime) {
    window.globalSyncConsoleLogStr = "Global Logging:\n"
    if (!gameApi.isGamePaused) {

        // Camera Translations
        camera.update();
        const g = getGlobal();
        ctx.save();
        // WORLD SPACE (affected by camera)
        ctx.scale(g.renderScale, g.renderScale);
        ctx.translate(
            gameApi.canvasWidth / (2 * g.renderScale) - camera.pos.x,
            gameApi.canvasHeight / (2 * g.renderScale) - camera.pos.y
        );

        renderBackground(ctx);
        updateGlobalVariables();

        // Update and render tanks, bullets, other entities
        const debugActive = getGlobal().debugMode

        const systems = [
            entities.bullets,
            entities.tanks,
            entities.particles,
            entities.utilities
        ];
        const timers = { calc: 0, render: 0 };
        systems.forEach(list =>
            processEntities(list, ctx, gameDeltaTime, debugActive, timers)
        );

        // updateGame(currentTime);

        if (windEnabled) {
            updateAndRenderWind(ctx, gameDeltaTime);
        }

        // After everything is updated and rendered:
        recordDebugFrame(timers.calc, timers.render, 1000 / gameDeltaTime * getGlobal().gameTime.gameSpeed / 1000);

        // Debugging ?
        // drawWindowDebug(ctx, canvasWidth, canvasHeight, realDeltaTime); // ?

        lastFrameCtx.clearRect(0, 0, gameApi.canvasWidth, gameApi.canvasHeight);
        lastFrameCtx.drawImage(ctx.canvas, 0, 0);

        // restore to screen space
        ctx.restore();

    } else {
        // Game is paused → just draw the previous frame
        ctx.drawImage(getGlobal().lastFrameCanvas, 0, 0);
    }
}