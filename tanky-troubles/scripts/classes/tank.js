import { Shooter } from './shooter.js';
import { NoPowerUp, ChaingunPowerUp, ShotgunPowerUp } from './powerUp.js';



class Tank extends Shooter {
    static tankCount = 0;

    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, length = 120, width = length * 0.75, speed = 5, turningSpeed = 1, color = "#555", controls = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "m" }) {
        super();
        this.id = Tank.tankCount++;  // Assign a unique ID to each tank
        this.pos = posSpawn;
        this.angle = angleSpawn;
        this.length = length;
        this.width = width;
        this.speed = speed;
        this.turningSpeed = turningSpeed;
        this.color = color;
        this.controls = controls;
        this.keys = { up: false, down: false, left: false, right: false };
        this.weaponClass = NoPowerUp;
        this.weapon = new NoPowerUp(this); // Default weapon
        this.maxBullets = 5;       // Only applies to "default" powerup
        this.ammo = -1;            // -1 means infinite "default" ammo
        this.health = 1;

        tanks.push(this);
    }
    
    shootPress() {
        this.weapon.press();
    }

    shootHold() {
        this.weapon.hold();
    }
    
    shootRelease() {
        this.weapon.release();
    }
    
    applyPowerUp(PowerUpClass) {
        console.log(`%cTank ${this.id} - PowerUp applied: ${PowerUpClass.name}`, "color: aqua; font-weight: bold;");
        this.weapon = new PowerUpClass(this);
    }
    
    update(deltaTime) {
        // Shoot Held down
        if (this.keys.shoot) {
            this.shootHold();
        }

        // Rotation - Turning
        if (!(this.keys.left && this.keys.right)) {
            if (this.keys.left) this.angle -= this.turningSpeed * deltaTime * (2 * Math.PI);
            if (this.keys.right) this.angle += this.turningSpeed * deltaTime * (2 * Math.PI);
        }

        // Position - Driving
        let rad = this.angle;
        if (!(this.keys.up && this.keys.down)) {
            if (this.keys.up) {
                this.pos.x += Math.cos(rad) * this.speed * deltaTime;
                this.pos.y += Math.sin(rad) * this.speed * deltaTime;
            }
            if (this.keys.down) {
                this.pos.x -= Math.cos(rad) * this.speed * deltaTime;
                this.pos.y -= Math.sin(rad) * this.speed * deltaTime;
            }
        }
    }

    // render tank
    render() {
        ctx.save();

        // Transform to fit the game world into the canvas and have local tank coordinates and rotation
        const canvasScale = getVariable("canvasScale");
        const pos = this.pos;
        const size = { width: this.length, height: this.width }; // Defining the size object for the tank body
        
        ctx.translate(pos.x * canvasScale, pos.y * canvasScale); // Use pos for translation
        ctx.rotate(this.angle);

        // Main tank body
        drawRect(ctx, { x: -size.width / 2, y: -size.height / 2 }, size, this.color, "black", 5);

        // Turret
        const turretSize = { width: this.length * 0.7, height: this.width / 4 };
        drawRect(ctx, { x: 0, y: -turretSize.height / 2 }, turretSize, this.color, "black", 5);

        // Dome on top of the tank
        const domeRadius = this.width / 3;
        drawCircle(ctx, { x: 0, y: 0 }, domeRadius, this.color, "black", 5);

        ctx.restore();
    }
}