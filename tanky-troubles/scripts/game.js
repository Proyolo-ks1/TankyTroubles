import { setGlobalVariable, getGlobalVariable, getAllState } from './global-state.js';
import { drawRect, drawCircle, drawText, drawRegPolygon, drawVectorArrow} from './graphics-utils.js';
import { generateMaze} from './generate-maze.js';
import { Tank } from './classes/tank.js';
// import { preloadImages, rescaleImages, getImage } from "./asset-handler.js";






//      |==========================|
//      |      INITIALIZATION      |
//      |==========================|



// Set up the canvas
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Define a Full HD game world (logical units)
const WORLD_WIDTH = 1920;
const WORLD_HEIGHT = 1080;

// Resize handler
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Determine the scale factor to fit the game world inside the canvas
    const scale = Math.min(canvas.width / WORLD_WIDTH, canvas.height / WORLD_HEIGHT)
    setGlobalVariable("canvasScale", scale);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



function renderOverlay(currentTime, deltaTime, tanks, bullets) {
    // Calculate FPS with smoothing
    const fps = (overlayFps * 0.8) + (1 / deltaTime * 0.2);

    // Update overlay values only at defined intervals
    if (currentTime - lastRenderStatisticsTime >= 1000 / statisticUpdatesPerSecond) {
        overlayFps = fps;
        overlayDeltaTime = deltaTime;
        lastRenderStatisticsTime = currentTime;
    }

    const canvasScale = getGlobalVariable("canvasScale");

    // Background
    let pos = { x: 5 / canvasScale, y: 5 / canvasScale };
    const padding = 10 / canvasScale;
    const textSpacing = 2 / canvasScale;
    const align = "left";
    const baseline = "top";
    const fontSize = 16 / canvasScale;
    const font = "Consolas";
    const textColor = "#fff";
    const outlineColor = "#000";
    const outlineWidth = 2;
    const linesOfText = 5;
    const backgroundWidth = 150 / canvasScale + 2 * padding;
    const backgroundHeight = linesOfText * fontSize + (linesOfText - 1) * textSpacing + 2 * padding;
    const size = { width: backgroundWidth, height: backgroundHeight };
    const borderRadius = padding;

    drawRect(ctx, pos, size, "rgba(0, 0, 0, 0.5)", null, null, borderRadius);

    // Overlay text
    pos = { x: pos.x + padding, y: pos.y + padding };

    drawText(ctx, `FPS:     ${Math.round(overlayFps)}`, { x: pos.x, y: pos.y }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);
    drawText(ctx, `ΔTime:   ${Math.round(overlayDeltaTime * 1000)}ms`, { x: pos.x, y: pos.y + 1 * fontSize + 1 * textSpacing }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);
    drawText(ctx, `Scale:   ${canvasScale.toFixed(2)}`, { x: pos.x, y: pos.y + 2 * fontSize + 2 * textSpacing }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);
    drawText(ctx, `Tanks:   ${tanks.length}`, { x: pos.x, y: pos.y + 3 * fontSize + 3 * textSpacing }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);
    drawText(ctx, `Bullets: ${bullets.length}`, { x: pos.x, y: pos.y + 4 * fontSize + 4 * textSpacing }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);

    // Toggle Button for debugMode
    const buttonWidth = 150 / canvasScale;
    const buttonHeight = 30 / canvasScale;
    const buttonPos = { x: pos.x, y: pos.y + 5 * fontSize + 5 * textSpacing + padding };  // Position button below the overlay

    // Draw the button
    drawRect(ctx, buttonPos, { width: buttonWidth, height: buttonHeight }, "rgba(0, 0, 0, 0.7)", "white", 2, 5);

    // Button text (showing current state of debugMode)
    const debugText = getGlobalVariable("debugMode") ? "Debug: ON" : "Debug: OFF";
    drawText(ctx, debugText, { x: buttonPos.x + buttonWidth / 2, y: buttonPos.y + buttonHeight / 2 }, "center", "middle", fontSize, font, "white", "black", 2);
}

// Function to render the background theme and maze
function renderBackground() {
    const tileSize = getGlobalVariable("tileSize");

    // Loop through the rows and columns to draw the checkerboard pattern
    for (let row = 0; row < Math.ceil(WORLD_HEIGHT / tileSize); row++) {
        for (let col = 0; col < Math.ceil(WORLD_WIDTH / tileSize); col++) {
            // Determine the color based on the row and column positions
            const color = (row + col) % 2 === 0 ? "#E6E6E6" : "#D6D6D6";

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
    if (bullets.length === 0) return; // Exit early if empty

    let originalLength = bullets.length;
    let i = 0;
    while (i < bullets.length) {
        if (!bullets[i].active) {
            bullets.splice(i, 1); // Remove inactive bullet
        } else {
            i++; // Only increment if bullet is active
        }
    }

    // Only update global variable if the bullet list actually changed
    if (bullets.length !== originalLength) {
        setGlobalVariable("bullets", bullets);
    }
}






//      |=====================|
//      |      GAME SETUP     |
//      |=====================|



// Settings
let powerUpSpawnCooldown = 1; // seconds 
let powerUpSpawnChance = 1;

// Support Variables
let lastTime = performance.now();
let lastRenderStatisticsTime = performance.now();
let lastPowerUpSpawnTime = 0;
let overlayFps = 0;
let overlayDeltaTime = 0;
let statisticUpdatesPerSecond = 10

let Maze = generateMaze()

// startGame();



// Global keys object - make it accessible from script.js
window.globalKeys = {};

// Add event listeners for keydown and keyup
window.addEventListener("keydown", (e) => {
    // Only process key events if the game canvas is focused
    if (!window.isGameFocused) return;

    const blockedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "]; // List of keys to block
    if (blockedKeys.includes(e.key)) {
        e.preventDefault(); // Prevent default for these keys
    }
    globalKeys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    // Only process key events if the game canvas is focused
    if (!window.isGameFocused) return;

    globalKeys[e.key] = false;
});

// Create tanks with position, color, and controls
const tileSize = getGlobalVariable("tileSize");
const defaultTankLength = tileSize * 2 / 5; // Tiles
const defaultTankWidth = tileSize / 3 // Tiles
const defaultTankSize = {length: defaultTankLength, width: defaultTankWidth}
const defaultTankSpeed = tileSize * 1.6; // Tiles per second
const defaultTankRotSpeed = 5; // radians per second

let angleSpawn = Math.random() * Math.PI * 2;
angleSpawn = 0;
const posSpawn1 = { x: WORLD_WIDTH / 4, y: WORLD_HEIGHT / 2 }
new Tank(posSpawn1, angleSpawn, defaultTankSize, defaultTankSpeed, defaultTankRotSpeed, 10, "#ff0000", { up: "e", down: "d", left: "s", right: "f", shoot: "q" }, globalKeys);

angleSpawn = Math.random() * Math.PI * 2;
angleSpawn = 0;
const posSpawn2 = { x: WORLD_WIDTH - WORLD_WIDTH / 4, y: WORLD_HEIGHT / 2 }
new Tank(posSpawn2, angleSpawn, defaultTankSize, defaultTankSpeed, defaultTankRotSpeed, 1, "#00ff00", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "m" }, globalKeys);






//      |=====================|
//      |      GAME LOOP      |
//      |=====================|



function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime; // Initialize lastTime on the first loop
    const deltaTime = (currentTime - lastTime) / 1000;  // Time difference in seconds

    if (!window.isGamePaused) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        renderBackground();

        // Update and render tanks and bullets
        const bullets = getGlobalVariable("bullets") || [];
        bullets.forEach(bullet => {
            bullet.update(deltaTime);
            bullet.render(ctx);
            if (getGlobalVariable("debugMode")) {
                bullet.debugRender(ctx);
            }
        });

        const tanks = getGlobalVariable("tanks") || [];
        tanks.forEach(tank => {
            tank.update(deltaTime);
            tank.render(ctx);
            if (getGlobalVariable("debugMode")) {
                tank.debugRender(ctx);
            }
        });
        
        // Cleanup inactive bullets (every frame)
        cleanupInactiveBullets(bullets);

        // updateGame(currentTime);
        renderOverlay(currentTime, deltaTime, tanks, bullets);
    }
    
    lastTime = currentTime;

    // Simulate low FPS
    const simFPS = 60;
    const frameDelay = 1000 / simFPS;
    requestAnimationFrame(gameLoop);
}

const initialTime = performance.now();
gameLoop(initialTime);