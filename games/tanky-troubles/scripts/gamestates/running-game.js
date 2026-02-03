import { getGlobal, GLOBAL_COLOR_KEYS, recordDebugFrame } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawRegPolygon, drawVectorArrow} from '../utils/graphics-utils.js';
import { signedPower } from '../utils/math-utils.js';
import { generateMaze} from '../generate-maze.js';
import { Tank } from '../classes/tank.js';
import { loadMainMenu } from '../gamestates/main-menu.js';

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
            const size = { width: 1, height: 1 };

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

// async function startGame() {
//     await preloadImages(); // Load images before the game starts
//     rescaleImages(0.5);  // Example scale

//     // Example usage:
//     const missileImage = getImage("projectile", "missile");
//     console.log(missileImage); // Should log the cached scaled image
// }

// Function to clean up inactive bullets
function cleanupInactiveBullets(bullets) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (!bullets[i].active) bullets.splice(i, 1);
    }
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

    // Draw the wind vector arrow at position (50, 50)
    drawVectorArrow(ctx, { x: 5, y: 1 }, { x: windVel.x * 5, y: windVel.y * 5 }, "#ffcc23", 0.05);

    // debugging
    // drawVectorArrow(ctx, { x: 5, y: 1 }, { x: windAcc.x * 5, y: windAcc.y * 5 }, "#b39a48", 0.05);
    // drawVectorArrow(ctx, { x: 5, y: 1 }, { x: windJerk.x * 5, y: windJerk.y * 5 }, "#776835", 0.05);
    // console.log(`wind velocity vector: (${windVel.x},${windVel.y})`);
}

function updateWindEffect(bullet, realDeltaTime) {
    const windForceFactor = 1; // strength of wind force (can be tuned)
    const mass = bullet.mass || 1; // default to 1 if no mass set

    const dx = windVel.x - bullet.vel.x;
    const dy = windVel.y - bullet.vel.y;

    // acceleration = force / mass
    const accelX = (dx * windForceFactor) / mass;
    const accelY = (dy * windForceFactor) / mass;

    bullet.vel.x += accelX * realDeltaTime;
    bullet.vel.y += accelY * realDeltaTime;

    bullet.pos.x += bullet.vel.x * realDeltaTime;
    bullet.pos.y += bullet.vel.y * realDeltaTime;
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
    getGlobal().renderScale = getGlobal().canvasScale * getGlobal().zoomLevel
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

export function initializeGame() {

    // startGame();


    // Create tanks with position, color, and controls
    const defaultTankLength = 2 / 5; // Tiles
    const defaultTankWidth = 1 / 3 // Tiles
    const defaultTankSize = {length: defaultTankLength, width: defaultTankWidth}
    const defaultTankSpeed = 1.6; // Tiles per second
    const defaultTankRotSpeed = 5; // radians per second

    let angleSpawn = Math.random() * Math.PI * 2;
    angleSpawn = 0;
    const posSpawn1 = { x: 2, y: 4 }
    new Tank(posSpawn1, angleSpawn, defaultTankSize, defaultTankSpeed, defaultTankRotSpeed, 5, "#ff0000", { up: "e", down: "d", left: "s", right: "f", shoot: "q" });

    angleSpawn = Math.random() * Math.PI * 2;
    angleSpawn = 0;
    const posSpawn2 = { x: 7, y: 2 }
    new Tank(posSpawn2, angleSpawn, defaultTankSize, defaultTankSpeed, defaultTankRotSpeed, 1, "#00ff00", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "m" });
}






//      |============================|
//      |      RUNNING GAME LOOP     |
//      |============================|



export function ExecuteGameLoop(ctx, gameDeltaTime) {
    window.globalSyncConsoleLogStr = "Global Logging:\n"
    if (!gameApi.isGamePaused) {

        renderBackground(ctx);
        updateGlobalVariables();

        let totalTimeForCalculating = 0;
        let totalTimeForRendering = 0;

        // Update and render tanks and bullets
        const debugActive = getGlobal().debugMode
        
        const bullets = entities.bullets;
        bullets.forEach(bullet => {
            let t0 = performance.now()
            bullet.update(gameDeltaTime);
            totalTimeForCalculating += performance.now() - t0

            t0 = performance.now()
            bullet.render(ctx, gameDeltaTime);
            totalTimeForRendering += performance.now() - t0

            if (debugActive) {
                t0 = performance.now()
                bullet.debugrender(ctx, gameDeltaTime);
                totalTimeForRendering += performance.now() - t0
            }
            if (windEnabled) {
                updateWindEffect(bullet, gameDeltaTime);
            }
        });

        const tanks = entities.tanks;
        tanks.forEach(tank => {
            let t0 = performance.now();
            tank.update(gameDeltaTime);
            totalTimeForCalculating += performance.now() - t0;

            t0 = performance.now();
            tank.render(ctx, gameDeltaTime);
            totalTimeForRendering += performance.now() - t0;

            if (debugActive) {
                t0 = performance.now();
                tank.debugrender(ctx, gameDeltaTime);
                totalTimeForRendering += performance.now() - t0;
            }
        });

        const particles = entities.particles;
        particles.forEach(particle => {
            let t0 = performance.now();
            particle.update(gameDeltaTime);
            totalTimeForCalculating += performance.now() - t0;

            t0 = performance.now();
            particle.render(ctx, gameDeltaTime);
            totalTimeForRendering += performance.now() - t0;

            if (debugActive) {
                t0 = performance.now();
                particle.debugrender(ctx, gameDeltaTime);
                totalTimeForRendering += performance.now() - t0;
            }
        });
        
        // Cleanup inactive bullets (every frame (for now?))
        cleanupInactiveBullets(bullets);

        // updateGame(currentTime);

        if (windEnabled) {
            updateAndRenderWind(ctx, gameDeltaTime);
        }

        // After everything is updated and rendered:
        recordDebugFrame(totalTimeForCalculating, totalTimeForRendering, 1000 / gameDeltaTime);

        // Debugging
        // drawWindowDebug(ctx, canvasWidth, canvasHeight, realDeltaTime);

        lastFrameCtx.clearRect(0, 0, gameApi.canvasWidth, gameApi.canvasHeight);
        lastFrameCtx.drawImage(ctx.canvas, 0, 0);

    } else {
        // Game is paused → just draw the previous frame
        ctx.drawImage(getGlobal().lastFrameCanvas, 0, 0);
    }
}