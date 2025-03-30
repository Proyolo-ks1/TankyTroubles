import { setGlobalVariable, getGlobalVariable } from '../global-state.js';
import { drawRect, drawCircle, drawRegPolygon, drawLine, drawVectorArrow} from '../graphics-utils.js';
import { Shooter } from './shooter.js';



//      |===================|
//      |      BULLETS      |
//      |===================|



// Bullet class (base class for all types of bullets)
class Bullet extends Shooter {
    static BulletCount = 0;

    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, owner, spawnSpeed = 100, scale = 1, rotationSpeed = 0) {
        super();
        this.id = Bullet.BulletCount++;  // Assign a unique ID to each bullet
        this.pos = posSpawn;
        this.velocity = { x: Math.cos(angleSpawn) * spawnSpeed, y: Math.sin(angleSpawn) * spawnSpeed };
        this.angle = angleSpawn;
        this.rotationSpeed = rotationSpeed;
        this.owner = owner;
        const tileSize = getGlobalVariable("tileSize");
        this.size = scale * (tileSize / 12);
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

        // Rotation
        this.angle += this.rotationSpeed * deltaTime;        

        // Check if bullet's lifespan is over and make it inactive
        if (Date.now() - this.creationTime > this.lifeSpan) {
            this.destroy();
        }
    }

    destroy() {
        this.active = false;
    }

    render(ctx) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#000", "#000");
        }
    }

    debugRender(ctx) {
        if (this.active) {
            // Velocity Arrow
            drawVectorArrow(ctx, this.pos, this.velocity, "#0000FF", 2);

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
        const tileSize = getGlobalVariable("tileSize");
        this.size = scale * (tileSize / 12);
        this.lifeSpan = 10000;
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
        const tileSize = getGlobalVariable("tileSize");
        this.size = scale * (tileSize / 25);
        this.lifeSpan = 5000;
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
        const tileSize = getGlobalVariable("tileSize");
        this.size = scale * (tileSize / 20);
        this.lifeSpan = lifeSpan;
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

export class Shrapnel extends Bullet {
    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, owner, spawnSpeed = 10, scale = 1, lifeSpan = 5000) {
        super(posSpawn, angleSpawn, owner, spawnSpeed, scale);
        this.type = "shrapnel";
        const tileSize = getGlobalVariable("tileSize");
        this.size = scale * (tileSize / 20);
        this.lifeSpan = lifeSpan;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.angle += 0.1
    }

    render(ctx) {
        if (this.active) {
            drawRegPolygon(ctx, this.pos, this.size / 2, 3, this.angle, "#000", "#000"); // Triangle

        }
    }
}

export class ShrepnalBomb extends Bullet {
    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, owner, spawnSpeed = 10, scale = 1, lifeSpan = 1000) {
        super(posSpawn, angleSpawn, owner, spawnSpeed, scale);
        this.type = "shrapnel";
        const tileSize = getGlobalVariable("tileSize");
        this.size = scale * (tileSize / 8);
        this.lifeSpan = lifeSpan;
    }

    update(deltaTime) {
        super.update(deltaTime);
        // this.angle += 0.05
    }

    destroy() {
        super.destroy();
        const numShrepnal = 30;
        const spreadAngle = 360; // Spread angle in degrees
        const spreadAngleRadians = spreadAngle * (Math.PI / 180);
        
        for (let i = 0; i < numShrepnal; i++) {
            const tileSize = getGlobalVariable("tileSize");

            // Randomize the angle offset for each bullet
            const randomBulletAngleOffset = (Math.random() - 0.5) * spreadAngleRadians;
            const bulletSpeed = tileSize * (1 + Math.random() * 0.5);
            const lifeSpan = 3000 - Math.random() * (3000 / 2);
            this.spawnRelativeBullet(Shrapnel, { x: 0, y: 0 }, randomBulletAngleOffset, bulletSpeed, 1, lifeSpan);
        }
    }

    render(ctx) {
        if (this.active) {
            drawRegPolygon(ctx, this.pos, this.size / 2, 5, this.angle, "#000", "#000"); // Pentagon
        }
    }
}

export class FireBullet extends Bullet {
    constructor(posSpawn = { x: 0, y: 0 }, angleSpawn = 0, owner, spawnSpeed = 10, scale = 1, lifeSpan = 1750)  {
        super(posSpawn, angleSpawn, owner, spawnSpeed, scale);
        this.type = "fire";
        this.size = scale * 25;
        this.lifeSpan = lifeSpan;
        this.color = "#FFA500";  // Initial color: orange
        this.initialColor = { r: 255, g: 165, b: 0 };  // RGB components of #FFA500
        this.currentColor = { ...this.initialColor };
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.size *= 1.005;
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;

        // Gradually decrease the color towards black
        const fadeSpeed = 3;  // Speed of the color fade towards black

        // Decrease RGB components to simulate fading to black
        this.currentColor.r = Math.max(this.currentColor.r - fadeSpeed, 0);
        this.currentColor.g = Math.max(this.currentColor.g - fadeSpeed, 0);
        this.currentColor.b = Math.max(this.currentColor.b - fadeSpeed, 0);

        // Update color in hex format
        this.color = `rgb(${Math.round(this.currentColor.r)}, ${Math.round(this.currentColor.g)}, ${Math.round(this.currentColor.b)})`;
    }

    render(ctx) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, this.color, "#000");
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