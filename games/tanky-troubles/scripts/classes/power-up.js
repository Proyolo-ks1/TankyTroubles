import { getGlobal } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawRegPolygon, drawLine, drawVectorArrow, drawImg, drawImgRotated} from '../utils/graphics-utils.js';
import { spawnClassRelatively } from './spawner.js';
import { PhysicsObject } from './entity.js';
import { randomSeeded, Vec2 } from "../utils/math-utils.js";
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
        posSpawn = new Vec2(),
        angleSpawn = 0,
        scale = 1,
        speedSpawn = 0,
        angleVel = 0,
        lifeSpan = -1
    ) {
        super({ // PhysicsObject
            pos: posSpawn,
            vel: Vec2.fromAngle(angleSpawn, speedSpawn),
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

    

    // update(gameDeltaTime) {
    //     super.update(gameDeltaTime);
    //     this.angle += 1 * gameDeltaTime;
    //     // Nothing
    // }

    destroy() {
        super.destroy();
        // Nothing
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
            let heading = this.pos.add(Vec2.fromAngle(this.angle, headingLength));
            
            // Draw the heading line
            drawLine(ctx, this.pos, heading, "#FF0000", 0.02);
            
            // Draw the random indicator
            const randomAngle = (randomSeeded(this.id) - 0.5) * 2 * Math.PI;
            heading = this.pos.add(Vec2.fromAngle(randomAngle, headingLength));
            drawLine(ctx, this.pos, heading, "#4c00ff", 0.02);

            // name
            const text = `${this.shortName}(${this.age.toFixed(2)}/${this.lifeSpan.toFixed(2)})`;
            const textPos = heading;
            const textStyle = {
                align: "center",
                baseline: "bottom",
                fontSize: 16 / renderScale, //px
                font: "Consolas",
                textColor: "#000000",
                outlineColor: "#ffffff",
                outlineWidth: 2 / renderScale, //px
            };

            drawText(ctx, text, textPos, textStyle);
            drawCircle(ctx, this.pos, 1 / renderScale / 2, "#ffffff", "#ffffff");
        }
    }
}

// MARK: DefaultPowerup
class DefaultPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
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
class OffensiveUnknown extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "OffensiveUnknown";
        this.img = getImage("powerup", "unknown-gray");
    }
}

// BoobyTrapPowerup
class BoobyTrapPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "BoobyTrapPowerup";
        this.img = getImage("powerup", "booby-trap");
    }
}

// ChaingunPowerup
class ChaingunPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "ChaingunPowerup";
        this.img = getImage("powerup", "chaingun");
    }
}

// CryoBombPowerup
class CryoBombPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "CryoBombPowerup";
        this.img = getImage("powerup", "cryo-bomb");
    }
}

// DoubleBarrelPowerup
class DoubleBarrelPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "DoubleBarrelPowerup";
        this.img = getImage("powerup", "double-barrel");
    }
}

// DrillPowerup
class DrillPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "DrillPowerup";
        this.img = getImage("powerup", "drill");
    }
}

// DroneTankDetonatorPowerup
class DroneTankDetonatorPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "DroneTankDetonatorPowerup";
        this.img = getImage("powerup", "drone-tank-detonator");
    }
}

// DroneTankShooterPowerup
class DroneTankShooterPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "DroneTankShooterPowerup";
        this.img = getImage("powerup", "drone-tank-shooter");
    }
}

// LaserPowerup
class LaserPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "LaserPowerup";
        this.img = getImage("powerup", "laser");
    }
}

// MissileHomingPowerup
class MissileHomingPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "MissileHomingPowerup";
        this.img = getImage("powerup", "missle-homing");
    }
}

// RailgunPowerup
class RailgunPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "RailgunPowerup";
        this.img = getImage("powerup", "railgun");
    }
}

// ShotgunPowerup
class ShotgunPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "ShotgunPowerup";
        this.img = getImage("powerup", "shotgun");
    }
}

// ShrapnelBombPowerup
class ShrapnelBombPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "ShrapnelBombPowerup";
        this.img = getImage("powerup", "shrapnal-bomb");
    }
}

// SmokeBombPowerup
class SmokeBombPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "SmokeBombPowerup";
        this.img = getImage("powerup", "smoke-bomb");
    }
}

export const OFFENSIVE_POWERUPS = {
    unknown: OffensiveUnknown,
    boobyTrap: BoobyTrapPowerup,
    chaingun: ChaingunPowerup,
    cryoBomb: CryoBombPowerup,
    doubleBarrel: DoubleBarrelPowerup,
    drill: DrillPowerup,
    droneDetonator: DroneTankDetonatorPowerup,
    droneShooter: DroneTankShooterPowerup,
    laser: LaserPowerup,
    missileHoming: MissileHomingPowerup,
    railgun: RailgunPowerup,
    shotgun: ShotgunPowerup,
    shrapnelBomb: ShrapnelBombPowerup,
    smokeBomb: SmokeBombPowerup,
};



// MARK: Powerups - Defensive

// DefensiveUnknown
class DefensiveUnknown extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "DefensiveUnknown";
        this.img = getImage("powerup", "unknown-blue");
    }
}

// HealingPowerup
class HealingPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "HealingPowerup";
        this.img = getImage("powerup", "healing");
    }
}

// ShieldHPPowerup
class ShieldHPPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "ShieldHPPowerup";
        this.img = getImage("powerup", "shield-hp");
    }
}

// ShieldTimePowerup
class ShieldTimePowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "ShieldTimePowerup";
        this.img = getImage("powerup", "shield-time");
    }
}

export const DEFENSIVE_POWERUPS = {
    unknown: DefensiveUnknown,
    healing: HealingPowerup,
    shieldHp: ShieldHPPowerup,
    shieldTime: ShieldTimePowerup,
};



// MARK: Powerups - Boosts

// BoostUnknown
class BoostUnknown extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "BoostUnknown";
        this.img = getImage("powerup", "unknown-yellow");
    }
}

// BoostBulletDamagePowerup
class BoostBulletDamagePowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "BoostBulletDamagePowerup";
        this.img = getImage("powerup", "boost-bullet-damage");
    }
}

// BoostBulletSpeedPowerup
class BoostBulletSpeedPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "BoostBulletSpeedPowerup";
        this.img = getImage("powerup", "boost-bullet-speed");
    }
}

// BoostMovementSpeedPowerup
class BoostMovementSpeedPowerup extends PowerUp {
    constructor(owner, posSpawn = new Vec2(), angleSpawn = 0, scaleSpawn = 1, speedSpawn = 0, angleVel = 0, lifeSpan = 10.000) {
        super(owner, posSpawn, angleSpawn, scaleSpawn, speedSpawn, angleVel, lifeSpan);
        this.type = "BoostMovementSpeedPowerup";
        this.img = getImage("powerup", "boost-movement-speed");
    }
}

export const BOOST_POWERUPS = {
    unknown: BoostUnknown,
    bulletDamage: BoostBulletDamagePowerup,
    bulletSpeed: BoostBulletSpeedPowerup,
    movementSpeed: BoostMovementSpeedPowerup,
};