import { setGlobalVariable, getGlobalVariable } from '../global-state.js';
import { DefaultBullet, ChaingunBullet, ShotgunBullet, Shrapnel, ShrepnalBomb, FireBullet } from './bullet.js';



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
        const tileSize = getGlobalVariable("tileSize");
        const bulletSpeed = tileSize * 1.8
        this.tank.spawnRelativeBullet(DefaultBullet, { x: this.tank.width, y: 0 }, 0, bulletSpeed);
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
        this.isReadyToFire = false; // Tracks whether the chaingun is ready to fire
        this.fireRate = 10; // Bullets per second
        this.fireRateCooldown = 1 / this.fireRate; // Time between shots in seconds
        this.timeSinceLastShot = 0; // Tracks time since last bullet
        this.chargeTime = 1; // Time (in seconds) to charge before firing
        this.timeSinceChargeStarted = 0; // Time since charging started
    }

    press() {
        // Start charging the chaingun when the button is pressed
        this.isCharging = true;
        this.timeSinceChargeStarted = 0; // Reset charge time
        this.isReadyToFire = false; // Reset firing state
    }

    hold(deltaTime) {
        if (!this.isCharging) return;

        const spreadAngle = 10; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);

        // Accumulate time since charge started
        this.timeSinceChargeStarted += deltaTime;

        // Start firing only after charge time has passed
        if (this.timeSinceChargeStarted >= this.chargeTime) {
            this.isReadyToFire = true;
        }

        // If ready to fire, continue shooting
        if (this.isReadyToFire) {
            this.timeSinceLastShot += deltaTime; // Accumulate time for rapid fire

            while (this.timeSinceLastShot > this.fireRateCooldown) {
                this.timeSinceLastShot -= this.fireRateCooldown; // Reduce accumulated time

                const tileSize = getGlobalVariable("tileSize");

                // Calculate compensation distance
                const extraTravelTime = this.timeSinceLastShot; // Time bullet is "late"
                const bulletSpeed = tileSize * 2.75;
                const extraDistance = bulletSpeed * extraTravelTime;

                // Get initial bullet position
                const spawnPos = { x: this.tank.width, y: 0 };

                // Move bullet forward to compensate for delay
                const angle = this.tank.angle;
                const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
                const compensatedPos = {
                    x: spawnPos.x + Math.cos(angle) * extraDistance,
                    y: spawnPos.y + Math.sin(angle) * extraDistance
                };

                // Fire the bullet at the corrected position
                this.tank.spawnRelativeBullet(ChaingunBullet, compensatedPos, randomBulletAngleOffset, bulletSpeed);
            }
        }
    }

    release() {
        this.isCharging = false;
        this.isReadyToFire = false; // Stop firing when button is released
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
            const tileSize = getGlobalVariable("tileSize");

            // Randomize the angle offset for each bullet
            const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
            const bulletSpeed = tileSize * (3.0 + Math.random() * 0.5);
            const lifeSpan = 1750 - Math.random() * (1750 / 15);
            this.tank.spawnRelativeBullet(ShotgunBullet, { x: this.tank.width, y: 0 }, randomBulletAngleOffset, bulletSpeed, 1, lifeSpan);
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

        const tileSize = getGlobalVariable("tileSize");

            // Randomize the angle offset for each bullet
            const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
            const bulletSpeed = tileSize * (3.0 + Math.random() * 0.5);
            const lifeSpan = 5000 - Math.random() * (5000 / 2);
            this.tank.spawnRelativeBullet(FireBullet, { x: this.tank.width, y: 0 }, randomBulletAngleOffset, bulletSpeed, 1, lifeSpan);
    }

    release() {
        // empty
    }
}

export class ChainShotgun extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.isReadyToFire = false;
        this.fireRate = 20;
        this.fireRateCooldown = 1 / this.fireRate;
        this.timeSinceLastShot = 0;
        this.chargeTime = 0.5;
        this.timeSinceChargeStarted = 0;
    }

    press() {
        // Start charging the chaingun when the button is pressed
        this.isCharging = true;
        this.timeSinceChargeStarted = 0;
        this.isReadyToFire = false;
    }

    hold(deltaTime) {
        if (!this.isCharging) return;

        // Accumulate time since charge started
        this.timeSinceChargeStarted += deltaTime;

        // Start firing only after charge time has passed
        if (this.timeSinceChargeStarted >= this.chargeTime) {
            this.isReadyToFire = true;
        }

        // If ready to fire, continue shooting
        if (this.isReadyToFire) {
            this.timeSinceLastShot += deltaTime; // Accumulate time for rapid fire

            while (this.timeSinceLastShot > this.fireRateCooldown) {
                this.timeSinceLastShot -= this.fireRateCooldown; // Reduce accumulated time

                const tileSize = getGlobalVariable("tileSize");

                // Calculate compensation distance
                const extraTravelTime = this.timeSinceLastShot; // Time bullet is "late"
                const bulletSpeed = tileSize * 2.75;
                const extraDistance = bulletSpeed * extraTravelTime;

                // Get initial bullet position
                const spawnPos = { x: this.tank.width, y: 0 };

                // Move bullet forward to compensate for delay
                const angle = this.tank.angle;
                const compensatedPos = {
                    x: spawnPos.x + Math.cos(angle) * extraDistance,
                    y: spawnPos.y + Math.sin(angle) * extraDistance
                };

                const numBullets = 20;
                const spreadAngle = 20; // Spread angle in degrees
                const spreadAngleRadians = spreadAngle * (Math.PI / 180);
                
                for (let i = 0; i < numBullets; i++) {
                    const tileSize = getGlobalVariable("tileSize");

                    // Randomize the angle offset for each bullet
                    const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
                    const bulletSpeed = tileSize * (3.0 + Math.random() * 0.5);
                    const lifeSpan = 1750 - Math.random() * (1750 / 15);
                    this.tank.spawnRelativeBullet(ShotgunBullet, compensatedPos, randomBulletAngleOffset, bulletSpeed, 1, lifeSpan);
                }
            }
        }
    }

    release() {
        this.isCharging = false;
        this.isReadyToFire = false; // Stop firing when button is released
    }
}

export class ShrepnalBombWeapon extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
    }

    press() {
        const tileSize = getGlobalVariable("tileSize");
        const bulletSpeed = tileSize * 1.8
        this.tank.spawnRelativeBullet(ShrepnalBomb, { x: this.tank.width, y: 0 }, 0, bulletSpeed);
    }

    hold() {
        // empty
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
        const spreadAngle = 20; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);

        let randomNumber = Math.random()
        let randomBulletAngleOffset = (randomNumber - 0.5) * spreadAngleRadians;
        randomNumber = Math.random()
        this.tank.spawnRelativeBullet(Shrapnel, { x: this.tank.width, y: 0 }, randomBulletAngleOffset, 500 * (randomNumber + 0.5));
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }
}