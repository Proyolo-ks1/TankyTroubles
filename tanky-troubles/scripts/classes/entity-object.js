import { setGlobalVariable, getGlobalVariable, GLOBAL_VARIABLES } from '../global-state.js';
import { drawRect, drawCircle, drawRegPolygon, drawLine, drawVectorArrow} from '../graphics-utils.js';
import { spawnRelativeClass } from './spawner.js';






//      |===================|
//      |      BULLETS      |
//      |===================|



// MARK: GameObject
// GameObject class (base class for all types of gameObjects)
class GameObject {
    static gameObjectCount = 0;

    constructor(pos = { x: 0, y: 0 }, vel = { x: 0, y: 0 }, acc = { x: 0, y: 0 }, angle = 0, angleVel = 0, angleAcc = 0, scale = 1, lifeSpan = -1) {
        this.id = `gameObject${GameObject.gameObjectCount++}`;
        this.pos = pos;
        this.vel = vel;
        this.acc = acc;
        this.angle = angle;
        this.angleVel = angleVel;
        this.angleAcc = angleAcc;
        this.scale = scale;
        this.active = true;
        this.creationTime = Date.now();
        this.lifeSpan = lifeSpan;

        // Get current gameObject array, add new gameObject, and update state
        const objects = getGlobalVariable(GLOBAL_VARIABLES.GAME_OBJECTS); 
        objects.push(this);
        setGlobalVariable(GLOBAL_VARIABLES.GAME_OBJECTS, objects);
    }

    update(deltaTime) {
        // Position
        this.pos.x += this.velocity.x * deltaTime;
        this.pos.y += this.velocity.y * deltaTime;

        // Velocity
        this.vel.x += this.acc.x * deltaTime;
        this.vel.y += this.acc.y * deltaTime;

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
        // Default bullet rendering, can be overridden
    }

    debugRender(ctx) {
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

// MARK: DefaultObject
export class DefaultObject extends GameObject {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, spawnSpeed = 50, scale = 1) {
        super(owner, posSpawn, angleSpawn, spawnSpeed, scale);
        this.type = "default";
        const tileSize = getGlobalVariable(GLOBAL_VARIABLES.TILE_SIZE);
        this.size = scale * (tileSize / 12);
        this.lifeSpan = 10000;
    }

    render(ctx) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#000", "#000");
        }
    }
}