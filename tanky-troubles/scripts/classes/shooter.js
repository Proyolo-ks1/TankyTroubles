import { setGlobalVariable, getGlobalVariable, getAllState } from '../global-state.js';


//      |===================|
//      |      SHOOTER      |
//      |===================|



export class Shooter {
    static shooterCount = 0;

    constructor(posSpawn = { x: 0, y: 0 }, angle = 0) {
        this.pos = posSpawn;
        this.angle = angle;
        this.bullets = [];  // Each shooter tracks its own bullets
        this.id = Shooter.shooterCount++;  // Assign a unique ID to each shooter
    }

    spawnRelativeBullet(BulletClass, relPos = {x: 0, y: 0}, relAngle = 0, speed = null, scale = 1, lifeSpan = undefined) {
        // Dynamically get the class name of the current shooter
        const shooterType = this.constructor.name;
        const shooterId = this.id !== undefined ? this.id : 'N/A';
        
        // console.log(`%cBullet Spawned: ${BulletClass.name}, ${speed}px/s, scale = ${scale})`, "color: #00FF00;");

        // Calculate the absolute position relative to the shooter's position and angle
        const absX = this.pos.x + Math.cos(this.angle) * relPos.x - Math.sin(this.angle) * relPos.y;
        const absY = this.pos.y + Math.sin(this.angle) * relPos.x + Math.cos(this.angle) * relPos.y;
        const absAngle = this.angle + relAngle;

        // Create the bullet with the calculated position and angle
        const bullet = new BulletClass({ x: absX, y: absY }, absAngle, this, speed, scale, lifeSpan);
        this.bullets.push(bullet); // Add the bullet to the shooter's bullet list
    }
}