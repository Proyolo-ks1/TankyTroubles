import { setGlobalVariable, getGlobalVariable } from '../global-state.js';
import { drawRect, drawCircle, drawRegPolygon, drawLine, drawArrow} from '../graphics-utils.js';
import { Shooter } from './shooter.js';



//      |===================|
//      |      BULLETS      |
//      |===================|



// Bullet class (base class for all types of bullets)
class Bullet extends Shooter {
    static BulletCount = 0;

    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, owner, spawnSpeed = 100, scale = 1, rotationSpeed = 0, arcFactor = 0) {
        super();
        this.id = Bullet.BulletCount++;  // Assign a unique ID to each bullet
        this.pos = posSpawn;
        this.velocity = { x: Math.cos(angleSpawn) * spawnSpeed, y: Math.sin(angleSpawn) * spawnSpeed };
        this.angle = angleSpawn;
        this.rotationSpeed = rotationSpeed;
        this.arcFactor = arcFactor;          // How much the bullet's path curves
        this.owner = owner;
        this.size = scale * 10;
        this.active = true;
        this.creationTime = Date.now();

        // Get current bullets array, add new bullet, and update state
        const bullets = getGlobalVariable("bullets"); 
        bullets.push(this);
        setGlobalVariable("bullets", bullets);
    }

    update(deltaTime) {
        // Position
        this.pos.x += this.velocity.x * deltaTime;
        this.pos.y += this.velocity.y * deltaTime;

        // Rotation - simulate frisbee-like spinning
        this.angle += this.rotationSpeed * deltaTime;

        // Adjusting velocity to simulate arc-like movement
        // Slightly altering the velocity based on the rotation
        let arcAdjustment = this.arcFactor * Math.cos(this.angle);
        this.velocity.x += arcAdjustment;
        this.velocity.y += arcAdjustment;
        

        // Check if bullet's lifespan is over and make it inactive
        if (Date.now() - this.creationTime > this.lifeSpan) {
            this.active = false;
        }
    }



    render(ctx) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#000", "#000");
        }
    }

    debugRender(ctx) {
        if (this.active) {
            // Velocity Arrow
            const endPos = {
                x: this.pos.x + this.velocity.x / 4, 
                y: this.pos.y + this.velocity.y / 4
            };
            drawArrow(ctx, this.pos, endPos, 50, Math.PI / 6, "#0000FF", 2);

            // Heading Line
            const headingLength = 50; // Adjust this value to control the length of the heading line
            const headingX = this.pos.x + Math.cos(this.angle) * headingLength;
            const headingY = this.pos.y + Math.sin(this.angle) * headingLength;

            // Draw the heading line
            drawLine(ctx, this.pos, { x: headingX, y: headingY }, "#FF0000", 2); // Red color for the heading line
        }
    }
}

export class DefaultBullet extends Bullet {
    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, owner, spawnSpeed = 50, scale = 1) {
        super(posSpawn, angleSpawn, owner, spawnSpeed, scale);
        this.type = "default";
        this.size = scale * 25;
        this.lifeSpan = 1500;
    }

    update(deltaTime) {
        super.update(deltaTime);
    }

    render(ctx) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#000", "#000");
        }
    }
}

export class ChaingunBullet extends Bullet {
    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, owner, spawnSpeed = 10, scale = 1) {
        super(posSpawn, angleSpawn, owner, spawnSpeed, scale);
        this.type = "chaingun";
        this.size = scale * 10;
        this.lifeSpan = 1500;
    }

    update(deltaTime) {
        super.update(deltaTime);
    }

    render(ctx) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#333", "#000");
        }
    }
}

export class ShotgunBullet extends Bullet {
    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, owner, spawnSpeed = 10, scale = 1, lifeSpan = 1750) {
        super(posSpawn, angleSpawn, owner, spawnSpeed, scale);
        this.type = "shotgun";
        this.size = scale * 25;
        this.lifeSpan = lifeSpan;
    }

    update(deltaTime) {
        super.update(deltaTime);
    }

    render(ctx) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#FFC0CB", "#000");
        }
    }
}

export class ShrapnelBullet extends Bullet {
    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, owner, spawnSpeed = 10, scale = 1) {
        super(posSpawn, angleSpawn, owner, spawnSpeed, scale);
        this.type = "shrapnel";
        this.size = scale * 50;
        this.lifeSpan = 2000;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.angle += 0.05
    }

    render(ctx) {
        if (this.active) {
            drawRegPolygon(ctx, this.pos, this.size / 2, 3, this.angle, "#32CD32", "#000"); // Triangle
        }
    }
}

export class FireBullet extends Bullet {
    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, owner, spawnSpeed = 10, scale = 1) {
        super(posSpawn, angleSpawn, owner, spawnSpeed, scale);
        this.type = "fire";
        this.size = scale * 25;
        this.lifeSpan = 500;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.size = this.size * 0.99;
    }

    render(ctx) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#FFA500", "#000");
        }
    }
}

export class HomingMissle extends Bullet {
    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, owner, spawnSpeed = 10, scale = 1) {
        super(posSpawn, angleSpawn, owner, spawnSpeed, scale);
        this.type = "fire";
        this.size = scale * 25;
        this.lifeSpan = 5000;
    }

    update(deltaTime) {
        super.update(deltaTime);
    }

    render(ctx) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#ffffff", "#000");
        }
    }
}