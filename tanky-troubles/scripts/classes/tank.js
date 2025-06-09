import { setGlobalVariable, getGlobalVariable } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawLine, drawRegPolygon, drawVectorArrow} from '../graphics-utils.js';
import { NoWeapon, Chaingun, Shotgun, FlameThrower, ChainShotgun, ShrepnalBombWeapon, ExperimentalWeapon, ChainShotgunBOOM } from './weapons.js';



export class Tank {
    static tankCount = 0;

    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, size = {length: 120, width: 90}, speed = 5, turningSpeed = 1, scale = 1, color = "#555", controls = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "m" }, globalKeys) {
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
        this.globalKeys = globalKeys;
        this.weapon = new NoWeapon(this); // Default weapon
        this.maxBullets = 5;       // Only applies to "default" powerup
        this.ammo = -1;            // -1 means infinite "default" ammo

        this.health = 1;

        // Get current tanks array, add new tank, and update state
        const tanks = getGlobalVariable("tanks"); 
        tanks.push(this);
        setGlobalVariable("tanks", tanks);
    }

    shootPress() {
        this.weapon.press();
    }

    shootHold(deltaTime) {
        this.weapon.hold(deltaTime);
    }

    shootRelease() {
        this.weapon.release();
    }

    applyPowerUp(PowerUpClass) {
        console.log(`%cTank ${this.id} - PowerUp applied: ${PowerUpClass.name}`, "color: aqua; font-weight: bold;");
        this.weapon = new PowerUpClass(this);
    }

    update(deltaTime) {
        // Detect shooting press & release
        const isShooting = this.globalKeys[this.controls.shoot];

        if (isShooting && !this.wasShooting) {
            this.shootPress();
        }
        if (!isShooting && this.wasShooting) {
            this.shootRelease();
        }
        this.wasShooting = isShooting;

        // Handle shoot hold
        if (this.globalKeys[this.controls.shoot]) {
            this.shootHold(deltaTime);
        }
    
        // Rotation - Turning
        if (!(this.globalKeys[this.controls.left] && this.globalKeys[this.controls.right])) {
            if (this.globalKeys[this.controls.left]) this.angle -= this.turningSpeed * deltaTime;
            if (this.globalKeys[this.controls.right]) this.angle += this.turningSpeed * deltaTime;
        }
        this.angle = (this.angle + 2 * Math.PI) % (2 * Math.PI);
    
        // Reset velocity to (0, 0) when no keys are pressed
        this.velocity.x = 0;
        this.velocity.y = 0;
    
        // Velocity-based movement
        if (this.globalKeys[this.controls.up]) {
            this.velocity.x = Math.cos(this.angle) * this.speed;
            this.velocity.y = Math.sin(this.angle) * this.speed;
        }
        if (this.globalKeys[this.controls.down]) {
            this.velocity.x = -Math.cos(this.angle) * this.speed;
            this.velocity.y = -Math.sin(this.angle) * this.speed;
        }

        // Update position using velocity
        this.pos.x += this.velocity.x * deltaTime;
        this.pos.y += this.velocity.y * deltaTime;
    }

    render(ctx) {
        ctx.save();

        // Transform to fit the game world into the canvas and have local tank coordinates and rotation
        const canvasScale = getGlobalVariable("canvasScale");
        ctx.translate(this.pos.x * canvasScale, this.pos.y * canvasScale);
        ctx.rotate(this.angle);

        // Body
        drawRect(ctx, { x: -this.size.length / 2, y: -this.size.width / 2 }, { width: this.size.length, height: this.size.width }, this.color, "black", 5);

        // Tracks
        // drawRect(ctx, { x: -size.width / 2, y: -size.height / 2 }, size, this.color, "black", 5);

        // Turret
        this.weapon.renderTurret(ctx, this);

        ctx.restore();

        // Player Name or ID
        const text = this.id
        const textPos = { x: this.pos.x, y: this.pos.y - 50 * this.scale };
        drawText(ctx, text, textPos, "center", "bottom", 25, "Consolas", this.color, "#000000", 5);
    }

    debugRender(ctx) {
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
