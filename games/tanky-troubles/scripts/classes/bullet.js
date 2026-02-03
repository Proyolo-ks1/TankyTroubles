import { getGlobal } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawRegPolygon, drawLine, drawVectorArrow} from '../utils/graphics-utils.js';
import { spawnRelativeClass as spawnClassRelatively } from './spawner.js';
import { PhysicsObject } from './entity.js';
import { randomSeeded } from "../utils/math-utils.js";






//      |==================|
//      |      BULLET      |
//      |==================|



// MARK: Bullet
// Bullet class (base class for all types of bullets)
class Bullet extends PhysicsObject {
    static nextId = 0;

    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 1, scale = 1, angleVel = 0, lifeSpan = -1) {
        super({ // PhysicsObject
            pos: posSpawn,
            vel: { x: Math.cos(angleSpawn) * spawnSpeed, y: Math.sin(angleSpawn) * spawnSpeed },
            angle: angleSpawn,
            angleVel: angleVel,
            lifeSpan: lifeSpan,
        });
        this.name = `Bullet ${Bullet.nextId}`;
        this.shortName = `b${Bullet.nextId++}`;
        this.owner = owner;

        this.size = scale * (1 / 12);
        this.active = true;

        getGlobal().entities.bullets.unshift(this);
    }

    render(ctx, gameDeltaTime) {
        // Default bullet rendering, can be overridden
    }

    debugrender(ctx, gameDeltaTime) {
        if (this.active) {
            // Velocity Arrow
            drawVectorArrow(ctx, this.pos, this.vel, "#0000FF", 0.02);

            // Heading Line
            const headingLength = 1;
            let headingX = this.pos.x + Math.cos(this.angle) * headingLength;
            let headingY = this.pos.y + Math.sin(this.angle) * headingLength;

            // Draw the heading line
            drawLine(ctx, this.pos, { x: headingX, y: headingY }, "#FF0000", 0.02); // Red color for the heading line

            // Draw the random indicator
            const randomAngle = (randomSeeded(this.id) - 0.5) * 2 * Math.PI;
            headingX = this.pos.x + Math.cos(randomAngle) * 1.2 * headingLength;
            headingY = this.pos.y + Math.sin(randomAngle) * 1.2 * headingLength;
            drawLine(ctx, this.pos, { x: headingX, y: headingY }, "#4c00ff", 0.02); // Red color for the heading line

            // name
            const text = `${this.shortName}(${this.age.toFixed(2)}/${this.lifeSpan.toFixed(2)})`;
            const textPos = { x: headingX, y: headingY };
            const textStyle = {
                align: "center",
                baseline: "bottom",
                fontSize: 0.15,
                font: "Consolas",
                textColor: "#000000",
                outlineColor: "#ffffff",
                outlineWidth: 0.02
            };

            drawText(ctx, text, textPos, textStyle);

            const renderScale = getGlobal().renderScale
            if (this.active) {
                drawCircle(ctx, this.pos, 1 / renderScale / 2, "#ffffff", "#ffffff");
            }
        }
    }
}

// MARK: DefaultBullet
export class DefaultBullet extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 1.8, scale = 1, angleVel = 0, lifeSpan = -1) {
        super(owner, posSpawn, angleSpawn, spawnSpeed, scale, angleVel, lifeSpan);
        this.type = "default";
        this.size = scale * (1 / 12);
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#000", "#000");
        }
    }
}

// MARK: ChaingunBullet
export class ChaingunBullet extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 1.8, scale = 1, angleVel = 0, lifeSpan = 5.000) {
        super(owner, posSpawn, angleSpawn, spawnSpeed, scale, angleVel, lifeSpan);
        this.type = "chaingun";
        this.size = scale * (1 / 25);
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#333", "#000");
        }
    }
}

// MARK: ShotgunBullet
export class ShotgunBullet extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 1.8, scale = 1, angleVel = 0, lifeSpan = 1.750) {
        super(owner, posSpawn, angleSpawn, spawnSpeed, scale, angleVel, lifeSpan);
        this.type = "shotgun";
        this.size = scale * (1 / 20);
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#000", "#000");
        }
    }
}

// MARK: Shrapnel
export class Shrapnel extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 1.8, scale = 1, angleVel = 0, lifeSpan = 5.000) {
        super(owner, posSpawn, angleSpawn, spawnSpeed, scale, angleVel, lifeSpan);
        this.type = "shrapnel";
        this.size = scale * (1 / 20);
        this.randomSpin = (Math.random() - 0.5) * 0.2; // gives value between -0.1 and +0.1
    }

    update(gameDeltaTime) {
        super.update(gameDeltaTime);
        this.angle += this.randomSpin;
        this.randomSpin *= 0.99;
        this.vel.x *= 0.99;
        this.vel.y *= 0.99;
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawRegPolygon(ctx, this.pos, this.size / 2, 3, this.angle, "#000", "#000"); // Triangle
        }
    }
}

// MARK: ShrapnelBomb
export class ShrapnelBomb extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 1.8, scale = 1, angleVel = 0, lifeSpan = 1.000) {
        super(owner, posSpawn, angleSpawn, spawnSpeed, scale, angleVel, lifeSpan);
        this.type = "shrapnel";
        this.size = scale * (1 / 8);
    }

    update(gameDeltaTime) {
        super.update(gameDeltaTime);
        // this.angle += 0.05
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
            const lifeSpan = 3000 - Math.random() * (3000 / 2);
            spawnClassRelatively(Shrapnel, this, this.pos, this.angle, {x: 0, y: 0}, randomBulletAngleOffset, bulletSpeed, 1, lifeSpan);
        }
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawRegPolygon(ctx, this.pos, this.size / 2, 5, this.angle, "#000", "#000"); // Pentagon
        }
    }
}

// MARK: FireBullet
export class FireBullet extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 1.8, scale = 1, angleVel = 0, lifeSpan = 5.000) {
        super(owner, posSpawn, angleSpawn, spawnSpeed, scale, angleVel, lifeSpan);
        this.type = "fire";
        this.size = scale * (1 / 12);
        this.color = "#FFA500";
        this.alpha = 1.0;
        this.initialColor = { r: 255, g: 165, b: 0 };
        this.currentColor = { ...this.initialColor };
    }

    update(gameDeltaTime) {
        super.update(gameDeltaTime);
        this.size *= 1.004;
        this.vel.x *= 0.99;
        this.vel.y *= 0.99;

        // Gradually decrease the color towards black
        
        const fadeDurationColor = 2; // seconds to fade from full to black
        const fadeDurationAlpha = this.lifeSpan / 1000; // seconds to fade from full to black
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
            drawCircle(ctx, this.pos, this.size / 2, this.color);
        }
    }
}

// MARK: HomingMissle
export class HomingMissle extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 1.8, scale = 1, angleVel = 0, lifeSpan = 5.000) {
        super(owner, posSpawn, angleSpawn, spawnSpeed, scale, angleVel, lifeSpan);
        this.type = "fire";
        this.size = scale * 25;
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#ffffff", "#000");
        }
    }
}

// MARK: OppenheimerBullet
export class OppenheimerBullet extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 1.8, scale = 1, angleVel = 0, lifeSpan = 1.000) {
        super(owner, posSpawn, angleSpawn, spawnSpeed, scale, angleVel, lifeSpan);
        this.type = "fire";
        this.size = scale / 6;
    }

    update(realDeltaTime) {
        super.update(realDeltaTime);
        this.size *= 1.000;
        this.vel.x *= 0.999;
        this.vel.y *= 0.999;
    }
    
    destroy() {
        super.destroy();
        let bulletSpeed = 1;
        
        // Left at -45 degreesq
        spawnClassRelatively(OppenheimerNeutron, this, this.pos, this.angle, { x: 0, y: 0 }, -Math.PI / 4, bulletSpeed, 1, this.lifeSpan);

        // Right at +45 degrees
        spawnClassRelatively(OppenheimerNeutron, this, this.pos, this.angle, { x: 0, y: 0 }, Math.PI / 4, bulletSpeed, 1, this.lifeSpan);
}

    render(ctx, realDeltaTime) {
        if (this.active) {
            const radius = this.size / 3;
            drawCircle(ctx, this.pos, radius, "black", "black", 0.05);
            drawCircle(ctx, this.pos, radius * 0.8, "yellow");
            for (let i = 0; i < 3; i++) {
                let triangleAngle = Math.PI * 2 / 3 * i;
                let trianglePosRadius = -radius * 0.55
                let trianglePos = { x: trianglePosRadius * Math.cos(triangleAngle) , y: trianglePosRadius * Math.sin(triangleAngle) };
                drawRegPolygon(ctx, this.pos + trianglePos, radius * 0.55, 3, triangleAngle, "#000"); // Triangle
            }
            drawCircle(ctx, this.pos, radius * 0.2, "black", "black", 0.05);
            drawCircle(ctx, this.pos, radius * 0.1, "yellow");
        }
    }
}

// MARK: OppenheimerBullet
export class OppenheimerNeutron extends Bullet {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 1.8, scale = 1, angleVel = 0, lifeSpan = 1.000) {
        super(owner, posSpawn, angleSpawn, spawnSpeed, scale, angleVel, lifeSpan);
        this.type = "fire";
        this.size = scale / 8;
    }

    update(gameDeltaTime) {
        super.update(gameDeltaTime);
        this.size *= 1.000;
        this.vel.x *= 0.999;
        this.vel.y *= 0.999;
    }
    
    destroy() {
        super.destroy();
        let bulletSpeed = 1;
        
        // Left at -45 degreesq
        spawnClassRelatively(OppenheimerNeutron, this, this.pos, this.angle, { x: 0, y: 0 }, -Math.PI / 4, bulletSpeed, 1, this.lifeSpan);

        // Right at +45 degrees
        spawnClassRelatively(OppenheimerNeutron, this, this.pos, this.angle, { x: 0, y: 0 }, Math.PI / 4, bulletSpeed, 1, this.lifeSpan);
}

    render(ctx, gameDeltaTime) {
        if (this.active) {
            const radius = this.size / 3;
            drawCircle(ctx, this.pos, radius, "black", "black", 0.05);
        }
    }
}