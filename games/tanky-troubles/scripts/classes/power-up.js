import { getGlobal } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawRegPolygon, drawLine, drawVectorArrow, drawImg, drawImgRotated} from '../utils/graphics-utils.js';
import { spawnRelativeClass as spawnClassRelatively } from './spawner.js';
import { PhysicsObject } from './entity.js';
import { randomSeeded } from "../utils/math-utils.js";
import { getImage } from "../asset-handler.js";






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
        speedSpawn = 0,
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
        this.name = `Bullet ${PowerUp.nextId}`;
        this.shortName = `b${PowerUp.nextId++}`;
        this.owner = owner;

        this.radius = scale;
        this.radius = 0.3;  // 0.3 Tiles

        this.active = true;

        getGlobal().entities.utilities.unshift(this);
    }

    

    update(gameDeltaTime) {
        super.update(gameDeltaTime);
        this.angle += 1 * gameDeltaTime;
        // Nothing
    }

    destroy() {
        super.destroy();
        // Nothing
        
        // TEMP DEBUGGING
        // drawCircle(ctx, this.pos, 1 / renderScale / 2, "#ffffff", "#ffffff");
    }
    
    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawImgRotated(ctx, this.pos, this.angle, { w: this.radius, h: this.radius}, this.img, 1);
            
        }
    }
    
    debugrender(ctx, gameDeltaTime) {
        if (this.active) {
            
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

// MARK: DefaultPowerup
export class DefaultPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "DefaultPowerup";
    }

    render(ctx, gameDeltaTime) {
        if (this.active) {
            drawCircle(ctx, this.pos, this.radius / 2, "#462f2f", "#000");
        }
    }
}



// MARK: Powerups - Offensive

// OffensiveUnknown
export class OffensiveUnknown extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "OffensiveUnknown";
        this.img = getImage("powerup", "unknown-gray");
    }
}

// BoobyTrapPowerup
export class BoobyTrapPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "BoobyTrapPowerup";
        this.img = getImage("powerup", "booby-trap");
    }
}

// ChaingunPowerup
export class ChaingunPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "ChaingunPowerup";
        this.img = getImage("powerup", "chaingun");
    }
}

// CryoBombPowerup
export class CryoBombPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "CryoBombPowerup";
        this.img = getImage("powerup", "cryo-bomb");
    }
}

// DoubleBarrelPowerup
export class DoubleBarrelPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "DoubleBarrelPowerup";
        this.img = getImage("powerup", "double-barrel");
    }
}

// DrillPowerup
export class DrillPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "DrillPowerup";
        this.img = getImage("powerup", "drill");
    }
}

// DroneTankDetonatorPowerup
export class DroneTankDetonatorPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "DroneTankDetonatorPowerup";
        this.img = getImage("powerup", "drone-tank-detonator");
    }
}

// DroneTankShooterPowerup
export class DroneTankShooterPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "DroneTankShooterPowerup";
        this.img = getImage("powerup", "drone-tank-shooter");
    }
}

// LaserPowerup
export class LaserPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "LaserPowerup";
        this.img = getImage("powerup", "laser");
    }
}

// MissileHomingPowerup
export class MissileHomingPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "MissileHomingPowerup";
        this.img = getImage("powerup", "missle-homing");
    }
}

// RailgunPowerup
export class RailgunPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "RailgunPowerup";
        this.img = getImage("powerup", "railgun");
    }
}

// ShotgunPowerup
export class ShotgunPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "ShotgunPowerup";
        this.img = getImage("powerup", "shotgun");
    }
}

// ShrapnelBombPowerup
export class ShrapnelBombPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "ShrapnelBombPowerup";
        this.img = getImage("powerup", "shrapnal-bomb");
    }
}

// SmokeBombPowerup
export class SmokeBombPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "SmokeBombPowerup";
        this.img = getImage("powerup", "smoke-bomb");
    }
}



// MARK: Powerups - Defensive

// DefensiveUnknown
export class DefensiveUnknown extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "DefensiveUnknown";
        this.img = getImage("powerup", "unknown-blue");
    }
}

// HealingPowerup
export class HealingPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "HealingPowerup";
        this.img = getImage("powerup", "healing");
    }
}

// ShieldHPPowerup
export class ShieldHPPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "ShieldHPPowerup";
        this.img = getImage("powerup", "shield-hp");
    }
}

// ShieldTimePowerup
export class ShieldTimePowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "ShieldTimePowerup";
        this.img = getImage("powerup", "shield-time");
    }
}



// MARK: Powerups - Boosts

// BoostUnknown
export class BoostUnknown extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "BoostUnknown";
        this.img = getImage("powerup", "unknown-yellow");
    }
}

// BoostBulletDamagePowerup
export class BoostBulletDamagePowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "BoostBulletDamagePowerup";
        this.img = getImage("powerup", "boost-bullet-damage");
    }
}

// BoostBulletSpeedPowerup
export class BoostBulletSpeedPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "BoostBulletSpeedPowerup";
        this.img = getImage("powerup", "boost-bullet-speed");
    }
}

// BoostMovementSpeedPowerup
export class BoostMovementSpeedPowerup extends PowerUp {
    constructor(owner, posSpawn = { x: 0, y: 0 }, angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "BoostMovementSpeedPowerup";
        this.img = getImage("powerup", "boost-movement-speed");
    }
}