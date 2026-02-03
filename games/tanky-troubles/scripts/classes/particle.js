import { getGlobal } from '../global-state.js';
import { drawRect, drawCircle, drawRegPolygon, drawLine, drawVectorArrow} from '../utils/graphics-utils.js';
import { PhysicsObject } from './entity.js';
import { spawnRelativeClass } from './spawner.js';


// References
const tileSize = getGlobal().zoomLevel;




//      |====================|
//      |      PARTICLE      |
//      |====================|



// MARK: PARTICLE
// Particle class (base class for all types of particles)
class Particle extends PhysicsObject{
    static nextId = 0;

    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 100, scale = 1, rotationSpeed = 0) {
        super({ // PhysicsObject
            pos: posSpawn,
            vel: { x: Math.cos(angleSpawn) * spawnSpeed, y: Math.sin(angleSpawn) * spawnSpeed },
            angle: angleSpawn,
        });
        this.name = `particle${Particle.nextId++}`;
        this.owner = owner;

        this.rotationSpeed = rotationSpeed;
        this.size = scale * (getGlobal().zoomLevel / 12);
        this.active = true;

        getGlobal().entities.particles.push(this);
    }

    update(realDeltaTime) {
        // Position
        this.pos.x += this.vel.x * realDeltaTime;
        this.pos.y += this.vel.y * realDeltaTime;

        // Rotation
        this.angle += this.rotationSpeed * realDeltaTime;
    }

    destroy() {
        this.active = false;
    }

    render(ctx, realDeltaTime) {
        // Default particle rendering, can be overridden
    }

    debugrender(ctx, realDeltaTime) {
        if (this.active) {
            // Velocity Arrow
            drawVectorArrow(ctx, this.pos, this.vel, "#0000FF", 2);

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

    render(ctx, gameDeltaTime) {
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

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#000", "#000");
        }
    }
}
