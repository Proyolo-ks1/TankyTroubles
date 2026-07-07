import { getGlobal, ENTITY_TYPES } from '../global-state.js';
import { drawRect, drawCircle, drawRegPolygon, drawLine, drawVectorArrow} from '../utils/graphics-utils.js';
// import { spawnClassRelatively } from './spawner.js';
import { COLLISIONSHAPES } from './collision.js';
import { Vec2 } from "../utils/math-utils.js";






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

    update(gameDeltaTime) {
        // Nothing
    }

    destroy() {
        this.active = false;
    }

    render(ctx, gameDeltaTime) {
        // Default Entity rendering, can be overridden
    }
}

// MARK: StaticEntity
export class StaticEntity extends Entity {
    constructor({
        pos = new Vec2(),
        angle = 0,
        scale = 1,
        renderRadius = 1,
    } = {}) {
        super(ENTITY_TYPES.STATIC_ENTITY);
        this.pos = pos;
        this.angle = angle;
        this.scale = scale;
        this.renderRadius = renderRadius;
    }

    debugrender(ctx) {
        if (!this.active) return;

        if (getGlobal().debugOverlays.entityPhysics) {
            const len = 3;
            drawLine(ctx, this.pos, this.pos.add(Vec2.fromAngle(this.angle, len)), "#FF0000", 0.02);
        }
    }
}

// MARK: PhysicsObject
export class PhysicsObject extends Entity {
    constructor({
        pos = new Vec2(),
        vel = new Vec2(),
        acc = new Vec2(),
        angle = 0,
        angleVel = 0,
        angleAcc = 0,
        scale = 1,
        renderRadius = 1,
        lifeSpan = -1,
    } = {}) {
        super(ENTITY_TYPES.PHYSICS);

        this.pos = pos;
        this.vel = vel;
        this.acc = acc;

        this.angle = angle;
        this.angleVel = angleVel;
        this.angleAcc = angleAcc;

        this.scale = scale;
        this.radius = scale;

        this.renderRadius = renderRadius;

        this.lifeSpan = lifeSpan;
        this.age = 0;
    }

    update(gameDeltaTime) {
        this.updatePosition(gameDeltaTime);
        this.updateVelocity(gameDeltaTime);
        this.updateRotation(gameDeltaTime);
        const frame = getGlobal().frameCount;
        if (this.shortName === "b10") {
            const a = 0;
        }
        this.updateAge(gameDeltaTime);
        this.updateHitbox();
    }

    updatePosition(gameDeltaTime) {
        this.pos.addMutScaled(this.vel, gameDeltaTime)
    }

    updateVelocity(gameDeltaTime) {
        // const owner = "noOwner"
        // if (this.owner) {const owner = this.owner };
        // console.log(`shortName: ${this.shortName} (${this.constructor.name}) of ${owner}`);
        // if (this.shortName === "p1") {
        //     const a = 1;
        // }
        this.vel.addMutScaled(this.acc, gameDeltaTime)
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

        if (getGlobal().debugOverlays.entityPhysics) {
            drawVectorArrow(ctx, this.pos, this.vel, "#0000FF", 2);

            const len = 50;
            drawLine(ctx, this.pos, this.pos.add(Vec2.fromAngle(this.angle, len)), "#FF0000", 2);
        }

        if (getGlobal().debugOverlays.hitboxes) {
            drawCircle(ctx, this.pos, this.radius, null, "#0a0", 1)
        }
    }
}