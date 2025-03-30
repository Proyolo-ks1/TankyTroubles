import { setGlobalVariable, getGlobalVariable } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawLine, drawRegPolygon, drawVectorArrow} from '../graphics-utils.js';
import { Shooter } from './shooter.js';
import { NoWeapon, Chaingun, Shotgun, FlameThrower, ChainShotgun, ExperimentalWeapon, ShrepnalBombWeapon } from './weapons.js';



export class Tank extends Shooter {
    static tankCount = 0;

    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, length = 120, width = length * 0.75, speed = 5, turningSpeed = 1, color = "#555", controls = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "m" }, globalKeys) {
        super();
        this.id = Tank.tankCount++;
        this.pos = posSpawn;
        this.velocity = { x: 0, y: 0 };
        this.angle = angleSpawn;
        this.speed = speed;
        this.turningSpeed = turningSpeed;
        this.length = length;
        this.width = width;
        this.color = color;
        this.controls = controls;
        this.globalKeys = globalKeys;
        this.weapon = new ShrepnalBombWeapon(this); // Default weapon
        this.maxBullets = 5;       // Only applies to "default" powerup
        this.ammo = -1;            // -1 means infinite "default" ammo

        this.health = 1;

        // Get current tanks array, add new tank, and update state
        const tanks = getGlobalVariable("tanks"); 
        tanks.push(this);
        setGlobalVariable("tanks", tanks);
        
        console.log('Tank Initial position:', this.pos);
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
        const pos = this.pos;
        const size = { width: this.length, height: this.width };

        ctx.translate(pos.x * canvasScale, pos.y * canvasScale); // Use pos for translation
        ctx.rotate(this.angle);

        // Main tank body
        drawRect(ctx, { x: -size.width / 2, y: -size.height / 2 }, size, this.color, "black", 5);

        // Turret
        let turretSize;
        if (this.weapon instanceof Shotgun) {
            turretSize = { width: this.length * 0.7, height: this.width / 3 };
            drawRect(ctx, { x: 0, y: -turretSize.height / 2 }, turretSize, this.color, "black", 5);
        } else if (this.weapon instanceof Chaingun) {
            // Draw the base of the chaingun turret
            turretSize = { width: this.length * 0.7, height: this.width / 4 };
            let dynColor = this.color
            if (this.globalKeys[this.controls.shoot]) {
                dynColor = "white"
            }
            drawRect(ctx, { x: 0, y: -turretSize.height / 2 }, turretSize, dynColor, "black", 5);
        
            // Calculate the number of barrels (e.g., 5 barrels)
            const barrelCount = 5;
            const barrelWidth = turretSize.width / barrelCount;
            const barrelHeight = 10;  // The height of the barrels
        
            // Draw barrels spaced evenly across the turret
            for (let i = 0; i < barrelCount; i++) {
                const barrelX = -turretSize.width / 2 + barrelWidth * (i + 0.5); // Position each barrel evenly across the turret
                const barrelPos = { x: barrelX, y: -turretSize.height / 2 };
                drawRect(ctx, barrelPos, { width: barrelWidth, height: barrelHeight }, "gray", "black", 2); // thinner outline for barrels
            } 
        } else if (this.weapon instanceof FlameThrower) {
            turretSize = { width: this.length * 0.7, height: this.width / 3 };
            drawRect(ctx, { x: 0, y: -turretSize.height / 2 }, turretSize, "#FFA500", "black", 5);
        } else {
            turretSize = { width: this.length * 0.7, height: this.width / 4 };
            drawRect(ctx, { x: 0, y: -turretSize.height / 2 }, turretSize, this.color, "black", 5);
        }

        // Dome on top of the tank
        const domeRadius = this.width / 3;
        drawCircle(ctx, { x: 0, y: 0 }, domeRadius, this.color, "black", 5);

        ctx.restore();

        // Player Name or ID
        const text = `Tank ${this.id}`
        const textPos = { x: this.pos.x, y: this.pos.y - 50 };
        drawText(ctx, text, textPos, 25, this.color, "center", "bottom", "#000000", 5);
    }

    debugRender(ctx) {
        // Velocity Arrow
        drawVectorArrow(ctx, this.pos, this.velocity, "#0000FF", 2);

        // Heading Line
        const headingLength = 50; // Adjust this value to control the length of the heading line
        const headingX = this.pos.x + Math.cos(this.angle) * headingLength;
        const headingY = this.pos.y + Math.sin(this.angle) * headingLength;

        // Draw the heading line
        drawLine(ctx, this.pos, { x: headingX, y: headingY }, "#FF0000", 2); // Red color for the heading line
    }
}
