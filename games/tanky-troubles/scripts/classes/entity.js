import { getGlobal, ENTITY_TYPES} from '../global-state.js';
import { drawRect, drawCircle, drawRegPolygon, drawLine, drawVectorArrow} from '../utils/graphics-utils.js';
import { spawnRelativeClass } from './spawner.js';






//      |==================|
//      |      ENTITIY     |
//      |==================|



// MARK: Entity
// Entity class (base class for all types of game entities)
class Entity {
    static nextId = 0;

    constructor(type = "entity") {
        this.id = Entity.nextId++;
        this.type = type;
        this.active = true;
    }

    update(realDeltaTime) {
        // Nothing
    }

    destroy() {
        this.active = false;
    }

    render(ctx, gameDeltaTime) {
        // Default bullet rendering, can be overridden
    }
}

// MARK: StaticEntity
export class StaticEntity extends Entity {
    constructor({
        pos = { x: 0, y: 0 },
        angle = 0,
        size = 1,
    } = {}) {
        super(ENTITY_TYPES.STATIC_ENTITY);
        this.pos = pos;
        this.angle = angle;
        this.size = size;
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.size / 2, "#000", "#000");
        }
    }
}

// MARK: PhysicsObject
export class PhysicsObject extends Entity {
    constructor({
        pos = { x: 0, y: 0 },
        vel = { x: 0, y: 0 },
        acc = { x: 0, y: 0 },
        angle = 0,
        angleVel = 0,
        angleAcc = 0,
        lifeSpan = -1,
    } = {}) {
        super(ENTITY_TYPES.PHYSICS);

        this.pos = pos;
        this.vel = vel;
        this.acc = acc;

        this.angle = angle;
        this.angleVel = angleVel;
        this.angleAcc = angleAcc;

        this.lifeSpan = lifeSpan;
        this.age = 0;
    }

    update(gameDeltaTime) {
        this.updatePosition(gameDeltaTime);
        this.updateVelocity(gameDeltaTime);
        this.updateRotation(gameDeltaTime);
        this.updateAge(gameDeltaTime);
        this.updateHitbox(); // or any collision / bounding updates
    }

    updatePosition(gameDeltaTime) {
        this.pos.x += this.vel.x * gameDeltaTime;
        this.pos.y += this.vel.y * gameDeltaTime;
    }

    updateVelocity(gameDeltaTime) {
        this.vel.x += this.acc.x * gameDeltaTime;
        this.vel.y += this.acc.y * gameDeltaTime;
    }

    updateRotation(gameDeltaTime) {
        this.angle += this.angleVel * gameDeltaTime;
        this.angleVel += this.angleAcc * gameDeltaTime;
    }

    updateAge(gameDeltaTime) {
        this.age += gameDeltaTime;
        if (this.lifeSpan >= 0 && this.age > this.lifeSpan) {
            this.destroy();
        }
    }

    updateHitbox() {
        // e.g., recalc collision bounds, radius, etc.
    }

    destroy() {
        this.active = false;
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            // name
            const text = `This is a default physics object`;
            const textPos = { x: this.pos.x, y: this.pos.y - 0.3 * this.size };
            const textStyle = {
                align: "center",
                baseline: "bottom",
                fontSize: 0.2,
                font: "Consolas",
                textColor: this.color,
                outlineColor: "#000000",
                outlineWidth: 0.02
            };

            drawText(ctx, text, textPos, textStyle);
        }
    }

    debugrender(ctx) {
        if (!this.active) return;

        // drawVectorArrow(ctx, this.pos, this.vel, "#0000FF", 2);

        // const len = 50;
        // drawLine(ctx, this.pos, {x: this.pos.x + Math.cos(this.angle) * len, y: this.pos.y + Math.sin(this.angle) * len}, "#FF0000", 2);
    }
}