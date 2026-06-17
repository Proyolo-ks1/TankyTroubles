import { getGlobal, GLOBAL_COLOR_KEYS, recordDebugFrame, flushSpawnQueue } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawRegPolygon, drawVectorArrow} from '../utils/graphics-utils.js';
import { signedPower, Vec2 } from '../utils/math-utils.js';
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

// Clean up inactive objects of an array (non-splice edition :D)
function cleanupInactiveEntries(arr) {
    let write = 0;
    for (let read = 0; read < arr.length; read++) {
        if (arr[read].active) {
            arr[write++] = arr[read];
        }
    }
    arr.length = write;
}

function processEntities(ctx, gameDeltaTime, debugActive, timers) {
    // console.log(`processEntities() at frame ${getGlobal().frameCount}`);
    // console.log(`BulletArray (${getGlobal().entities.bullets.length-0}): ${getGlobal().entities.bullets.slice(0, 20).map(b => b.shortName).join(", ")}`);

    const systems = [
        entities.bullets,
        entities.tanks,
        entities.particles,
        entities.utilities
    ];
    
    systems.forEach(array =>
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

        })
    );

    // Iterate Spawn Queue
    flushSpawnQueue();

    // Cleanup inactive entities (every frame single for now)
    for (const array of systems) {
        cleanupInactiveEntries(array);
    }
}

function updateAndRenderWind(ctx, gameDeltaTime) {
    const maxSpeed = 1;       // max wind speed in any direction (tiles per second)
    const dampingFactor = 0.1;  // how strong the wind drifts back to zero
    const randomness = 2;   // max random change per update

    // Add some random noise
    windJerk.x = (Math.random() * 2 - 1 - signedPower(windVel.x, 1.1)) * randomness;
    windJerk.y = (Math.random() * 2 - 1 - signedPower(windVel.y, 1.1)) * randomness;

    windAcc.x += windJerk.x * gameDeltaTime;
    windAcc.y += windJerk.y * gameDeltaTime;
    
    windAcc.x *= 0.999
    windAcc.y *= 0.999

    windVel.x += windAcc.x * gameDeltaTime;
    windVel.y += windAcc.y * gameDeltaTime;

    // Drift back to zero (damping)
    windVel.x -= windVel.x * dampingFactor * gameDeltaTime;
    windVel.y -= windVel.y * dampingFactor * gameDeltaTime;

    // Clamp max speed so it doesn't go wild
    windVel.x = Math.max(-maxSpeed, Math.min(maxSpeed, windVel.x));
    windVel.y = Math.max(-maxSpeed, Math.min(maxSpeed, windVel.y));

    // Draw the Wind indicator vector arrow at position (50, 50)
    const windIndicatorPos = new Vec2(5, 1);
    drawCircle(ctx, windIndicatorPos, 1, null, "#000", 0.01);
    drawVectorArrow(ctx, windIndicatorPos, { x: windVel.x * 1, y: windVel.y * 1 }, "#ffcc23", 0.05);

    // debugging
    // drawVectorArrow(ctx, new Vec2(5, 1), { x: windAcc.x * 5, y: windAcc.y * 5 }, "#b39a48", 0.05);
    // drawVectorArrow(ctx, new Vec2(5, 1), { x: windJerk.x * 5, y: windJerk.y * 5 }, "#776835", 0.05);
    // console.log(`wind velocity vector: (${windVel.x},${windVel.y})`);
}

function updateWindEffect(entity, gameDeltaTime) {
    const windForceFactor = 1; // strength of wind force (can be tuned)
    const mass = entity.mass || 1; // default to 1 if no mass set

    const dx = windVel.x - entity.vel.x;
    const dy = windVel.y - entity.vel.y;

    // acceleration = force / mass
    const accelX = (dx * windForceFactor) / mass;
    const accelY = (dy * windForceFactor) / mass;

    entity.vel.x += accelX * gameDeltaTime;
    entity.vel.y += accelY * gameDeltaTime;

    entity.pos.x += entity.vel.x * gameDeltaTime;
    entity.pos.y += entity.vel.y * gameDeltaTime;
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
export function drawWindowDebug(ctx, canvasWidth, canvasHeight, gameDeltaTime) {
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
let windVel = new Vec2();
let windAcc = new Vec2();
let windJerk = new Vec2();

// Boolean Default = false
let windEnabled = false;
let iniDebugging = false;

// Boolean Overwrite = true
// windEnabled = true;
iniDebugging = true;

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
    const posSpawn1 = new Vec2(1, 1)
    const tank0 = new Tank(posSpawn1, angleSpawn, undefined, undefined, undefined, "#ff0000", { up: "e", down: "d", left: "s", right: "f", shoot: "q" });

    angleSpawn = Math.random() * Math.PI * 2;
    const posSpawn2 = new Vec2(2, 1)
    const tank1 = new Tank(posSpawn2, angleSpawn, undefined, undefined, undefined, "#00ff00", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "m" });

    // Debugging
    if (iniDebugging) {
        spawnAllTestObjects();
    }

    // Cam
    let targets = [tank0, tank1]
    // targets.push(...getGlobal().entities.tanks)
    camera.setTargets(targets);
    // camera.setTargets([getGlobal().entities.particles[1]])
    camera.pos.set(1.5,1.5);
    camera.zoomLevel = 1/8;;
    // camera.setTargets([getGlobal().entities.bullets[3], tank0]) // nuclear rocket
    camera.padding = 1;
    camera.zoomMax = 0.5;
    camera.doTrackPosition = true;
    camera.doTrackZoom = true;
}






//      |============================|
//      |      RUNNING GAME LOOP     |
//      |============================|



export function ExecuteGameLoop(ctx, gameDeltaTime) {
    window.globalSyncConsoleLogStr = "Global Logging:\n"
    if (!gameApi.isGamePaused) {
        
        //debugging
        const timers = { calc: 0, render: 0 };
        const debugActive = getGlobal().debugOverlays.show

        // Camera Translations
        camera.update(gameDeltaTime);

        const g = getGlobal();
        const canvasWidth = gameApi.canvasWidth;
        const canvasHeight = gameApi.canvasHeight;
        ctx.save();

        // WORLD SPACE (affected by camera) (this is where we invert Y-axis)
        ctx.translate(canvasWidth / 2, canvasHeight / 2);
        ctx.scale(g.renderScale, -g.renderScale);
        ctx.rotate(camera.angle);
        ctx.translate(-camera.pos.x, -camera.pos.y);

        renderBackground(ctx);
        updateGlobalVariables();

        // Update and render tanks, bullets, other entities
        processEntities(ctx, gameDeltaTime, debugActive, timers)

        // updateGame(currentTime);

        if (windEnabled) {
            updateAndRenderWind(ctx, gameDeltaTime);
        }

        // After everything is updated and rendered:
        recordDebugFrame(timers.calc, timers.render, 1000 / gameDeltaTime * getGlobal().gameTime.gameSpeed / 1000);

        // Debugging ?
        // drawWindowDebug(ctx, canvasWidth, canvasHeight, gameDeltaTime); // ?
        if (debugActive && getGlobal().debugOverlays.camera) {
            const t0 = performance.now();
            camera.debugrender(ctx, gameDeltaTime, canvasWidth, canvasHeight);
            timers.render += performance.now() - t0;
        }

        lastFrameCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        lastFrameCtx.drawImage(ctx.canvas, 0, 0);

        // restore to screen space
        ctx.restore();

    } else {
        // Game is paused → just draw the previous frame
        ctx.drawImage(getGlobal().lastFrameCanvas, 0, 0);
    }
}