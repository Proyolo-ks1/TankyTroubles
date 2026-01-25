import { getGlobal } from '../global-state.js';
import { drawRect, drawCircle, drawRegPolygon, drawLine, drawVectorArrow} from '../graphics-utils.js';
import { spawnRelativeClass } from './spawner.js';


// References
const tileSize = getGlobal().zoomLevel;




//      |====================|
//      |      PARTICLE      |
//      |====================|



// MARK: PARTICLE
// Particle class (base class for all types of particles)
class Particle {
    static ParticleCount = 0;

    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 100, scale = 1, rotationSpeed = 0) {
        this.id = `particle${Particle.ParticleCount++}`;

        this.owner = owner;
        this.pos = posSpawn;
        this.velocity = { x: Math.cos(angleSpawn) * spawnSpeed, y: Math.sin(angleSpawn) * spawnSpeed };
        this.angle = angleSpawn;
        this.rotationSpeed = rotationSpeed;
        this.size = scale * (getGlobal().zoomLevel / 12);
        this.active = true;
        this.creationTime = Date.now();

        getGlobal().entities.particles.push(this);
    }

    update(deltaTime) {
        // Position
        this.pos.x += this.velocity.x * deltaTime;
        this.pos.y += this.velocity.y * deltaTime;

        // Rotation
        this.angle += this.rotationSpeed * deltaTime;        

        // Check if particle's lifespan is over and make it inactive
        if (Date.now() - this.creationTime > this.lifeSpan) {
            this.destroy();
        }
    }

    destroy() {
        this.active = false;
    }

    render(ctx, deltaTime) {
        // Default particle rendering, can be overridden
    }

    debugrender(ctx, deltaTime) {
        if (this.active) {
            // Velocity Arrow
            drawVectorArrow(ctx, this.pos, this.velocity, "#0000FF", 2);

            // Heading Line
            const headingLength = 50;
            const headingX = this.pos.x + Math.cos(this.angle) * headingLength;
            const headingY = this.pos.y + Math.sin(this.angle) * headingLength;

            // Draw the heading line
            drawLine(ctx, this.pos, { x: headingX, y: headingY }, "#FF0000", 2); // Red color for the heading line
        }
    }
}

// MARK: TankDriveParticle
export class TankDriveParticle extends Particle {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 50, scale = 1) {
        super(owner, posSpawn, angleSpawn, spawnSpeed, scale);
        this.type = "default";
        this.size = scale * (tileSize / 12);
        this.lifeSpan = 10000;
    }

    render(ctx, deltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#000", "#000");
        }
    }
}

// MARK: TankDriveParticle
export class TankTrackParticle extends Particle {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 50, scale = 1) {
        super(owner, posSpawn, angleSpawn, spawnSpeed, scale);
        this.type = "default";
        this.size = scale * (tileSize / 12);
        this.lifeSpan = 10000;
    }

    render(ctx, deltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#000", "#000");
        }
    }
}
