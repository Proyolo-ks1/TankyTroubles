// import { getGlobal } from '../global-state.js';






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



export function spawnRelativeClass(Class, owner, pos, angle, scale, relPos = {x: 0, y: 0}, relAngle = 0, speed = undefined, angleVel, lifeSpan = undefined) {
    // Calculate absolute position based on relative position
    const absPos = { 
        x: pos.x + Math.cos(angle) * relPos.x - Math.sin(angle) * relPos.y, 
        y: pos.y + Math.sin(angle) * relPos.x + Math.cos(angle) * relPos.y 
    };
    const absAngle = angle + relAngle;

    // Instantiate the class with the calculated values
    const instance = new Class(owner, absPos, absAngle, scale, speed, angleVel, lifeSpan);
    // Log the whole spawn data
    // console.log(`%c${Class.name} spawned by ${owner.name} at (${absPos.x.toFixed(0)}, ${absPos.y.toFixed(0)}), rotation: ${(absAngle * 180 / Math.PI).toFixed(0)}°, speed: ${speed || 'N/A'}px/s, lifespan: ${lifeSpan ? lifeSpan + "ms" : "default"}`, "color: #00FF00;");


    return instance;
}