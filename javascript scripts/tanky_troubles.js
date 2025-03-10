// Set up the canvas
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Define a Full HD game world (logical units)
const WORLD_WIDTH = 1920;
const WORLD_HEIGHT = 1080;

// Scale factors
let scale, offsetX, offsetY;

// Resize handler
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Determine the scale factor to fit the game world inside the canvas
    scale = Math.min(canvas.width / WORLD_WIDTH, canvas.height / WORLD_HEIGHT);

    // Center the game world within the canvas
    offsetX = (canvas.width - WORLD_WIDTH * scale) / 2;
    offsetY = (canvas.height - WORLD_HEIGHT * scale) / 2;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Tank class using virtual game world units
class Tank {
    constructor(x, y, color, controls) {
        this.x = x;
        this.y = y;
        this.width = 120;   // Adjusted for 1080p scale
        this.height = 80; // Adjusted for 1080p scale
        this.angle = Math.random() * Math.PI * 2; 
        this.speed = 5;    // Slightly increased speed for larger world
        this.color = color;
        this.controls = controls;
        this.keys = { up: false, down: false, left: false, right: false };
    }

    update() {
        if (this.keys.left) this.angle -= 0.05;
        if (this.keys.right) this.angle += 0.05;

        let rad = this.angle;
        if (this.keys.up) {
            this.x += Math.cos(rad) * this.speed;
            this.y += Math.sin(rad) * this.speed;
        }
        if (this.keys.down) {
            this.x -= Math.cos(rad) * this.speed;
            this.y -= Math.sin(rad) * this.speed;
        }
    }

    draw() {
        ctx.save();

        // Transform to fit the game world into the canvas
        ctx.translate(offsetX + this.x * scale, offsetY + this.y * scale);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;

        // Scale tank size accordingly
        ctx.fillRect(-this.width / 2 * scale, -this.height / 2 * scale, this.width * scale, this.height * scale);

        ctx.restore();
    }
}

// Create tanks in the Full HD virtual world
const tank1 = new Tank(500, 500, "red", { up: "w", down: "s", left: "a", right: "d" });
const tank2 = new Tank(1400, 500, "green", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" });

const tanks = [tank1, tank2];

// Handle key events
window.addEventListener("keydown", (e) => {
    tanks.forEach(tank => {
        if (e.key === tank.controls.up) tank.keys.up = true;
        if (e.key === tank.controls.down) tank.keys.down = true;
        if (e.key === tank.controls.left) tank.keys.left = true;
        if (e.key === tank.controls.right) tank.keys.right = true;
    });
});

window.addEventListener("keyup", (e) => {
    tanks.forEach(tank => {
        if (e.key === tank.controls.up) tank.keys.up = false;
        if (e.key === tank.controls.down) tank.keys.down = false;
        if (e.key === tank.controls.left) tank.keys.left = false;
        if (e.key === tank.controls.right) tank.keys.right = false;
    });
});

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    tanks.forEach(tank => {
        tank.update();
        tank.draw();
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
