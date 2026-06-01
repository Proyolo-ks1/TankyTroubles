import { getGlobal, GLOBAL_COLOR_KEYS } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawRegPolygon, drawLine, drawVectorArrow } from '../utils/graphics-utils.js';
import { spawnRelativeClass as spawnClassRelatively } from './spawner.js';
import { PhysicsObject } from './entity.js';
import { randomSeeded, randomRange } from "../utils/math-utils.js";
import { drawRocket } from '../utils/graphics-shapes.js';
import { RocketExhaustParticle } from './particle.js';






//      |==================|
//      |      BULLET      |
//      |==================|



// MARK: Bullet
// Bullet class (base class for all types of bullets)
class Bullet extends PhysicsObject {
    static nextId = 0;
    constructor(
        owner,
        posSpawn = { x: 0, y: 0 },
        angleSpawn = 0,
        scaleSpawn = 1,
        speedSpawn = 1,
        angleVel = 0,
        lifeSpan = -1
    ) {
        super({ // PhysicsObject
            pos: posSpawn,
            vel: { x: Math.cos(angleSpawn) * speedSpawn, y: Math.sin(-angleSpawn) * speedSpawn },
            angle: angleSpawn,
            angleVel: angleVel,
            lifeSpan: lifeSpan,
        });
        this.name = `Bullet ${Bullet.nextId}`;
        this.shortName = `b${Bullet.nextId++}`;
        this.owner = owner;
        
        this.scale = scaleSpawn;
        this.radius = 1 / 12 * this.scale;

        this.active = true;

        getGlobal().entities.bullets.unshift(this);
    }

    

    update(gameDeltaTime) {
        super.update(gameDeltaTime);
        // Nothing
    }

    destroy() {
        super.destroy();
        // Nothing
        
        // TEMP DEBUGGING
        // drawCircle(ctx, this.pos, 1 / 2, "#ffffff", "#ffffff");
    }
    
    render(ctx, gameDeltaTime) {
        // Nothing
    }
    
    debugrender(ctx, gameDeltaTime) {
        if (this.active) {
            
            const renderScale = getGlobal().renderScale

            // Velocity Arrow
            drawVectorArrow(ctx, this.pos, this.vel, "#0000FF", 0.02);
            
            // Heading Line
            const headingLength = 1;
            let headingX = this.pos.x + Math.cos(this.angle) * headingLength;
            let headingY = this.pos.y + Math.sin(-this.angle) * headingLength;
            
            // Draw the heading line
            drawLine(ctx, this.pos, { x: headingX, y: headingY }, "#FF0000", 0.02); // Red color for the heading line
            
            // Draw the random indicator
            const randomAngle = (randomSeeded(this.id) - 0.5) * 2 * Math.PI;
            headingX = this.pos.x + Math.cos(randomAngle) * 1.2 * headingLength;
            headingY = this.pos.y + Math.sin(-randomAngle) * 1.2 * headingLength;
            drawLine(ctx, this.pos, { x: headingX, y: headingY }, "#4c00ff", 0.02); // Red color for the heading line

            // name
            const text = `${this.shortName}(${this.age.toFixed(2)}/${this.lifeSpan.toFixed(2)})`;
            const textPos = { x: headingX, y: headingY };
            const textStyle = {
                align: "center",
                baseline: "bottom",
                fontSize: 16 / renderScale, //px
                font: "Consolas",
                textColor: "#000000",
                outlineColor: "#ffffff",
                outlineWidth: 2 / renderScale, //px
            };

            drawText(ctx, text, textPos, textStyle);

            if (this.active) {
                drawCircle(ctx, this.pos, 1 / 2, "#ffffff", "#ffffff");
            }
        }
    }
}

// MARK: DefaultBullet
export class DefaultBullet extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1.8, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "DefaultBullet";
        this.scale = scaleSpawn;
        this.radius = 1 / 12 * this.scale;
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.radius / 2, "#000", "#000");
        }
    }
}

// MARK: ChaingunBullet
export class ChaingunBullet extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1.8, angleVel = 0, lifeSpan = 5.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "ChaingunBullet";
        this.scale = scaleSpawn;
        this.radius = 1 / 25 * this.scale;
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.radius / 2, "#333", "#000");
        }
    }
}

// MARK: ShotgunBullet
export class ShotgunBullet extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1.8, angleVel = 0, lifeSpan = 1.750) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "ShotgunBullet";
        this.scale = scaleSpawn;
        this.radius = 1 / 20 * this.scale;
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.radius / 2, "#000", "#000");
        }
    }
}

// MARK: Shrapnel
export class Shrapnel extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1.8, angleVel = (Math.random() - 0.5) * 0.2, lifeSpan = 5.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "Shrapnel";
        this.scale = scaleSpawn;
        this.radius = 1 / 20 * this.scale;
    }

    update(gameDeltaTime) {
        super.update(gameDeltaTime);
        this.angle += this.angleVel * gameDeltaTime;
        // this.angleVel *= 1 - 0.9 * gameDeltaTime;
        this.vel.x *= 1 - 0.5 * gameDeltaTime;
        this.vel.y *= 1 - 0.5 * gameDeltaTime;
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawRegPolygon(ctx, this.pos, this.radius / 2, 3, this.angle, "#000", "#000"); // Triangle
        }
    }
}

// MARK: ShrapnelBomb
export class ShrapnelBomb extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1.8, angleVel = 0, lifeSpan = 1.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "ShrapnelBomb";
        this.scale = scaleSpawn;
        this.radius = 1 / 8 * this.scale;
    }

    update(gameDeltaTime) {
        super.update(gameDeltaTime);
    }

    destroy() {
        super.destroy();
        const numShrepnal = 30;
        const spreadAngle = 360; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);

        for (let i = 0; i < numShrepnal; i++) {

            // Randomize the angle offset for each bullet
            const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
            const bulletSpeed = 1 + Math.random() * 0.5;
            const lifeSpan = 3.000 - Math.random() * (3.000 / 2);
            spawnClassRelatively(Shrapnel, this, this.pos, this.angle, this.scale, {x: 0, y: 0}, randomBulletAngleOffset, bulletSpeed, 1, lifeSpan);
        }
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawRegPolygon(ctx, this.pos, this.radius / 2, 5, this.angle, "#000", "#000"); // Pentagon
        }
    }
}

// MARK: FireBullet
export class FireBullet extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1.8, angleVel = 0, lifeSpan = 5.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "FireBullet";
        this.scale = scaleSpawn;
        this.radius = 1 / 12 * this.scale;

        this.color = "#FFA500";
        this.alpha = 1.0;
        this.initialColor = { r: 255, g: 165, b: 0 };
        this.currentColor = { ...this.initialColor };
    }

    update(gameDeltaTime) {
        super.update(gameDeltaTime);
        if (this.lifeSpan != -1) {
            this.radius *= 1 + 0.5 * gameDeltaTime;
        }
        this.vel.x *= 1 - 0.9 * gameDeltaTime;
        this.vel.y *= 1 - 0.9 * gameDeltaTime;

        // Gradually decrease the color towards black
        const fadeDurationColor = 2.000; // seconds to fade from full to black
        const fadeDurationAlpha = this.lifeSpan / 1.000; // seconds to fade from full to black
        const fadePerSecondColor = 255 / fadeDurationColor;
        const fadePerSecondAlpha = 1 / fadeDurationAlpha;
        const fadeAmountColor = fadePerSecondColor * gameDeltaTime;
        const fadeAmountAlpha = fadePerSecondAlpha * gameDeltaTime;

        // Decrease RGB components to simulate fading to black
        this.currentColor.r = Math.max(this.currentColor.r - fadeAmountColor, 0);
        this.currentColor.g = Math.max(this.currentColor.g - fadeAmountColor, 0);
        this.currentColor.b = Math.max(this.currentColor.b - fadeAmountColor, 0);
        this.alpha = Math.max(this.alpha - fadeAmountAlpha, 0);

        // Update color in hex format
        this.color = `rgba(
            ${Math.round(this.currentColor.r)},
            ${Math.round(this.currentColor.g)},
            ${Math.round(this.currentColor.b)},
            ${this.alpha})`;
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.radius / 2, this.color);
        }
    }
}

// MARK: HomingMissle
export class HomingMissle extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1, angleVel = 0, lifeSpan = 5.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "HomingMissle";
        this.scale = scaleSpawn;
        this.radius = 1 / 4 * this.scale;

        this.exhaustsPerSecond = 50
        this.timeSinceLastExhaust = 0;
        this.color = this.owner.color;
    }

    update(gameDeltaTime) {
        super.update(gameDeltaTime);

        const speedCap = 5;
        const accel = 5; // how much impact does direction have on 
        const thrust = 2;

        // --- target velocity from heading ---
        const targetVel = {
            x: Math.cos(this.angle) * thrust,
            y: -Math.sin(this.angle) * thrust
        };

        // --- steer velocity toward target (smooth drift) ---
        this.vel.x += (targetVel.x - this.vel.x) * accel * gameDeltaTime;
        this.vel.y += (targetVel.y - this.vel.y) * accel * gameDeltaTime;

        // --- speed cap ---
        const speed = Math.hypot(this.vel.x, this.vel.y);
        if (speed > speedCap) {
            const scale = speedCap / speed;
            this.vel.x *= scale;
            this.vel.y *= scale;
        }

        // optional rotation
        this.angle += this.age * gameDeltaTime;


        // --- spawn x times per second ---
        this.timeSinceLastExhaust += gameDeltaTime;
        const spawnCooldown = 1 / this.exhaustsPerSecond; // seconds per spawn

        while (this.timeSinceLastExhaust >= spawnCooldown) {
            this.timeSinceLastExhaust -= spawnCooldown;

            // position will have to be a bit behin the rockets direction and speed away from the rockets direciton. (TODO)
            spawnClassRelatively(
                // TODO: might implement prediction here based on current speed incase there is multiple particles spawns per update() because of low fps.
                RocketExhaustParticle,
                this,
                this.pos,
                this.angle + randomRange(-0.2, 0.2),
                this.scale * randomRange(0.9, 1.1),
                { x: 0, y: 0 },
                0,
                -1 + randomRange(-0.2, 0.2),
                0,
                undefined,
            );
        }
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawRocket(ctx, this.pos, this.angle, this.scale, this.color)
        }
    }
}

// MARK: OppenheimerBullet
export class OppenheimerBullet extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1.8, angleVel = 0, lifeSpan = 2) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "OppenheimerBullet";
        this.scale = scaleSpawn;
        this.radius = 1 / 6 * this.scale;
    }

    update(gameDeltaTime) {
        super.update(gameDeltaTime);
        this.vel.x *= 1 - 0.9 * gameDeltaTime;
        this.vel.y *= 1 - 0.9 * gameDeltaTime;
    }
    
    destroy() {
        super.destroy();
        let bulletSpeed = 1;
        
        // Left at -45 degrees
        spawnClassRelatively(OppenheimerNeutron, undefined, this.pos, this.angle, 1, { x: 0, y: 0 }, -Math.PI / 2, bulletSpeed, 0, undefined);

        // Right at +45 degrees
        spawnClassRelatively(OppenheimerNeutron, undefined, this.pos, this.angle, 1, { x: 0, y: 0 }, Math.PI / 2, bulletSpeed, 0, undefined);
}

    render(ctx, realDeltaTime) {
        if (this.active) {
            drawRocket(ctx, this.pos, this.angle, this.scale, this.color)
            const radius = this.radius / 3;
            drawCircle(ctx, this.pos, radius, "#000");
            drawCircle(ctx, this.pos, radius * 0.8, GLOBAL_COLOR_KEYS.ATOMIC_YELLOW);
            for (let i = 0; i < 3; i++) {
                let triangleAngle = Math.PI / 2 + Math.PI * 2 / 3 * i;
                let triangleRotAngle = triangleAngle + Math.PI;
                let trianglePosRadius = radius * 0.55;
                let trianglePos = { x: this.pos.x + trianglePosRadius * Math.cos(triangleAngle) , y: this.pos.y + trianglePosRadius * Math.sin(-triangleAngle) };
                drawRegPolygon(ctx, trianglePos, trianglePosRadius, 3, triangleRotAngle, "#000000");
            }
            drawCircle(ctx, this.pos, radius * 0.25, "#000");
            drawCircle(ctx, this.pos, radius * 0.15, GLOBAL_COLOR_KEYS.ATOMIC_YELLOW);
        }
    }
}

// MARK: OppenheimerNeutron
export class OppenheimerNeutron extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1.8, angleVel = 0, lifeSpan = 0.5) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "OppenheimerNeutron";
        this.scale = scaleSpawn;
        this.radius = 1 / 8 * this.scale;
    }

    update(gameDeltaTime) {
        super.update(gameDeltaTime);
        this.vel.x *= 1 - 0.9 * gameDeltaTime;
        this.vel.y *= 1 - 0.9 * gameDeltaTime;
    }
    
    destroy() {
        super.destroy();
        let bulletSpeed = 1;
        const relAngle = randomBulletAngleOffset + 0.2 * Math.sin(-this.tank.age / 50);
        
        // Left at -45 degrees
        spawnClassRelatively(OppenheimerNeutron, undefined, this.pos, this.angle, 1, { x: 0, y: 0 }, -Math.PI / 4, bulletSpeed, 0, undefined);

        // Right at +45 degrees
        spawnClassRelatively(OppenheimerNeutron, undefined, this.pos, this.angle, 1, { x: 0, y: 0 }, Math.PI / 4, bulletSpeed, 0, undefined);
}

    render(ctx, gameDeltaTime) {
        if (this.active) {
            const radius = this.radius / 3;
            drawCircle(ctx, this.pos, radius, "#000");
            drawCircle(ctx, this.pos, radius * 0.8, GLOBAL_COLOR_KEYS.ATOMIC_YELLOW);
            for (let i = 0; i < 3; i++) {
                let triangleAngle = Math.PI / 2 + Math.PI * 2 / 3 * i;
                let triangleRotAngle = triangleAngle + Math.PI;
                let trianglePosRadius = radius * 0.55;
                let trianglePos = { x: this.pos.x + trianglePosRadius * Math.cos(triangleAngle) , y: this.pos.y + trianglePosRadius * Math.sin(-triangleAngle) };
                drawRegPolygon(ctx, trianglePos, trianglePosRadius, 11, triangleRotAngle, "#000000");
            }
            drawCircle(ctx, this.pos, radius * 0.25, "#000");
            drawCircle(ctx, this.pos, radius * 0.15, GLOBAL_COLOR_KEYS.ATOMIC_YELLOW);
        }
    }
}