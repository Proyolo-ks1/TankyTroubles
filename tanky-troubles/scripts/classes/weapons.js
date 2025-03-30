import { setGlobalVariable, getGlobalVariable } from '../global-state.js';
import { DefaultBullet, ChaingunBullet, ShotgunBullet, ShrapnelBullet, FireBullet } from './bullet.js';



//      |====================|
//      |      POWERUPS      |
//      |====================|



class Weapon {
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

export class NoWeapon extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
    }

    press() {
        this.tank.spawnRelativeBullet(DefaultBullet, { x: this.tank.width, y: 0 }, 0, 500);
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }
}

export class Chaingun extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.fireRate = 20; // Bullets per second
        this.fireRateCooldown = 1 / this.fireRate; // Time between shots in seconds
        this.timeSinceLastShot = 0; // Tracks time since last bullet
    }

    press() {
        // Start charging the chaingun when the button is pressed
        this.isCharging = true;
        this.timeSinceLastShot = 0; // Reset firing timer
        this.tank.spawnRelativeBullet(DefaultBullet, { x: this.tank.width, y: 0 }, 0, 500);
    }

    hold(deltaTime) {
        if (!this.isCharging) return;
        // console.log(deltaTime);

        this.timeSinceLastShot += deltaTime; // Accumulate time

        while (this.timeSinceLastShot > this.fireRateCooldown) { 
            this.timeSinceLastShot -= this.fireRateCooldown; // Reduce accumulated time

            // Calculate compensation distance
            const extraTravelTime = this.timeSinceLastShot; // Time bullet is "late"
            const bulletSpeed = 500; // Example speed in pixels per second
            const extraDistance = bulletSpeed * extraTravelTime;

            // Get initial bullet position
            const spawnPos = { x: this.tank.width, y: 0 }; 

            // Move bullet forward to compensate for delay
            const angle = this.tank.angle; // Assuming tank has an angle
            const compensatedPos = {
                x: spawnPos.x + Math.cos(angle) * extraDistance,
                y: spawnPos.y + Math.sin(angle) * extraDistance
            };

            // Fire the bullet at the corrected position
            this.tank.spawnRelativeBullet(ChaingunBullet, compensatedPos, 0, bulletSpeed);
        }
    }

    release() {
        this.isCharging = false;
    }
}

export class Shotgun extends Weapon {
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
            let randomSpeedOffset = (Math.random() - 0.5) * 100
            this.tank.spawnRelativeBullet(ShotgunBullet, { x: this.tank.width, y: 0 }, randomBulletAngleOffset, 500 + randomSpeedOffset, lifeSpan);
        }
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }
}

export class FlameThrower extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
    }

    press() {
        this.tank.spawnRelativeBullet(FireBullet, { x: this.tank.width, y: 0 }, 0, 500);
    }

    hold() {
        // empty
        const spreadAngle = 20; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);

        let randomNumber = Math.random()
        let randomBulletAngleOffset = (randomNumber - 0.5) * spreadAngleRadians;
        randomNumber = Math.random()
        this.tank.spawnRelativeBullet(FireBullet, { x: this.tank.width, y: 0 }, randomBulletAngleOffset, 500 * (randomNumber + 0.5));
    }

    release() {
        // empty
    }
}

export class ExperimentalWeapon extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
    }

    press() {
        this.tank.spawnRelativeBullet(DefaultBullet, { x: this.tank.width, y: 0 }, 0, 500);
    }

    hold() {
        // empty
        const spreadAngle = 20; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);

        let randomNumber = Math.random()
        let randomBulletAngleOffset = (randomNumber - 0.5) * spreadAngleRadians;
        randomNumber = Math.random()
        this.tank.spawnRelativeBullet(ShrapnelBullet, { x: this.tank.width, y: 0 }, randomBulletAngleOffset, 500 * (randomNumber + 0.5));
    }

    release() {
        // empty
    }
}

export class ExperimentalWeapon2 extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
    }

    press() {
        const spreadAngle = 20; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);

        let randomNumber = Math.random()
        let randomBulletAngleOffset = (randomNumber - 0.5) * spreadAngleRadians;
        randomNumber = Math.random()
        this.tank.spawnRelativeBullet(ShrapnelBullet, { x: this.tank.width, y: 0 }, randomBulletAngleOffset, 500 * (randomNumber + 0.5));
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }
}