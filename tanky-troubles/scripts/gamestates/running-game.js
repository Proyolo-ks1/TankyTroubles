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
function renderBackground(ctx, gameWidth, gameHeight) {
    const tileSize = getGlobal().tileSize

    // Loop through the rows and columns to draw the checkerboard pattern
    for (let row = 0; row < Math.ceil(gameHeight / tileSize); row++) {
        for (let col = 0; col < Math.ceil(gameWidth / tileSize); col++) {
            // Determine the color based on the row and column positions
            const color = (row + col) % 2 === 0 ? GLOBAL_COLOR_KEYS.CHECKERBOARD_1 : GLOBAL_COLOR_KEYS.CHECKERBOARD_2;

            // Create pos and size objects to match the new drawRect system
            const pos = { x: col * tileSize, y: row * tileSize };
            const size = { width: tileSize, height: tileSize };

            // Draw the tile using the updated drawRect function
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
        console.log("DB: toggle debugMode");
        getGlobal().debugMode = !getGlobal().debugMode;
    },
    '2': () => {
        console.log("DB: toggle showStatistics");
        getGlobal().showStatistics = !getGlobal().showStatistics;
    },
};

const numberKeyHoldActions = {
    '3': () => {
        console.log("DB: Decrease tank size 1%");
        getGlobal().gameObjects.tanks.forEach(tank => {
            tank.size.length *= 0.99;
            tank.size.width  *= 0.99;
        });
    },
    '4': () => {
        console.log("DB: Inscrease tank size 1%");
        getGlobal().gameObjects.tanks.forEach(tank => {
            tank.size.length *= 1.01;
            tank.size.width  *= 1.01;
        });
    },
    '5': () => {
        console.log("DB: Decrease tileSize 1%");
        getGlobal().tileSize *= 0.99;
    },
    '6': () => {
        console.log("DB: Inscrease tileSize 1%");
        getGlobal().tileSize *= 1.01;
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

// Extract globals references
const gameObjects = getGlobal().gameObjects


export function initializeGame(canvasWidth, canvasHeight) {

    // startGame();


    // Create tanks with position, color, and controls
    const tileSize = getGlobal().tileSize
    const defaultTankLength = tileSize * 2 / 5; // Tiles
    const defaultTankWidth = tileSize / 3 // Tiles
    const defaultTankSize = {length: defaultTankLength, width: defaultTankWidth}
    const defaultTankSpeed = tileSize * 1.6; // Tiles per second
    const defaultTankRotSpeed = 5; // radians per second

    let angleSpawn = Math.random() * Math.PI * 2;
    angleSpawn = 0;
    const posSpawn1 = { x: canvasWidth / 4, y: canvasHeight / 2 }
    new Tank(posSpawn1, angleSpawn, defaultTankSize, defaultTankSpeed, defaultTankRotSpeed, 5, "#ff0000", { up: "e", down: "d", left: "s", right: "f", shoot: "q" });

    angleSpawn = Math.random() * Math.PI * 2;
    angleSpawn = 0;
    const posSpawn2 = { x: canvasWidth - canvasWidth / 4, y: canvasHeight / 2 }
    new Tank(posSpawn2, angleSpawn, defaultTankSize, defaultTankSpeed, defaultTankRotSpeed, 1, "#00ff00", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "m" });
}



export function ExecuteGameLoop(ctx, canvasWidth, canvasHeight, deltaTime) {
    if (!gameApi.isGamePaused) {
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        renderBackground(ctx, canvasWidth, canvasHeight);

        // Update and render tanks and bullets
        const debugActive = getGlobal().debugMode
        
        const bullets = gameObjects.bullets;
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

        const tanks = gameObjects.tanks;
        tanks.forEach(tank => {
            tank.update(deltaTime);
            tank.render(ctx, deltaTime);
            if (debugActive) {
                tank.debugrender(ctx, deltaTime);
            }
        });

        const particles = gameObjects.particles;
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
            updateAndRenderWind(ctx, deltaTime)
        }

        // Debugging
        debuggingStep()
    }
}