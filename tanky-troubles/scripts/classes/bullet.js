import { setGlobalVariable, getGlobalVariable, getAllState } from '../global-state.js';
import { drawRect, drawCircle, drawRegPolygon, drawArrow} from '../graphics-utils.js';
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
        this.velocity = { vx: Math.cos(angleSpawn) * spawnSpeed, vy: Math.sin(angleSpawn) * spawnSpeed };
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
        this.pos.x += this.velocity.vx * deltaTime;
        this.pos.y += this.velocity.vy * deltaTime;

        // Rotation - simulate frisbee-like spinning
        this.angle += this.rotationSpeed * deltaTime;

        // Adjusting velocity to simulate arc-like movement
        // Slightly altering the velocity based on the rotation
        let arcAdjustment = this.arcFactor * Math.cos(this.angle);
        this.velocity.vx += arcAdjustment;
        this.velocity.vy += arcAdjustment;
        

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
            drawArrow(ctx, this.pos, this.velocity, 50, "#0000FF");
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
            drawCircle(ctx, this.pos, this.size / 2, "#40E0D0", "#000");
        }
    }
}

export class ShotgunBullet extends Bullet {
    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, owner, spawnSpeed = 10, scale = 1) {
        super(posSpawn, angleSpawn, owner, spawnSpeed, scale);
        this.type = "shotgun";
        this.size = scale * 25;
        this.lifeSpan = 1500;
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
        this.lifeSpan = 1000;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.angle += 50
    }

    render(ctx) {
        if (this.active) {
            drawRegPolygon(ctx, this.pos, this.size / 2, 3, "#32CD32", "#000");
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
            
        }
    }
}