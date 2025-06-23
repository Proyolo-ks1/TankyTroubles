import { setGlobalVariable, getGlobalVariable } from '../global-state.js';
import { DefaultBullet, ChaingunBullet, ShotgunBullet, Shrapnel, ShrapnelBomb, FireBullet, HomingMissle, OppenheimerBullet } from './bullet.js';
import { spawnRelativeClass } from './spawner.js';
import { drawRect, drawVertexPolygon, drawCircle, drawText, drawLine, drawRegPolygon, drawVectorArrow} from '../graphics-utils.js';






//      |====================|
//      |      POWERUPS      |
//      |====================|



class Weapon {
    constructor(tank) {
        this.tank = tank;
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

    renderTurret(ctx) {
        // Default turret rendering, can be overridden
    }
}

export class NoWeapon extends Weapon {
    constructor(tank) {
        super(tank);
        this.barrelLength = this.tank.size.length * 0.7;
    }

    press() {
        const tileSize = getGlobalVariable("tileSize");
        const bulletSpeed = tileSize * 1.8
        spawnRelativeClass(DefaultBullet, this.tank, this.tank.pos, this.tank.angle, {x: this.barrelLength, y: 0}, 0, bulletSpeed, this.tank.scale);
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }

    renderTurret(ctx) {
        // Barrel
        const barrelLength = this.tank.size.length * 0.7;
        const barrelWidth = this.tank.size.width * 4 / 15;
        const x = 0;
        const y = -barrelWidth / 2;
        drawRect(ctx, { x: x, y: y }, { width: barrelLength, height: barrelWidth }, this.tank.color, "black", 5);

        // Dome
        const domeRadius = this.tank.size.width / 3;
        drawCircle(ctx, { x: 0, y: 0 }, domeRadius, this.color, "black", 5);
    }
}

export class Chaingun extends Weapon {
    constructor(tank) {
        super(tank);
        this.barrelLength;

        this.isCharging = false;
        this.timeSinceChargeStarted = 0; // Time since charging started
        this.isReadyToFire = false; // Tracks whether the chaingun is ready to fire

        this.fireRate = 10; // Bullets per second
        this.fireRateCooldown = 1 / this.fireRate; // Time between shots in seconds
        this.timeSinceLastShot = 0; // Tracks time since last bullet
        this.chargeTime = 1; // Time (in seconds) to charge before firing
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
                const spawnPos = { x: this.barrelLength, y: 0 };

                const angle = this.tank.angle;
                const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;

                // Move bullet forward to compensate for delay
                const compensatedPos = {
                    x: spawnPos.x + Math.cos(angle) * extraDistance,
                    y: spawnPos.y + Math.sin(angle) * extraDistance
                };

                // Fire the bullet at the corrected position
                spawnRelativeClass(ChaingunBullet, this.tank, this.tank.pos, this.tank.angle, compensatedPos, randomBulletAngleOffset, bulletSpeed, this.tank.scale);
            }
        }
    }

    release() {
        this.isCharging = false;
        this.isReadyToFire = false; // Stop firing when button is released
    }

    renderTurret(ctx) {
        // Draw the base of the chaingun turret
        let turretSize = { width: this.tank.size.length * 0.7, height: this.tank.size.width / 4 };
        let dynColor = this.tank.color
        if (this.tank.globalKeys[this.tank.controls.shoot]) {
            dynColor = "white"
        }
        drawRect(ctx, { x: 0, y: -turretSize.height / 2 }, turretSize, dynColor, "black", 5);
    
        // Calculate the number of barrels (e.g., 5 barrels)
        const barrelCount = 5;
        const barrelWidth = turretSize.width / barrelCount;
        const barrelHeight = 10;
    
        // Draw barrels spaced evenly across the turret
        for (let i = 0; i < barrelCount; i++) {
            const barrelX = -turretSize.width / 2 + barrelWidth * (i + 0.5); // Position each barrel evenly across the turret
            const barrelPos = { x: barrelX, y: -turretSize.height / 2 };
            drawRect(ctx, barrelPos, { width: barrelWidth, height: barrelHeight }, "gray", "black", 2); // thinner outline for barrels
        }
    }
}

export class Shotgun extends Weapon {
    constructor(tank) {
        super(tank);
        this.barrelLength = this.tank.size.length * 0.7;
        this.barrelWidth = this.tank.size.width / 3
    }

    press() {
        const numBullets = 20;
        const spreadAngle = 20; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);
        
        for (let i = 0; i < numBullets; i++) {
            const tileSize = getGlobalVariable("tileSize");

            // Randomize the angle offset for each bullet
            const randomBulletBarrelPosY = this.barrelWidth * (Math.random() - 0.5);
            const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
            const bulletSpeed = tileSize * (3.0 + Math.random() * 0.5);
            const lifeSpan = 1750 - Math.random() * (1750 / 15);
            spawnRelativeClass(ShotgunBullet, this.tank, this.tank.pos, this.tank.angle, { x: this.barrelLength, y: randomBulletBarrelPosY }, randomBulletAngleOffset, bulletSpeed, 1, lifeSpan);
        }
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }

    renderTurret(ctx) {
        // Barrel
        const length = this.barrelLength
        const width = this.barrelWidth
        const x = 0;
        const y = -width / 2;
        drawRect(ctx, { x: x, y: y }, { width: length, height: width }, this.tank.color, "black", 5);
    }
}

export class FlameThrower extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
    }

    press() {
        // empty
    }

    hold() {
        const spreadAngle = 20; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);

        const tileSize = getGlobalVariable("tileSize");

            // Randomize the angle offset for each bullet
            const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
            const bulletSpeed = tileSize * (3.0 + Math.random() * 0.5);
            const lifeSpan = 5000 - Math.random() * (5000 / 2);
            spawnRelativeClass(FireBullet, this.tank, this.tank.pos, this.tank.angle, { x: this.tank.size.width, y: 0 }, randomBulletAngleOffset, bulletSpeed, 1, lifeSpan);
    }

    release() {
        // empty
    }

    renderTurret(ctx) {
        let turretSize = { width: this.tank.size.length * 0.7, height: this.tank.size.width / 3 };
        drawRect(ctx, { x: 0, y: -turretSize.height / 2 }, turretSize, "#FFA500", "black", 5);
        const customShape = [
            { x: 50, y: 0 },
            { x: 100, y: 50 },
            { x: 75, y: 100 },
            { x: 25, y: 75 },
        ];
        
        const pos = { x: 100, y: 100 };  // Position where the shape will be drawn
        const angle = 45;  // Rotation in degrees
        
        drawVertexPolygon(ctx, pos, angle, customShape, "aqua", "black", 10);
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
        this.barrelLength = this.tank.size.length * 0.7;
        this.barrelWidth = this.tank.size.width / 3
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
                const spawnPos = { x: this.tank.size.width, y: 0 };

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
                    const randomBulletBarrelPosY = this.barrelWidth * (Math.random() - 0.5);
                    const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
                    const bulletSpeed = tileSize * (3.0 + Math.random() * 0.5);
                    const lifeSpan = 1750 - Math.random() * (1750 / 15);
                    spawnRelativeClass(ShotgunBullet, this.tank, this.tank.pos, this.tank.angle, { x: this.barrelLength, y: randomBulletBarrelPosY }, randomBulletAngleOffset, bulletSpeed, 1, lifeSpan);
                }
            }
        }
    }

    release() {
        this.isCharging = false;
        this.isReadyToFire = false; // Stop firing when button is released
    }
    
    renderTurret(ctx) {
        let turretSize = { width: this.tank.size.length * 0.7, height: this.tank.size.width / 3 };
        drawRect(ctx, { x: 0, y: -turretSize.height / 2 }, turretSize,this.tank.color, "black", 5);
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
        spawnRelativeClass(ShrapnelBomb, this.tank, this.tank.pos, this.tank.angle, { x: this.tank.size.width, y: 0 }, 0, bulletSpeed, 1);
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }
    
    renderTurret(ctx) {
        let turretSize = { width: this.barrelLength, height: this.barrelWidth };
        drawRect(ctx, { x: 0, y: -turretSize.height / 2 }, turretSize,this.tank.color, "black", 5);
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
        spawnRelativeClass(Shrapnel, this.tank, this.tank.pos, this.tank.angle, { x: this.tank.size.width, y: 0 }, randomBulletAngleOffset, 500 * (randomNumber + 0.5), 1);
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }

    renderTurret(ctx) {
        let turretSize = { width: this.tank.size.length * 0.7, height: this.tank.size.width / 3 };
        drawRect(ctx, { x: 0, y: -turretSize.height / 2 }, turretSize,this.tank.color, "black", 5);
    }
}

export class ChainShotgunBOOM extends Weapon {
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
                const spawnPos = { x: this.tank.size.width, y: 0 };

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
                    spawnRelativeClass(ShrapnelBomb, this.tank, this.tank.pos, this.tank.angle, { x: this.tank.size.width, y: 0 }, randomBulletAngleOffset, bulletSpeed, 1, lifeSpan);
                }
            }
        }
    }

    release() {
        this.isCharging = false;
        this.isReadyToFire = false; // Stop firing when button is released
    }

    renderTurret(ctx) {
        // Draw the base of the chaingun turret
        let turretSize = { width: this.tank.size.length * 0.7, height: this.tank.size.width / 4 };
        let dynColor = this.tank.color
        if (this.tank.globalKeys[this.tank.controls.shoot]) {
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
    }

    // renderTurret(ctx) {
    //     let turretSize = { width: this.tank.size.length * 0.7, height: this.tank.size.width / 3 };
    //     drawRect(ctx, { x: 0, y: -turretSize.height / 2 }, turretSize * 10 ,this.tank.color, "black", 5);
    // }
}

export class OppenheimerBOOOM extends Weapon {
    constructor(tank) {
        super(tank);
        this.barrelLength = this.tank.size.length * 0.7;
    }

    press() {
        const tileSize = getGlobalVariable("tileSize");
        const bulletSpeed = tileSize * 1.8;
        spawnRelativeClass(OppenheimerBullet, this.tank, this.tank.pos, this.tank.angle, {x: this.barrelLength, y: 0}, 0, bulletSpeed, this.tank.scale);
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }

    renderTurret(ctx) {
        // Barrel
        const length = this.tank.size.length * 0.7;
        const width = this.tank.size.width / 5;
        const x = 0;
        const y = -width / 2;
        drawRect(ctx, { x: x, y: y }, { width: length, height: width }, this.tank.color, "black", 5);

        // Dome
        const domeRadius = this.tank.size.width / 3;
        drawCircle(ctx, { x: 0, y: 0 }, domeRadius, "black", "black", 5);
        drawCircle(ctx, { x: 0, y: 0 }, domeRadius * 0.8, "yellow");
        for (let i = 0; i < 3; i++) {
            let triangleAngle = Math.PI * 2 / 3 * i;
            let trianglePosRadius = -domeRadius * 0.55
            let trianglePos = { x: trianglePosRadius * Math.cos(triangleAngle) , y: trianglePosRadius * Math.sin(triangleAngle) };
            drawRegPolygon(ctx, trianglePos, domeRadius * 0.55, 3, triangleAngle, "#000"); // Triangle
        }
        drawCircle(ctx, { x: 0, y: 0 }, domeRadius * 0.2, "black", "black", 5);
        drawCircle(ctx, { x: 0, y: 0 }, domeRadius * 0.1, "yellow");
    }
}