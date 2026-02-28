import { getGlobal, ENTITY_TYPES } from '../global-state.js';
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
        this.id = Entity.nextId;
        this.name = `Entity ${Entity.nextId}`;
        this.shortName = `e${Entity.nextId++}`;
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
        scale: scale = 1,
    } = {}) {
        super(ENTITY_TYPES.STATIC_ENTITY);
        this.pos = pos;
        this.angle = angle;
        this.scale = scale;
    }

    debugrender(ctx) {
        if (!this.active) return;

        const len = 3;
        drawLine(ctx, this.pos, {x: this.pos.x + Math.cos(this.angle) * len, y: this.pos.y + Math.sin(-this.angle) * len}, "#FF0000", 0.02);
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
        scale: scale = 1,
        lifeSpan = -1,
    } = {}) {
        super(ENTITY_TYPES.PHYSICS);

        this.pos = pos;
        this.vel = vel;
        this.acc = acc;

        this.angle = angle;
        this.angleVel = angleVel;
        this.angleAcc = angleAcc;

        this.radius = scale;

        this.lifeSpan = lifeSpan;
        this.age = 0;
    }

    update(gameDeltaTime) {
        this.updatePosition(gameDeltaTime);
        this.updateVelocity(gameDeltaTime);
        this.updateRotation(gameDeltaTime);
        this.updateAge(gameDeltaTime);
        this.updateHitbox();
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
        // or any collision / bounding updates
    }

    destroy() {
        this.active = false;
    }

    debugrender(ctx) {
        if (!this.active) return;

        drawVectorArrow(ctx, this.pos, this.vel, "#0000FF", 2);

        const len = 50;
        drawLine(ctx, this.pos, {x: this.pos.x + Math.cos(this.angle) * len, y: this.pos.y + Math.sin(-this.angle) * len}, "#FF0000", 2);
    }
}