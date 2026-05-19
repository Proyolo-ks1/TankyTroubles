import { getGlobal } from '../global-state.js';
import { drawRect, drawRectRotated, drawCircle, drawText, drawRegPolygon, drawLine, drawVectorArrow} from '../utils/graphics-utils.js';
import { PhysicsObject } from './entity.js';
import { spawnRelativeClass } from './spawner.js';
import { randomSeeded, hexToRGB } from "../utils/math-utils.js";


// References
const tileSize = getGlobal().zoomLevel;




//      |====================|
//      |      PARTICLE      |
//      |====================|



// MARK: PARTICLE
// Particle class (base class for all types of particles)
class Particle extends PhysicsObject {
    static nextId = 0;
    constructor(
        owner,
        posSpawn = { x: 0, y: 0 },
        angleSpawn = 0,
        scaleSpawn = 1,
        speedSpawn = 1,
        angleVel = 0,
        lifeSpan = -1
    ) {
        super({ // PhysicsObject
            pos: posSpawn,
            vel: { x: Math.cos(angleSpawn) * speedSpawn, y: Math.sin(-angleSpawn) * speedSpawn },
            angle: angleSpawn,
            angleVel: angleVel,
            lifeSpan: lifeSpan,
        });
        this.name = `Particle ${Particle.nextId}`;
        this.shortName = `p${Particle.nextId++}`;
        this.owner = owner;
        
        this.scale = scaleSpawn;
        this.radius = 1 / 12 * this.scale;

        this.active = true;

        getGlobal().entities.particles.unshift(this);
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
        if(this.active && getGlobal().showParticles) {
            // Nothing
        }
    }
    
    debugrender(ctx, gameDeltaTime) {
        if (this.active && getGlobal().showParticles) {
            
            const renderScale = getGlobal().renderScale

            // Velocity Arrow
            drawVectorArrow(ctx, this.pos, this.vel, "#0000FF", 0.02);
            
            // Heading Line
            const headingLength = 1;
            let headingX = this.pos.x + Math.cos(this.angle) * headingLength;
            let headingY = this.pos.y + Math.sin(-this.angle) * headingLength;
            
            // Draw the heading line
            drawLine(ctx, this.pos, { x: headingX, y: headingY }, "#FF0000", 0.02); // Red color for the heading line
            
            // Draw the random indicator
            const randomAngle = (randomSeeded(this.id) - 0.5) * 2 * Math.PI;
            headingX = this.pos.x + Math.cos(randomAngle) * 1.2 * headingLength;
            headingY = this.pos.y + Math.sin(-randomAngle) * 1.2 * headingLength;
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

// MARK: TankDriveParticle
export class TankExhaustParticle extends Particle {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1.8, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "TankExhaustParticle";
        this.scale = scaleSpawn;
        this.radius = 1 / 12 * this.scale;
    }

    render(ctx, gameDeltaTime) {
        if (this.active && getGlobal().showParticles) {
            drawRect(ctx, { x: this.pos.x - 1/24, y: this.pos.y - 1/24 }, { w: 1/12, h: 1/12 }, "rgba(0, 0, 0, 0.3)");
        }
    }
}

// MARK: TankTrackParticle
export class TankTrackMarkParticle extends Particle {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1.8, angleVel = 0, lifeSpan = 5.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "TankTrackMarkParticle";
        this.scale = scaleSpawn;
        this.diameter = 1 / 25 * this.scale;
    }

    render(ctx, gameDeltaTime) {
        const offset = 1 / 12;
        if (this.active && getGlobal().showParticles) {
            drawRectRotated(ctx, this.pos, this.angle, { w: this.diameter, h: this.diameter }, "#33333333");
        }
    }
}

// MARK: RocketExhaustParticle
export class RocketExhaustParticle extends Particle {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 1.8, angleVel = 0, lifeSpan = 5.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "RocketExhaustParticle";
        this.scale = scaleSpawn;
        this.radius = 1 / 20 * this.scale;
        this.alpha = 1.0;
        this.initialColor = hexToRGB(this.owner.color); //{ r: 255, g: 165, b: 0 };
        this.currentColor = { ...this.initialColor };
    }

    update(gameDeltaTime) {
        super.update(gameDeltaTime);
        if (this.lifeSpan != -1) {
            this.radius *= 1 + 0.5 * gameDeltaTime;
        }
        this.vel.x *= 1 - 0.9 * gameDeltaTime;
        this.vel.y *= 1 - 0.9 * gameDeltaTime;

        // Gradually decrease the color towards black
        const fadeDurationColor = 2.000; // seconds to fade from full to black
        const fadeDurationAlpha = this.lifeSpan / 1.000; // seconds to fade from full to black
        const fadePerSecondColor = 255 / fadeDurationColor;
        const fadePerSecondAlpha = 1 / fadeDurationAlpha;
        const fadeAmountColor = fadePerSecondColor * gameDeltaTime;
        const fadeAmountAlpha = fadePerSecondAlpha * gameDeltaTime;

        // Decrease RGB components to simulate fading to black
        this.currentColor.r = Math.max(this.currentColor.r - fadeAmountColor, 0);
        this.currentColor.g = Math.max(this.currentColor.g - fadeAmountColor, 0);
        this.currentColor.b = Math.max(this.currentColor.b - fadeAmountColor, 0);
        this.alpha = Math.max(this.alpha - fadeAmountAlpha, 0);

        // Update color in hex format
        this.color = `rgba(
            ${Math.round(this.currentColor.r)},
            ${Math.round(this.currentColor.g)},
            ${Math.round(this.currentColor.b)},
            ${this.alpha})`;
    }

    render(ctx, gameDeltaTime) {
        if (this.active && getGlobal().showParticles) {
            drawCircle(ctx, this.pos, this.radius / 2, this.color);
        }
    }
}
