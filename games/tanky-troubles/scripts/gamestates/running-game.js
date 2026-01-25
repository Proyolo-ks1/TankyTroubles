import { getGlobal, GLOBAL_COLOR_KEYS } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawRegPolygon, drawVectorArrow} from '../graphics-utils.js';
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

function updateAndRenderWind(ctx, deltaTime) {
    const maxSpeed = 2;       // max wind speed in any direction
    const driftFactor = 0.02;  // how strong the wind drifts back to zero
    const randomness = 2;   // max random change per update

    // Add some random noise
    windSpeed.x += (Math.random() * 2 - 1) * randomness * deltaTime;
    windSpeed.y += (Math.random() * 2 - 1) * randomness * deltaTime;

    // Drift back to zero (damping)
    windSpeed.x -= windSpeed.x * driftFactor * deltaTime;
    windSpeed.y -= windSpeed.y * driftFactor * deltaTime;

    // Clamp max speed so it doesn't go wild
    windSpeed.x = Math.max(-maxSpeed, Math.min(maxSpeed, windSpeed.x));
    windSpeed.y = Math.max(-maxSpeed, Math.min(maxSpeed, windSpeed.y));

    // Draw the wind vector arrow at position (50, 50)
    drawVectorArrow(ctx, { x: GAME_WIDTH - 100, y: 100 }, { x: windSpeed.x * 1000, y: windSpeed.y * 1000 }, GLOBAL_COLOR_KEYS.VECTOR_ARROW, 5);
}

function updateWindEffect(bullet, deltaTime) {
    const windForceFactor = 1; // strength of wind force (can be tuned)
    const mass = bullet.mass || 1; // default to 1 if no mass set

    const dx = windSpeed.x - bullet.velocity.x;
    const dy = windSpeed.y - bullet.velocity.y;

    // acceleration = force / mass
    const accelX = (dx * windForceFactor) / mass;
    const accelY = (dy * windForceFactor) / mass;

    bullet.velocity.x += accelX * deltaTime;
    bullet.velocity.y += accelY * deltaTime;

    bullet.pos.x += bullet.velocity.x * deltaTime;
    bullet.pos.y += bullet.velocity.y * deltaTime;
}

const numberKeyPressActions = {
    '1': () => {
        getGlobal().debugMode = !getGlobal().debugMode;
        console.log(`DB: toggled debugMode: ${getGlobal().debugMode}`);
    },
    '2': () => {
        getGlobal().showStatistics = !getGlobal().showStatistics;
        console.log(`DB: toggled showStatistics: ${getGlobal().showStatistics}`);
    },
};

const numberKeyHoldActions = {
    '3': () => {
        getGlobal().entities.tanks.forEach(tank => {
            tank.size.length *= 0.99;
            tank.size.width  *= 0.99;
        });
        console.log("DB: Decreased tank size 1%");
    },
    '4': () => {
        getGlobal().entities.tanks.forEach(tank => {
            tank.size.length *= 1.01;
            tank.size.width  *= 1.01;
        });
        console.log("DB: Inscreased tank size 1%");
    },
    '5': () => {
        getGlobal().zoomLevel *= 0.99;
        console.log(`DB: Decreased zoomLevel by 1%: ${Math.round(getGlobal().zoomLevel*1000) / 10}%`);
    },
    '6': () => {
        getGlobal().zoomLevel *= 1.01;
        console.log(`DB: Increased zoomLevel by 1%: ${Math.round(getGlobal().zoomLevel*1000) / 10}%`);
    },
};

const keyPressedLastFrame = {};

function debuggingStep() {
    for (const key in numberKeyPressActions) {
        const isDown = gameApi.globalKeys[key];
        if (isDown && !keyPressedLastFrame[key]) {
            numberKeyPressActions[key]();
        }
        keyPressedLastFrame[key] = isDown;
    }

    for (const key in numberKeyHoldActions) {
        if (gameApi.globalKeys[key]) {
            numberKeyHoldActions[key]();
        }
    }
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
export function drawWindowDebug(ctx, canvasWidth, canvasHeight, deltaTime) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);  // Clear
    drawGrid(ctx, canvasWidth, canvasHeight);
    drawCorners(ctx, canvasWidth, canvasHeight);
}






//      |=====================|
//      |      GAME SETUP     |
//      |=====================|



// Settings
let powerUpSpawnCooldown = 1; // seconds 
let powerUpSpawnChance = 1;
let windSpeed = {x: 0, y: 0};
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






//      |====================|
//      |      GAME LOOP     |
//      |====================|



export function ExecuteGameLoop(ctx, deltaTime) {
    window.globalSyncConsoleLogStr = "Global Logging:\n"
    if (!gameApi.isGamePaused) {

        renderBackground(ctx);

        // Update and render tanks and bullets
        const debugActive = getGlobal().debugMode
        
        const bullets = entities.bullets;
        bullets.forEach(bullet => {
            bullet.update(deltaTime);
            bullet.render(ctx, deltaTime);
            if (debugActive) {
                bullet.debugrender(ctx, deltaTime);
            }
            if (windEnabled) {
                updateWindEffect(bullet, deltaTime);
            }
        });

        const tanks = entities.tanks;
        tanks.forEach(tank => {
            tank.update(deltaTime);
            tank.render(ctx, deltaTime);
            if (debugActive) {
                tank.debugrender(ctx, deltaTime);
            }
        });

        const particles = entities.particles;
        particles.forEach(particle => {
            particle.update(deltaTime);
            particle.render(ctx, deltaTime);
            if (debugActive) {
                particle.debugrender(ctx, deltaTime);
            }
        });
        
        // Cleanup inactive bullets (every frame (for now?))
        cleanupInactiveBullets(bullets);

        // updateGame(currentTime);

        if (windEnabled) {
            updateAndRenderWind(ctx, deltaTime);
        }

        // Debugging
        debuggingStep();
        if (window.globalSyncConsoleLogStr) {
            console.log(window.globalSyncConsoleLogStr);
        }
        // drawWindowDebug(ctx, canvasWidth, canvasHeight, deltaTime);

        lastFrameCtx.clearRect(0, 0, gameApi.canvasWidth, gameApi.canvasHeight);
        lastFrameCtx.drawImage(ctx.canvas, 0, 0);

    } else {
        // Game is paused → just draw the previous frame
        ctx.drawImage(getGlobal().lastFrameCanvas, 0, 0);
    }
}