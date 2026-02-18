import { getGlobal } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawRegPolygon, drawLine, drawVectorArrow} from '../utils/graphics-utils.js';
import { spawnRelativeClass as spawnClassRelatively } from './spawner.js';
import { PhysicsObject } from './entity.js';
import { randomSeeded } from "../utils/math-utils.js";






//      |====================|
//      |      POWER UP      |
//      |====================|



// MARK: Power Up
// Power up class (base class for all types of power ups)
class PowerUp extends PhysicsObject {
    static nextId = 0;

    constructor(
        owner,
        posSpawn = { x: 0, y: 0 },
        angleSpawn = 0,
        scale = 1,
        speedSpawn = 1,
        angleVel = 0,
        lifeSpan = -1
    ) {
        super({ // PhysicsObject
            pos: posSpawn,
            vel: { x: Math.cos(angleSpawn) * speedSpawn, y: Math.sin(angleSpawn) * speedSpawn },
            angle: angleSpawn,
            angleVel: angleVel,
            lifeSpan: lifeSpan,
        });
        this.name = `Bullet ${PowerUp.nextId}`;
        this.shortName = `b${PowerUp.nextId++}`;
        this.owner = owner;

        this.radius = scale;
        this.radius = 1 / 12;

        this.active = true;

        getGlobal().entities.bullets.unshift(this);
    }

    

    update(gameDeltaTime) {
        super.update(gameDeltaTime);
        // Nothing
    }

    destroy() {
        super.destroy();
        // Nothing
        
        // TEMP DEBUGGING
        // drawCircle(ctx, this.pos, 1 / renderScale / 2, "#ffffff", "#ffffff");
    }
    
    render(ctx, gameDeltaTime) {
        // Nothing
    }
    
    debugrender(ctx, gameDeltaTime) {
        if (this.active) {
            
            const renderScale = getGlobal().renderScale

            // Velocity Arrow
            drawVectorArrow(ctx, this.pos, this.vel, "#0000FF", 0.02);
            
            // Heading Line
            const headingLength = 1;
            let headingX = this.pos.x + Math.cos(this.angle) * headingLength;
            let headingY = this.pos.y + Math.sin(this.angle) * headingLength;
            
            // Draw the heading line
            drawLine(ctx, this.pos, { x: headingX, y: headingY }, "#FF0000", 0.02); // Red color for the heading line
            
            // Draw the random indicator
            const randomAngle = (randomSeeded(this.id) - 0.5) * 2 * Math.PI;
            headingX = this.pos.x + Math.cos(randomAngle) * 1.2 * headingLength;
            headingY = this.pos.y + Math.sin(randomAngle) * 1.2 * headingLength;
            drawLine(ctx, this.pos, { x: headingX, y: headingY }, "#4c00ff", 0.02); // Red color for the heading line

            // name
            const text = `${this.shortName}(${this.age.toFixed(2)}/${this.lifeSpan.toFixed(2)})`;
            const textPos = { x: headingX, y: headingY };
            const textStyle = {
                align: "center",
                baseline: "bottom",
                fontSize: 16 / renderScale, //px
                font: "Consolas",
                textColor: "#000000",
                outlineColor: "#ffffff",
                outlineWidth: 2 / renderScale,
            };

            drawText(ctx, text, textPos, textStyle);

            if (this.active) {
                drawCircle(ctx, this.pos, 1 / renderScale / 2, "#ffffff", "#ffffff");
            }
        }
    }
}

// MARK: DefaultPowerup
export class DefaultPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1.8, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "default";
        this.radius = 1 / 12;
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.radius / 2, "#462f2f", "#000");
        }
    }
}

// MARK: BoostPowerup
export class BoostPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1.8, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "default";
        this.radius = 1 / 12;
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.radius / 2, "#7f28a1", "#000");
        }
    }
}