import { getGlobal } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawLine, drawRegPolygon, drawVectorArrow} from '../graphics-utils.js';
import { NoWeapon, Chaingun, Shotgun, FlameThrower, ChainShotgun, ShrepnalBombWeapon, ExperimentalWeapon, ChainShotgunBOOM, OppenheimerBOOOM } from './weapons.js';

// RunningGameApi
const gameApi = document.getElementById("game-container").runningGameApi;

// References
const globalKeys = gameApi.globalKeys



export class Tank {
    static tankCount = 0;

    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, size = {length: 120, width: 90}, speed = 5, turningSpeed = 1, scale = 1, color = "#555", controls = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "m" }) {
        this.id = `tank${Tank.tankCount++}`;

        this.pos = posSpawn;
        this.velocity = { x: 0, y: 0 };
        this.angle = angleSpawn;
        this.speed = speed;
        this.turningSpeed = turningSpeed;
        this.scale = scale
        this.size = { length: size.length * scale, width: size.width * scale };
        this.color = color;
        this.controls = controls;
        this.weapon = new Chaingun(this); // Default weapon
        this.maxBullets = 5;       // Only applies to "default" powerup
        this.ammo = -1;            // -1 means infinite "default" ammo
        this.trackRotation = {left: 0, right: 0}

        this.health = 1;

        getGlobal().gameObjects.tanks.push(this);
    }

    // Triggered once when the shoot-key is pressed down
    shootPress() {
        this.weapon.press();
    }

    // Triggered as long as the shoot-key is pressed down
    shootHold(deltaTime) {
        this.weapon.hold(deltaTime);
    }

    // Triggered once the shoot-key is released
    shootRelease() {
        this.weapon.release();
    }

    applyPowerUp(PowerUpClass) {
        console.log(`%cTank ${this.id} - PowerUp applied: ${PowerUpClass.name}`, "color: aqua; font-weight: bold;");
        this.weapon = new PowerUpClass(this);
    }

    update(deltaTime) {

        // Detect shooting press & release
        const isShooting = globalKeys[this.controls.shoot];

        if (isShooting && !this.wasShooting) {
            this.shootPress();
        }
        if (!isShooting && this.wasShooting) {
            this.shootRelease();
        }
        this.wasShooting = isShooting;

        // Handle shoot hold
        if (globalKeys[this.controls.shoot]) {
            this.shootHold(deltaTime);
        }
    
        // Rotation - Turning
        if (!(globalKeys[this.controls.left] && globalKeys[this.controls.right])) {
            if (globalKeys[this.controls.left]) {
                this.angle -= this.turningSpeed * deltaTime;
            }
            if (globalKeys[this.controls.right]) {
                this.angle += this.turningSpeed * deltaTime;
            }
        }
        this.angle = (this.angle + 2 * Math.PI) % (2 * Math.PI);
    
        // Reset velocity to (0, 0) when no keys are pressed
        this.velocity.x = 0;
        this.velocity.y = 0;
    
        // Velocity-based movement
        if (globalKeys[this.controls.up]) {
            this.velocity.x = Math.cos(this.angle) * this.speed;
            this.velocity.y = Math.sin(this.angle) * this.speed;
        }
        if (globalKeys[this.controls.down]) {
            this.velocity.x = -Math.cos(this.angle) * this.speed;
            this.velocity.y = -Math.sin(this.angle) * this.speed;
        }

        // Update position using velocity
        this.pos.x += this.velocity.x * deltaTime;
        this.pos.y += this.velocity.y * deltaTime;

        // Update track rotation
        const forwardSpeed = Math.cos(this.angle) * this.velocity.x + Math.sin(this.angle) * this.velocity.y;
        this.trackRotation.left += forwardSpeed * deltaTime;
        this.trackRotation.right += forwardSpeed * deltaTime;
    }

    render(ctx, deltaTime) {
        ctx.save();

        // Transform to fit the game world into the canvas and have local tank coordinates and rotation
        const canvasScale = getGlobal().canvasScale;
        ctx.translate(this.pos.x * canvasScale, this.pos.y * canvasScale);
        ctx.rotate(this.angle);

        // Body
        drawRect(ctx, { x: -this.size.length / 2, y: -this.size.width / 2 }, { width: this.size.length, height: this.size.width }, this.color, "black", 5);

        // Tracks
        const trackLinkLength = this.size.length / 12;
        drawRect(ctx, { x: -this.size.length / 2, y: -this.size.width / 2 }, { width: this.size.length, height: this.size.width / 6 }, this.color, "black", 5);
        drawRect(ctx, { x: -this.size.length / 2, y: this.size.width / 2 - this.size.width / 6 }, { width: this.size.length, height: this.size.width / 6 }, this.color, "black", 5);
        const trackLeftRotationRemainder = mod(this.trackRotation.left, 2) * trackLinkLength;
        const trackRightRotationRemainder = mod(this.trackRotation.right, 2) * trackLinkLength;
        for (let i = 0; i <= 6; i++) {
            drawRect(ctx, { x: -this.size.length / 2 + trackLinkLength * (2 * i - 1) + trackLeftRotationRemainder, y: -this.size.width / 2 }, { width: trackLinkLength, height: this.size.width / 6 }, "rgba(0, 0, 0, 0.3)");
        }
        for (let i = 0; i <= 6; i++) {
            drawRect(ctx, { x: -this.size.length / 2 + trackLinkLength * (2 * i - 1) + trackRightRotationRemainder, y: this.size.width / 2 - this.size.width / 6 }, { width: trackLinkLength, height: this.size.width / 6 }, "rgba(0, 0, 0, 0.3)");
        }
        
        // Turret
        this.weapon.renderTurret(ctx, deltaTime);

        ctx.restore();

        // Player Name or ID
        const text = this.id
        const textPos = { x: this.pos.x, y: this.pos.y - 0.3 * this.scale * getGlobal().tileSize };
        drawText(ctx, text, textPos, "center", "bottom", 25, "Consolas", this.color, "#000000", 5);
    }

    debugrender(ctx, deltaTime) {
        // Velocity Arrow
        drawVectorArrow(ctx, this.pos, this.velocity, "#0000FF", 5);

        // Heading Line
        const headingLength = 100; // Adjust this value to control the length of the heading line
        const headingX = this.pos.x + Math.cos(this.angle) * headingLength;
        const headingY = this.pos.y + Math.sin(this.angle) * headingLength;

        // Draw the heading line
        drawLine(ctx, this.pos, { x: headingX, y: headingY }, "#808", 5);
    }
}



function mod(n, m) {
    return ((n % m) + m) % m;
}
