import { setCanvasScale, getCanvasScale } from './global-state.js';
import { drawRect, drawCircle, drawRegPolygon} from './graphics-utils.js';






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
    setCanvasScale(scale);
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






//      |===================|
//      |      CLASSES      |
//      |===================|



class Shooter {
    static shooterCount = 0;

    constructor() {
        this.bullets = [];  // Each shooter tracks its own bullets
        this.id = Shooter.shooterCount++;  // Assign a unique ID to each tank
    }

    spawnRelativeBullet(BulletClass, relX = 0, relY = 0, relAngle = 0, speed = null, scale = 1) {
        // Dynamically get the class name of the current shooter
        const shooterType = this.constructor.name;
        const shooterId = this.id !== undefined ? this.id : 'N/A';

        console.log(`%c${shooterType} ${shooterId}: spawnRelativeBullet(BulletClass = ${BulletClass.name}, relX = ${relX}, relY = ${relY}, relAngle = ${relAngle}, speed = ${speed}, scale = ${scale}`, "color: green;");

        let absX = this.x + Math.cos(this.angle) * relX - Math.sin(this.angle) * relY;
        let absY = this.y + Math.sin(this.angle) * relX + Math.cos(this.angle) * relY;
        let absAngle = this.angle + relAngle;

        console.log(`%c${shooterType} ${shooterId}: new BulletClass(absX = ${absX}, absY = ${absY}, absAngle = ${absAngle}, speed = ${speed}, scale = ${scale}`, "color: green;");
        let bullet = new BulletClass(absX, absY, absAngle, this, speed, scale);
        this.bullets.push(bullet);
    }
}

class Tank extends Shooter {
    static tankCount = 0;

    constructor(x = 0, y = 0, angle = 0, length = 120, width = length * 0.75, speed = 5, turningSpeed = 1, color = "#555", controls = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "m" }) {
        super();
        
        this.id = Tank.tankCount++;  // Assign a unique ID to each tank
        this.x = x;
        this.y = y;
        this.angle = angle
        this.length = length;
        this.width = width;
        this.speed = speed;
        this.turningSpeed = turningSpeed
        this.color = color;
        this.controls = controls;
        this.keys = { up: false, down: false, left: false, right: false };
        this.weaponClass = NoPowerUp;
        this.weapon = new NoPowerUp(this); // Default weapon
        this.maxBullets = 5;       // Only applies to "default" powerup
        this.ammo = -1;            // -1 means infinite "default" ammo
        this.health = 1;
    }
    
    shootPress() {
        console.log(`%cTank ${this.id} - Shoot Button pressed`, "color: aqua; font-weight: bold;");
        this.weapon.press();
    }

    shootHold() {
        console.log(`%cTank ${this.id} - Shoot Button held`, "color: aqua; font-weight: bold;");
        this.weapon.hold();
    }
    
    shootRelease() {
        console.log(`%cTank ${this.id} - Shoot Button released`, "color: aqua; font-weight: bold;");
        this.weapon.release();
    }
    
    applyPowerUp(PowerUpClass) {
        console.log(`%cTank ${this.id} - PowerUp applied: ${PowerUpClass.name}`, "color: aqua; font-weight: bold;");
        this.weapon = new PowerUpClass(this);
    }
    
    update() {
        // Shoot Held down
        if (this.keys.shoot) {
            this.shootHold();
        }

        // Turning
        if (!(this.keys.left && this.keys.right)) {
            if (this.keys.left) this.angle -= this.turningSpeed / 60;
            if (this.keys.right) this.angle +=  this.turningSpeed / 60;
        }

        // Driving
        let rad = this.angle;
        if (!(this.keys.up && this.keys.down)) {
            if (this.keys.up) {
                this.x += Math.cos(rad) * this.speed;
                this.y += Math.sin(rad) * this.speed;
            }
            if (this.keys.down) {
                this.x -= Math.cos(rad) * this.speed;
                this.y -= Math.sin(rad) * this.speed;
            }
        }
    }

    // render tank
    render() {
        ctx.save();
    
        // Transform to fit the game world into the canvas and have local tank coordinates and rotation
        const canvasScale = getCanvasScale();
        ctx.translate(this.x * canvasScale, this.y * canvasScale);
        ctx.rotate(this.angle);
    
        // Main tank body
        drawRect(ctx, -this.length / 2, -this.width / 2, this.length, this.width, this.color, "black", 5);
    
        // Turret
        const turretWidth = this.width / 6;
        const turretLength = this.length * 0.7;
        drawRect(ctx, 0, -turretWidth / 2, turretLength, turretWidth, this.color, "black", 5);
    
        // Dome on top of the tank
        const domeRadius = (this.width / 3)
        drawCircle(ctx, 0, 0, domeRadius, this.color, "black", 5);
    
        ctx.restore();
    }
    
}



// |===========|
// |  BULLETS  |
// |===========|

// Bullet class (base class for all types of bullets)
class Bullet extends Shooter {
    static BulletCount = 0;
    
    constructor(spawnX, spawnY, spawnAngle, owner, spawnSpeed = 10, scale = 1) {
        super();
        
        this.id = Bullet.BulletCount++;  // Assign a unique ID to each tank
        this.x = spawnX;
        this.y = spawnY;
        this.angle = spawnAngle;
        this.owner = owner;
        this.speed = spawnSpeed;
        this.size = scale * 10;
        this.active = true;
        this.creationTime = Date.now();
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Check if bullet's lifespan is over and make it inactive
        if (Date.now() - this.creationTime > this.lifeSpan) {
            this.active = false;
        }
    }

    render(ctx) {
        if (this.active) {
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class DefaultBullet extends Bullet {
    constructor(spawnX, spawnY, spawnAngle, owner, spawnSpeed = 10, scale = 1) {
        super(spawnX, spawnY, spawnAngle, owner, spawnSpeed, scale);
        this.type = "default";
        this.size = scale * 5;
        this.lifeSpan = 3000;
    }

    update() {
        super.update();
    }

    render(ctx) {
        if (this.active) {
            drawCircle(ctx, this.x, this.y, this.size / 2, "blue", "black");
        }
    }
}

class ChaingunBullet extends Bullet {
    constructor(spawnX, spawnY, spawnAngle, owner, spawnSpeed = 10, scale = 1) {
        super(spawnX, spawnY, spawnAngle, owner, spawnSpeed, scale);
        this.type = "chaingun";
        this.size = scale * 3;
        this.lifeSpan = 1500;
    }

    update() {
        super.update();
    }

    render(ctx) {
        if (this.active) {
            drawCircle(ctx, this.x, this.y, this.size / 2, "blue", "black");
        }
    }
}

class ShotgunBullet extends Bullet {
    constructor(spawnX, spawnY, spawnAngle, owner, spawnSpeed = 10, scale = 1) {
        super(spawnX, spawnY, spawnAngle, owner, spawnSpeed, scale);
        this.type = "chaingun";
        this.size = scale * 3;
        this.lifeSpan = 1500;
    }

    update() {
        super.update();
    }

    render(ctx) {
        if (this.active) {
            drawCircle(ctx, this.x, this.y, this.size / 2, "blue", "black");
        }
    }
}

class ShrapnelBullet extends Bullet {
    constructor(spawnX, spawnY, spawnAngle, owner, spawnSpeed = 5, scale = 1) {
        super(spawnX, spawnY, spawnAngle, owner, spawnSpeed, scale);
        this.type = "shrapnel";
        this.size = scale * 2;
        this.lifeSpan = 1000;
    }

    update() {
        super.update();
    }

    render(ctx) {
        if (this.active) {
            drawRegPolygon(ctx, this.x, this.y, 3, this.size / 2, "green", "black");
        }
    }
}



// |============|
// |  POWERUPS  |
// |============|

class PowerUp {
    constructor(tank) {
        this.tank = tank; // The tank that owns this power-up
    }

    press() {
        // Default press behavior, can be overridden
    }

    hold() {
        // Default hold behavior, can be overridden
    }

    release() {
        // Default release behavior, can be overridden
    }
}

class NoPowerUp extends PowerUp {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
    }

    press() {
        this.tank.spawnRelativeBullet(DefaultBullet, 100, 0, 0, 10);
    }

    hold() {
        // empty
        const spreadAngle = 20; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);

        let randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
        this.tank.spawnRelativeBullet(DefaultBullet, 100, 0, randomBulletAngleOffset, 10);
    }

    release() {
        // empty
    }
}

class ChaingunPowerUp extends PowerUp {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
    }

    press() {
        // Start charging the chaingun when the button is pressed
        this.isCharging = true;
        this.chargeStartTime = Date.now();
    }

    hold() {
        // If holding for more than 1 second, start rapid firing bullets
        if (this.isCharging && Date.now() - this.chargeStartTime > 1000) {
            this.tank.spawnRelativeBullet(ChaingunBullet, relX = 0, relY = 0, relAngle = 0, speed = 10);
        }
    }

    release() {
        // Reset the power-up after releasing the button
        this.isCharging = false;
        this.tank.powerup = new NoPowerUp(this.tank); // Reset to default power-up
    }
}

class ShotgunPowerUp extends PowerUp {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
    }

    press() {
        const numBullets = 20;
        const spreadAngle = 20; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);
        
        for (let i = 0; i < numBullets; i++) {
            // Randomize the angle offset for each bullet
            let randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
            this.tank.spawnRelativeBullet(ShotgunBullet, 0, 0, randomBulletAngleOffset, 10);
        }
    }

    hold() {
        // empty
    }

    release() {
        // empty
        const numBullets = 20;
        const spreadAngle = 20; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);
        
        for (let i = 0; i < numBullets; i++) {
            // Randomize the angle offset for each bullet
            let randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
            this.tank.spawnRelativeBullet(ShrapnelBullet, 0, 0, randomBulletAngleOffset, 10);
        }
    }
}





//      |=====================|
//      |      GAME SETUP     |
//      |=====================|



// Create tanks with position, color, and controls
let angle = Math.random() * Math.PI * 2;
const tank1 = new Tank(500, 500, angle, 120, 90, 7, 5, "#ff0000", { up: "e", down: "d", left: "s", right: "f", shoot: "q" });
angle = Math.random() * Math.PI * 2;
const tank2 = new Tank(1400, 500, angle, 120, 90, 7, 5, "#00ff00", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "m" });

const tanks = [tank1, tank2];

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



let lastTime = performance.now();
let lastRenderStatisticsTime = performance.now();
let frameCount = 0;
let fps = 0;
let overlayFps = 0;
let overlayDeltaTime = 0;
let statisticUpdatesPerSecond = 6

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
    const width = 140;
    const linesOfText = 3
    const height = padding + linesOfText * 20;
    const x = 5;
    const y = 5;
    const borderRadius = 10;

    // Draw overlay background
    drawRoundedRect(x, y, width, height, borderRadius, "rgba(0, 0, 0, 0.5)");

    // Draw overlay text
    ctx.fillStyle = "#fff"; // White text
    ctx.font = "16px Arial";
    ctx.fillText(`FPS: ${overlayFps.toFixed(0)}`, x + padding, y + 20);
    ctx.fillText(`ΔTime: ${overlayDeltaTime.toFixed(3)}s`, x + padding, y + 40);

    // Display canvasScaler values
    const canvasScale = getCanvasScale();
    ctx.fillText(`Scale: ${canvasScale.toFixed(2)}`, x + padding, y + 60);

}

// Function to update and render bullets recursively
function updateAndRenderBullets(shooter, deltaTime) {
    shooter.bullets.forEach(bullet => {
        bullet.update(deltaTime);  // Pass deltaTime for consistent movement
        bullet.render(ctx);
        updateAndRenderBullets(bullet, deltaTime);  // Recursively update bullets inside bullets
    });

    // Remove inactive bullets
    shooter.bullets = shooter.bullets.filter(bullet => bullet.active);
}






//      |=====================|
//      |      GAME LOOP      |
//      |=====================|



function gameLoop() {
    const currentTime = performance.now();  // Get the current time in ms
    const deltaTime = (currentTime - lastTime) / 1000;  // Time difference in seconds

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and render tanks + their bullets etc...
    tanks.forEach(tank => {
        tank.update(deltaTime);  // Pass deltaTime for tank movement and logic
        tank.render(ctx);
        updateAndRenderBullets(tank, deltaTime);
    });

    updateStatistics(currentTime, deltaTime);
    
    lastTime = currentTime
    requestAnimationFrame(gameLoop);  // Continue the game loop

    
}

gameLoop();