import { getGlobal, GLOBAL_COLOR_KEYS } from '../global-state.js';
import { BULLETS } from './bullet.js';
import { spawnClassRelatively } from './spawner.js';
import { drawRect, drawVertexPolygon, drawCircle, drawText, drawLine, drawRegPolygon, drawVectorArrow} from '../utils/graphics-utils.js';
import { Vec2 } from "../utils/math-utils.js";

// RunningGameApi
const gameApi = document.getElementById("game-container").runningGameApi;

// References
const globalKeys = gameApi.globalKeys





//      |===================|
//      |      POWERUPS     |
//      |===================|


// MARK: Weapon
class Weapon {
    constructor(tank) {
        this.tank = tank;
    }

    press() {
        // Default press behavior, can be overridden
        // console.log(`PRESS`);
    }

    hold() {
        // Default hold behavior, can be overridden
        // console.log(`HOLD`);
    }

    release() {
        // Default release behavior, can be overridden
        // console.log(`RELEASE`);
    }

    renderTurret(ctx, realDeltaTime) {
        // Default turret rendering, can be overridden
    }
}

// MARK: NoWeapon
class NoWeapon extends Weapon {
    constructor(tank) {
        super(tank);
        this.barrelLength = this.tank.length * 0.7;
    }

    press() {
        const bulletSpeed = 1.8 // tiles per second
        spawnClassRelatively(BULLETS.default, this.tank, this.tank.pos, this.tank.angle, this.tank.scale, new Vec2(this.barrelLength, 0), 0, bulletSpeed, 0, 10.000);
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }

    renderTurret(ctx, realDeltaTime) {
        // Barrel
        const barrelLength = this.tank.length * 0.7;
        const barrelWidth = this.tank.width * 4 / 15;
        const x = 0;
        const y = -barrelWidth / 2;
        drawRect(ctx, { x: x, y: y }, { w: barrelLength, h: barrelWidth }, this.tank.color, "black", 0.02);

        // Dome
        const domeRadius = this.tank.width / 3;
        drawCircle(ctx, new Vec2(), domeRadius, this.tank.color, "black", 0.02);
    }
}

// MARK: Chaingun
class Chaingun extends Weapon {
    constructor(tank) {
        super(tank);
        this.barrelLength = this.tank.length * 0.7;

        this.isCharging = false;
        this.timeSinceChargeStarted = 0; // Time since charging started
        this.isReadyToFire = false; // Tracks whether the chaingun is ready to fire

        this.fireRate = 10; // Bullets per second
        this.fireRateCooldown = 1 / this.fireRate; // Time between shots in seconds
        this.timeSinceLastShot = 0; // Tracks time since last bullet
        this.chargeTime = 1; // Time (in seconds) to charge before firing
        this.barrelRotation = 0;
    }

    press() {
        // Start charging the chaingun when the button is pressed
        this.isCharging = true;
        this.timeSinceChargeStarted = 0; // Reset charge time
        this.isReadyToFire = false; // Reset firing state
    }

    hold(realDeltaTime) {
        if (!this.isCharging) return;

        const spreadAngle = 10;// Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);

        // Accumulate time since charge started
        this.timeSinceChargeStarted += realDeltaTime;

        // Start firing only after charge time has passed
        if (this.timeSinceChargeStarted >= this.chargeTime) {
            this.isReadyToFire = true;
        }

        // If ready to fire, continue shooting
        if (this.isReadyToFire) {
            this.timeSinceLastShot += realDeltaTime; // Accumulate time for rapid fire

            while (this.timeSinceLastShot > this.fireRateCooldown) {
                this.timeSinceLastShot -= this.fireRateCooldown; // Reduce accumulated time

                // Calculate compensation distance
                const extraTravelTime = this.timeSinceLastShot; // Time bullet is "late"
                const bulletSpeed = 2.75; // tiles per second
                const extraDistance = bulletSpeed * extraTravelTime;

                // Get initial bullet position
                const spawnPos = new Vec2(this.barrelLength, 0);

                const angle = this.tank.angle;
                const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;

                // Move bullet forward to compensate for delay
                const compensatedPos = spawnPos.add(
                    Vec2.fromAngle(angle, extraDistance)
                );

                // Fire the bullet at the corrected position
                spawnClassRelatively(BULLETS.chaingun, this.tank, this.tank.pos, this.tank.angle, this.tank.scale, compensatedPos, randomBulletAngleOffset, bulletSpeed);
            }
        }
    }

    release() {
        this.isCharging = false;
        this.isReadyToFire = false; // Stop firing when button is released
    }

    renderTurret(ctx, realDeltaTime) {
        
        // Dome
        const domeRadius = this.tank.width / 3;
        drawCircle(ctx, new Vec2(), domeRadius, this.tank.color, "black", 0.02);

        // Draw the base of the chaingun turret
        let turretSize = { w: this.tank.length * 0.7, h: this.tank.width * 4 / 15 };
        let turretColor = this.tank.color
        if (globalKeys[this.tank.controls.shoot]) {
            turretColor = "orange"
            this.barrelRotation += 60 * this.fireRate * realDeltaTime;
            this.barrelRotation %= 60;
        }
        drawRect(ctx, { x: 0, y: -turretSize.h / 2 }, turretSize, turretColor, "black", 0.02);
    
        // Calculate barrel dimensions
        const barrelWidthDefault = this.tank.width * 4 / 15;
        const subBarrelWidth = turretSize.w / 2;
        const subBarrelHeight = barrelWidthDefault / 3;
    
        // Draw barrels spaced evenly across the turret
        const barrelAngles = [0, 180, 120, 60];
        for (let i = 0; i < 4; i++) {
            const barrelAngle = this.barrelRotation
            const flipped = this.barrelRotation < 30 ? 0 : 1;
            const flippedAngle = 30 - Math.abs(30 - barrelAngle);
            const barrelPositionX = Math.cos((flippedAngle + barrelAngles[i]) * Math.PI / 180) * (flipped === 0 ? 1 : -1);
            const barrelPositionY = Math.sin((flippedAngle + barrelAngles[i]) * Math.PI / 180);
            const barrelY = barrelPositionX * (barrelWidthDefault - subBarrelHeight) * 0.5 - subBarrelHeight * 0.5;
            const barrelPos = new Vec2(turretSize.w / 2, barrelY);
            
            const min = 0;
            const max = 200;
            const gray = Math.round(min + (barrelPositionY + 1) * 0.5 * (max - min));
            let barrelColor = `rgb(${gray}, ${gray}, ${gray})`;

            // paint sketch demo
            const showPaintSketchDemo = false;
            if (showPaintSketchDemo && this.tank.shortName === 't1') {
                console.log(`barrelPositionX: ${barrelPositionX.toFixed(2)}, barrelPositionY: ${barrelPositionY.toFixed(2)}`);
                if (i === 0) {
                    barrelColor = `#22B14C`;
                }
                if (i === 1) {
                    barrelColor = `#FFF200`;
                }
                if (i === 2) {
                    barrelColor = `#FF7F27`;
                }
                if (i === 3) {
                    barrelColor = `#ED1C24`;
                }
            }
            drawRect(ctx, barrelPos, { w: subBarrelWidth, h: subBarrelHeight }, barrelColor, "black", 0.005); // thinner outline for barrels
        }
    }
}

// MARK: Shotgun
class Shotgun extends Weapon {
    constructor(tank) {
        super(tank);
        this.barrelLength = this.tank.length * 0.7;
        this.barrelWidth = this.tank.width / 3
    }

    press() {
        const numBullets = 20;
        const spreadAngle = 20; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);
        
        for (let i = 0; i < numBullets; i++) {

            // Randomize the angle offset for each bullet
            const randomBulletBarrelPos = new Vec2(this.barrelLength, this.barrelWidth * (Math.random() - 0.5));
            const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
            const bulletSpeed = 3.0 + Math.random() * 0.5; // tiles per second
            const lifeSpan = 1.750 - Math.random() * (1.750 / 15);
            spawnClassRelatively(BULLETS.shotgun, this.tank, this.tank.pos, this.tank.angle, this.tank.scale, randomBulletBarrelPos, randomBulletAngleOffset, bulletSpeed, 0, lifeSpan);
        }
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }

    renderTurret(ctx, realDeltaTime) {
        // Barrel
        const length = this.barrelLength
        const width = this.barrelWidth
        const x = 0;
        const y = -width / 2;
        drawRect(ctx, { x: x, y: y }, { w: length, h: width }, this.tank.color, "black", 0.02);
    }
}

// MARK: FlameThrower
class FlameThrower extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
        this.turretSize = { w: this.tank.length * 0.7, h: this.tank.width / 3 };
    }

    press() {
        // empty
    }

    hold() {
        const spreadAngle = 20; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);

            // Randomize the angle offset for each bullet
            const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
            const bulletSpeed = 3.0 + Math.random() * 0.5 * this.tank.radius; // tiles per second
            const lifeSpan = 5.000 - Math.random() * (2.500); // 2500-7500 ms
            const relPos = new Vec2(this.turretSize.w, 0);
            // const nozzleSin = 0.1 * Math.sin(-this.tank.age * 80)
            // console.log(`nozzleSin: ${nozzleSin}`)
            const relAngle = randomBulletAngleOffset; // + nozzleSin;
            spawnClassRelatively(BULLETS.fire, this.tank, this.tank.pos, this.tank.angle, this.tank.scale, relPos, relAngle, bulletSpeed, 0, lifeSpan);
    }

    release() {
        // empty
    }

    renderTurret(ctx, realDeltaTime) {
        drawRect(ctx, { x: 0, y: -this.turretSize.h / 2 }, this.turretSize, "#FFA500", "black", 0.05);
        const customShape = [
            new Vec2(50, 0),
            new Vec2(100, 50),
            new Vec2(75, 100),
            new Vec2(25, 75),
        ];
        
        const pos = new Vec2(100, 100);  // Position where the shape will be drawn
        const angle = 45;  // Rotation in degrees
        
        drawVertexPolygon(ctx, pos, angle, customShape, "aqua", "black", 0.05);
    }
}

// MARK: ChainShotgun
class ChainShotgun extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.isReadyToFire = false;
        this.fireRate = 20;
        this.fireRateCooldown = 1 / this.fireRate;
        this.timeSinceLastShot = 0;
        this.chargeTime = 0.5;
        this.timeSinceChargeStarted = 0;

        this.barrelLength = this.tank.length * 0.7;
        this.barrelWidth = this.tank.width / 3;
        this.barrelRotation = 0;
    }

    press() {
        // Start charging the chaingun when the button is pressed
        this.isCharging = true;
        this.timeSinceChargeStarted = 0;
        this.isReadyToFire = false;
    }

    hold(realDeltaTime) {
        if (!this.isCharging) return;

        // Accumulate time since charge started
        this.timeSinceChargeStarted += realDeltaTime;

        // Start firing only after charge time has passed
        if (this.timeSinceChargeStarted >= this.chargeTime) {
            this.isReadyToFire = true;
        }

        // If ready to fire, continue shooting
        if (this.isReadyToFire) {
            this.timeSinceLastShot += realDeltaTime; // Accumulate time for rapid fire

            while (this.timeSinceLastShot > this.fireRateCooldown) {
                this.timeSinceLastShot -= this.fireRateCooldown; // Reduce accumulated time

                // Calculate compensation distance
                const extraTravelTime = this.timeSinceLastShot; // Time bullet is "late"
                const bulletSpeed = 2.75; // tiles per second
                const extraDistance = bulletSpeed * extraTravelTime;

                // Get initial bullet position
                const spawnPos = new Vec2(this.tank.width, 0);

                // Move bullet forward to compensate for delay
                const angle = this.tank.angle;
                const compensatedPos = spawnPos.add(Vec2.fromAngle(angle, extraDistance))

                const numBullets = 20;
                const spreadAngle = 20; // Spread angle in degrees
                const spreadAngleRadians = spreadAngle * (Math.PI / 180);
                
                for (let i = 0; i < numBullets; i++) {

                    // Randomize the angle offset for each bullet
                    const randomBulletBarrelPos = new Vec2(this.barrelLength, this.barrelWidth * (Math.random() - 0.5));
                    const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
                    const bulletSpeed = 3.0 + Math.random() * 0.5; // tiles per second
                    const lifeSpan = 1.750 - Math.random() * (1.750 / 15);
                    spawnClassRelatively(BULLETS.shotgun, this.tank, this.tank.pos, this.tank.angle, this.tank.scale, randomBulletBarrelPos, randomBulletAngleOffset, bulletSpeed, 0, lifeSpan);
                }
            }
        }
    }

    release() {
        this.isCharging = false;
        this.isReadyToFire = false; // Stop firing when button is released
    }
    
    renderTurret(ctx, realDeltaTime) {
        
        // Dome
        const domeRadius = this.tank.width / 3;
        drawCircle(ctx, new Vec2(), domeRadius, this.tank.color, "black", 0.02);

        // Draw the base of the chaingun turret
        let turretSize = { w: this.tank.length * 0.7, h: this.tank.width * 4 / 15 };
        let turretColor = this.tank.color
        if (globalKeys[this.tank.controls.shoot]) {
            turretColor = "orange"
            this.barrelRotation += 60 * this.fireRate * realDeltaTime;
            this.barrelRotation %= 60;
        }
        drawRect(ctx, { x: 0, y: -turretSize.h / 2 }, turretSize, turretColor, "black", 0.02);
    
        // Calculate barrel dimensions
        const barrelWidthDefault = this.tank.width * 4 / 15;
        const subBarrelWidth = turretSize.w / 2;
        const subBarrelHeight = barrelWidthDefault / 3;
    
        // Draw barrels spaced evenly across the turret
        const barrelAngles = [0, 180, 120, 60];
        for (let i = 0; i < 4; i++) {
            const barrelAngle = this.barrelRotation
            const flipped = this.barrelRotation < 30 ? 0 : 1;
            const flippedAngle = 30 - Math.abs(30 - barrelAngle);
            const barrelPositionX = Math.cos((flippedAngle + barrelAngles[i]) * Math.PI / 180) * (flipped === 0 ? 1 : -1);
            const barrelPositionY = Math.sin((flippedAngle + barrelAngles[i]) * Math.PI / 180);
            const barrelY = barrelPositionX * (barrelWidthDefault - subBarrelHeight) * 0.5 - subBarrelHeight * 0.5;
            const barrelPos = new Vec2(turretSize.w / 2, barrelY);
            
            const min = 0;
            const max = 200;
            const gray = Math.round(min + (barrelPositionY + 1) * 0.5 * (max - min));
            let barrelColor = `rgb(${gray}, ${gray}, ${gray})`;
            drawRect(ctx, barrelPos, { w: subBarrelWidth, h: subBarrelHeight }, barrelColor, "black", 0.005); // thinner outline for barrels
        }
    }
}

// MARK: ShrepnalBombWeapon
class ShrepnalBombWeapon extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
        this.turretSize = { w: this.barrelLength, h: this.barrelWidth };
        this.barrelLength = this.tank.length * 0.7;
    }

    press() {
        const bulletSpeed = 1.8 // tiles per second
        spawnClassRelatively(BULLETS.shrapnelBomb, this.tank, this.tank.pos, this.tank.angle, this.tank.scale, new Vec2(this.tank.width, 0), 0, bulletSpeed, 0, 1.000);
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }
    
    renderTurret(ctx, realDeltaTime) {
        // Barrel
        const barrelLength = this.tank.length * 0.7;
        const barrelWidth = this.tank.width / 2.5;
        const x = 0;
        const y = -barrelWidth / 2;
        drawRect(ctx, { x: x, y: y }, { w: barrelLength, h: barrelWidth }, this.tank.color, "black", 0.02);

        // Dome
        const domeRadius = this.tank.width / 3;
        drawCircle(ctx, new Vec2(), domeRadius, this.tank.color, "black", 0.02);
    }
}

// MARK: MissleLauncher
class MissileLauncher extends Weapon {
    constructor(tank) {
        super(tank);
        this.barrelLength = this.tank.length * 0.7;
    }

    press() {
        spawnClassRelatively(BULLETS.homingMissile, this.tank, this.tank.pos, this.tank.angle, this.tank.scale, new Vec2(this.barrelLength, 0), 0, undefined, 0, 10.000);
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }

    renderTurret(ctx, realDeltaTime) {
        // Barrel
        const barrelLength = this.tank.length * 0.7;
        const barrelWidth = this.tank.width * 4 / 15;
        const x = 0;
        const y = -barrelWidth / 2;
        drawRect(ctx, { x: x, y: y }, { w: barrelLength, h: barrelWidth }, this.tank.color, "black", 0.02);

        // Dome
        const domeRadius = this.tank.width / 3;
        drawCircle(ctx, new Vec2(), domeRadius, this.tank.color, "black", 0.02);
    }
}

// MARK: ExperimentalWeapon
class ExperimentalWeapon extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
    }

    press() {
        const spreadAngle = 20; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);

        let randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
        spawnClassRelatively(BULLETS.shrapnel, this.tank, this.tank.pos, this.tank.angle, this.tank.scale, new Vec2(this.tank.width, 0), randomBulletAngleOffset, (Math.random() + 0.5), undefined, 1.000);
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }

    renderTurret(ctx, realDeltaTime) {
        let turretSize = { w: this.tank.length * 0.7, h: this.tank.width / 3 };
        drawRect(ctx, { x: 0, y: -turretSize.h / 2 }, turretSize,this.tank.color, "black", 0.02);
    }
}

// MARK: ChainShotgunBOOM
class ChainShotgunBoom extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.isReadyToFire = false;
        this.fireRate = 20;
        this.fireRateCooldown = 1 / this.fireRate;
        this.timeSinceLastShot = 0;
        this.chargeTime = 0.5;
        this.timeSinceChargeStarted = 0;
        this.barrelRotation = 0;
    }

    press() {
        // Start charging the chaingun when the button is pressed
        this.isCharging = true;
        this.timeSinceChargeStarted = 0;
        this.isReadyToFire = false;
    }

    hold(realDeltaTime) {
        if (!this.isCharging) return;

        // Accumulate time since charge started
        this.timeSinceChargeStarted += realDeltaTime;

        // Start firing only after charge time has passed
        if (this.timeSinceChargeStarted >= this.chargeTime) {
            this.isReadyToFire = true;
        }

        // If ready to fire, continue shooting
        if (this.isReadyToFire) {
            this.timeSinceLastShot += realDeltaTime; // Accumulate time for rapid fire

            while (this.timeSinceLastShot > this.fireRateCooldown) {
                this.timeSinceLastShot -= this.fireRateCooldown; // Reduce accumulated time

                // Calculate compensation distance
                const extraTravelTime = this.timeSinceLastShot; // Time bullet is "late"
                const bulletSpeed = 2.75; // tiles per second
                const extraDistance = bulletSpeed * extraTravelTime;

                // Get initial bullet position
                const spawnPos = new Vec2(this.tank.width, 0);

                // Move bullet forward to compensate for delay
                const angle = this.tank.angle;
                const compensatedPos = spawnPos.add(Vec2.fromAngle(angle, extraDistance))
                const numBullets = 20;
                const spreadAngle = 20; // Spread angle in degrees
                const spreadAngleRadians = spreadAngle * (Math.PI / 180);
                
                for (let i = 0; i < numBullets; i++) {

                    // Randomize the angle offset for each bullet
                    const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
                    const bulletSpeed = 3.0 + Math.random() * 0.5; // tiles per second
                    const lifeSpan = 1.750 - Math.random() * (1.750 / 15);
                    spawnClassRelatively(BULLETS.shrapnelBomb, this.tank, this.tank.pos, this.tank.angle, this.tank.scale, new Vec2(this.tank.width, 0), randomBulletAngleOffset, bulletSpeed, 0, lifeSpan);
                }
            }
        }
    }

    release() {
        this.isCharging = false;
        this.isReadyToFire = false; // Stop firing when button is released
    }

    
    renderTurret(ctx, realDeltaTime) {
        // Draw the base of the chaingun turret
        let turretSize = { w: this.tank.length * 0.7, h: this.tank.width * 4 / 15 };
        let turretColor = this.tank.color
        if (globalKeys[this.tank.controls.shoot]) {
            turretColor = "orange"
            this.barrelRotation += 60 * this.fireRate * realDeltaTime;
            this.barrelRotation %= 60;
        }
        drawRect(ctx, { x: 0, y: -turretSize.h / 2 }, turretSize, turretColor, "black", 0.02);
    
        // Calculate barrel dimensions
        const barrelWidthDefault = this.tank.width * 4 / 15;
        const subBarrelWidth = turretSize.w / 2;
        const subBarrelHeight = barrelWidthDefault / 3;
    
        // Draw barrels spaced evenly across the turret
        const barrelAngles = [0, 180, 120, 60];
        for (let i = 0; i < 4; i++) {
            const barrelAngle = this.barrelRotation
            const flipped = this.barrelRotation < 30 ? 0 : 1;
            const flippedAngle = 30 - Math.abs(30 - barrelAngle);
            const barrelPositionX = Math.cos((flippedAngle + barrelAngles[i]) * Math.PI / 180) * (flipped === 0 ? 1 : -1);
            const barrelPositionY = Math.sin((flippedAngle + barrelAngles[i]) * Math.PI / 180);
            const barrelY = barrelPositionX * (barrelWidthDefault - subBarrelHeight) * 0.5 - subBarrelHeight * 0.5;
            const barrelPos = new Vec2(turretSize.w / 2, barrelY);
            
            const min = 0;
            const max = 200;
            const gray = Math.round(min + (barrelPositionY + 1) * 0.5 * (max - min));
            const barrelColor = `rgb(${gray}, ${gray}, ${gray})`;
            drawRect(ctx, barrelPos, { w: subBarrelWidth, h: subBarrelHeight }, barrelColor, "black", 0.005); // thinner outline for barrels
        }
    }
}

// MARK: OppenheimerBOOOM
export class OppenheimerBOOOM extends Weapon {
    constructor(tank) {
        super(tank);
        this.barrelLength = this.tank.length * 0.7;
    }

    press() {
        const bulletSpeed = 1.8; // tiles per second
        spawnClassRelatively(BULLETS.oppenheimerBullet, this.tank, this.tank.pos, this.tank.angle, this.tank.scale, new Vec2(this.barrelLength, 0), 0, bulletSpeed, 0, undefined);
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }

    renderTurret(ctx, realDeltaTime) {
        // Barrel
        const length = this.tank.length * 0.7;
        const width = this.tank.width / 2;
        const x = 0;
        const y = -width / 2;
        drawRect(ctx, { x: x, y: y }, { w: length, h: width }, GLOBAL_COLOR_KEYS.ATOMIC_YELLOW, "#000", 0.02);

        // Dome
        const domeRadius = this.tank.width / 3;
        drawCircle(ctx, new Vec2(), domeRadius, "#000");
        drawCircle(ctx, new Vec2(), domeRadius * 0.8, GLOBAL_COLOR_KEYS.ATOMIC_YELLOW);
        for (let i = 0; i < 3; i++) {
            let triangleAngle = Math.PI + Math.PI * 2 / 3 * i;
            let triangleRotAngle = triangleAngle + Math.PI;
            let trianglePosRadius = domeRadius * 0.55;
            let trianglePos = new Vec2(trianglePosRadius * Math.cos(triangleAngle) , trianglePosRadius * Math.sin(-triangleAngle));
            drawRegPolygon(ctx, trianglePos, trianglePosRadius, 3, triangleRotAngle, "#000000");
        }
        drawCircle(ctx, new Vec2(), domeRadius * 0.25, "#000");
        drawCircle(ctx, new Vec2(), domeRadius * 0.15, GLOBAL_COLOR_KEYS.ATOMIC_YELLOW);
    }
}

// MARK: RocketBombWeapon
class RocketBombWeapon extends Weapon {
    constructor(tank) {
        super(tank);
        this.isCharging = false;
        this.chargeStartTime = 0;
        this.turretSize = { w: this.barrelLength, h: this.barrelWidth };
        this.barrelLength = this.tank.length * 0.7;
    }

    press() {
        const bulletSpeed = 1.8 // tiles per second
        spawnClassRelatively(BULLETS.rocketBomb, this.tank, this.tank.pos, this.tank.angle, this.tank.scale, new Vec2(this.tank.width, 0), 0, bulletSpeed, 0, 1.000);
    }

    hold() {
        // empty
    }

    release() {
        // empty
    }
    
    renderTurret(ctx, realDeltaTime) {
        // Barrel
        const barrelLength = this.tank.length * 0.7;
        const barrelWidth = this.tank.width / 2.5;
        const x = 0;
        const y = -barrelWidth / 2;
        drawRect(ctx, { x: x, y: y }, { w: barrelLength, h: barrelWidth }, this.tank.color, "black", 0.02);

        // Dome
        const domeRadius = this.tank.width / 3;
        drawCircle(ctx, new Vec2(), domeRadius, this.tank.color, "black", 0.02);
    }
}

// MARK: Export: WEAPONS 

export const WEAPONS = {
    noWeapon: NoWeapon,
    chaingun: Chaingun,
    shotgun: Shotgun,
    flameThrower: FlameThrower,
    chainShotgun: ChainShotgun,
    shrapnelBomb: ShrepnalBombWeapon,
    experimentalWeapon: ExperimentalWeapon,
    chainShotgunBoom: ChainShotgunBoom,
    missileLauncher: MissileLauncher,
    rocketBomb: RocketBombWeapon,
};