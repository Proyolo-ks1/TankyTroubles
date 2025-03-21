import { setVariable, getVariable } from './global-state.js';
import { drawRect, drawCircle, drawRegPolygon, drawArrow} from './graphics-utils.js';
import { generateMaze} from './generate-maze.js';






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
    setVariable("canvasScale", scale);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



function drawRoundedRect(x, y, width, height, borderRadius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo(x + width - borderRadius, y);
    ctx.arcTo(x + width, y, x + width, y + borderRadius, borderRadius);
    ctx.lineTo(x + width, y + height - borderRadius);
    ctx.arcTo(x + width, y + height, x + width - borderRadius, y + height, borderRadius);
    ctx.lineTo(x + borderRadius, y + height);
    ctx.arcTo(x, y + height, x, y + height - borderRadius, borderRadius);
    ctx.lineTo(x, y + borderRadius);
    ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
    ctx.closePath();
    ctx.fill();
}






//      |=====================|
//      |      GAME SETUP     |
//      |=====================|



let tanks = [];
let bullets = [];

// Create tanks with position, color, and controls
let angleSpawn = Math.random() * Math.PI * 2;
angleSpawn = 0;
const tank1 = new Tank({ x: WORLD_WIDTH / 4, y: WORLD_HEIGHT / 2 }, angleSpawn, 120, 90, 500, 1, "#ff0000", { up: "e", down: "d", left: "s", right: "f", shoot: "q" });

angleSpawn = Math.random() * Math.PI * 2;
angleSpawn = 0;
const tank2 = new Tank({ x: WORLD_WIDTH - WORLD_WIDTH / 4, y: WORLD_HEIGHT / 2 }, angleSpawn, 120, 90, 500, 1, "#00ff00", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "m" });

// Handle key events
window.addEventListener("keydown", (e) => {
    let handled = false;
    
    tanks.forEach(tank => {
        if (e.key === tank.controls.up) {
            tank.keys.up = true;
            handled = true;
        }
        if (e.key === tank.controls.down) {
            tank.keys.down = true;
            handled = true;
        }
        if (e.key === tank.controls.left) {
            tank.keys.left = true;
            handled = true;
        }
        if (e.key === tank.controls.right) {
            tank.keys.right = true;
            handled = true;
        }
        
        if (e.key === tank.controls.shoot) {
            if (!tank.keys.shoot) {  // To prevent multiple triggers
                tank.keys.shoot = true;
                tank.shootPress();
            }
            handled = true;
        }
    });

    if (handled) e.preventDefault(); // Prevent scrolling only if a movement or shoot key was pressed
});

window.addEventListener("keyup", (e) => {
    tanks.forEach(tank => {
        if (e.key === tank.controls.up) tank.keys.up = false;
        if (e.key === tank.controls.down) tank.keys.down = false;
        if (e.key === tank.controls.left) tank.keys.left = false;
        if (e.key === tank.controls.right) tank.keys.right = false;
        if (e.key === tank.controls.shoot) {
            tank.keys.shoot = false;
            tank.shootRelease();
        }
    });
});






//      |=================================|
//      |      GAME LOOP PREPERATION      |
//      |=================================|



// Settings
let powerUpSpawnPeriod = 1; // seconds 
let powerUpSpawnChance = 1;

// Support Variables
let lastTime = performance.now();
let lastRenderStatisticsTime = performance.now();
let lastPowerUpSpawnTime = 0;
let overlayFps = 0;
let overlayDeltaTime = 0;
let statisticUpdatesPerSecond = 6

let Maze = generateMaze()

function updateStatistics(currentTime, deltaTime) {
    // Calculate FPS with smoothing
    const fps = (overlayFps * 0.8) + (1 / deltaTime * 0.2);

    // Update overlay values only at defined intervals
    if (currentTime - lastRenderStatisticsTime >= 1000 / statisticUpdatesPerSecond) {
        overlayFps = fps;
        overlayDeltaTime = deltaTime;
        lastRenderStatisticsTime = currentTime;
    }

    // Overlay settings
    const padding = 10;
    const width = 300;
    const linesOfText = 3;
    const height = padding + linesOfText * 50;
    const pos = { x: 5, y: 5 };
    const size = { width: width, height: height };
    const borderRadius = 10;

    // Draw overlay background
    drawRect(ctx, pos, size, "rgba(0, 0, 0, 0.5)", null, null, borderRadius);

    // Draw overlay text
    ctx.fillStyle = "#fff"; // White text
    ctx.font = "16px Arial";
    ctx.fillText(`FPS: ${overlayFps.toFixed(0)}`, pos.x + padding, pos.y + 20);
    ctx.fillText(`ΔTime: ${overlayDeltaTime.toFixed(3)}s`, pos.x + padding, pos.y + 40);

    // Display canvasScaler values
    const canvasScale = getVariable("canvasScale");
    ctx.fillText(`Scale: ${canvasScale.toFixed(2)}`, pos.x + padding, pos.y + 60);
}

// Function to render the background theme and maze
function renderBackground() {
    let a = Maze

    const tileSize = a; // Define the size of each square tile

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
    if (timeSinceLastPowerUpCheck >= powerUpSpawnPeriod) {
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






//      |=====================|
//      |      GAME LOOP      |
//      |=====================|



function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime; // Initialize lastTime on the first loop
    const deltaTime = (currentTime - lastTime) / 1000;  // Time difference in seconds

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    renderBackground();

    // Update and render tanks and bullets
    tanks.forEach(tank => {
        tank.update(deltaTime);
        tank.render(ctx);
    });

    bullets.forEach(bullet => {
        bullet.update(deltaTime);
        bullet.render(ctx);
    });

    updateGame(currentTime);
    updateStatistics(currentTime, deltaTime);
    
    lastTime = currentTime;
    requestAnimationFrame(gameLoop);  // Continue the game loop 
}

gameLoop();