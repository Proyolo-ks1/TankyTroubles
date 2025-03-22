import { setGlobalVariable, getGlobalVariable, getAllState } from '../global-state.js';
import { DefaultBullet, ChaingunBullet, ShotgunBullet, ShrapnelBullet, FireBullet } from './bullet.js';



//      |====================|
//      |      POWERUPS      |
//      |====================|



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

export class NoPowerUp extends PowerUp {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
    }

    press() {
        this.tank.spawnRelativeBullet(ShrapnelBullet, { x: this.tank.width, y: 0 }, 0, 500);
    }

    hold() {
        // empty
        // const spreadAngle = 20; // Spread angle in degrees
        // const spreadAngleRadians = spreadAngle * (Math.PI / 180);

        // let randomNumber = Math.random()
        // let randomBulletAngleOffset = (randomNumber - 0.5) * spreadAngleRadians;
        // randomNumber = Math.random()
        // this.tank.spawnRelativeBullet(ShrapnelBullet, { x: this.tank.width, y: 0 }, randomBulletAngleOffset, 500 * (randomNumber + 0.5));
    }

    release() {
        // empty
    }
}

export class ChaingunPowerUp extends PowerUp {
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

export class ShotgunPowerUp extends PowerUp {
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