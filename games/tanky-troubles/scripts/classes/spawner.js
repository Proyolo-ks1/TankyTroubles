// import { getGlobal } from '../global-state.js';
import { Vec2 } from "../utils/math-utils.js";






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



export function spawnClassRelatively(Class = undefined, owner = undefined, pos = new Vec2(), angle = 0, scale = 1, relPos = new Vec2(), relAngle = 0, speed = 1, angleVel = 0, lifeSpan = undefined) {
    // Calculate absolute position based on relative position
    const absPos = relPos.clone().rotate(angle).add(pos);
    const absAngle = angle + relAngle;

    // Instantiate the class with the calculated values
    const instance = new Class(owner, absPos, absAngle, scale, speed, angleVel, lifeSpan);
    // Log the whole spawn data
    // console.log(`%c${Class.name} spawned by ${owner.name} at (${absPos.x.toFixed(0)}, ${absPos.y.toFixed(0)}), rotation: ${(absAngle * 180 / Math.PI).toFixed(0)}°, speed: ${speed || 'N/A'}px/s, lifespan: ${lifeSpan ? lifeSpan.toFixed(1) + "s" : "default"}`, "color: #00FF00;");

    return instance;
}