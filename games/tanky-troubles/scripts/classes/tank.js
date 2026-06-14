import { getGlobal } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawLine, drawRegPolygon, drawVectorArrow} from '../utils/graphics-utils.js';
import { posMod, randomSeeded, Vec2} from '../utils/math-utils.js';
import { drawSmiley} from '../utils/graphics-shapes.js';
import { PhysicsObject } from './entity.js';
import { BULLETS } from './bullet.js';
import { PARTICLES } from './particle.js';
import { WEAPONS, OppenheimerBOOOM } from './weapons.js';
import { spawnClassRelatively } from './spawner.js';

// RunningGameApi
const gameApi = document.getElementById("game-container").runningGameApi;

// References
const globalKeys = gameApi.globalKeys





//      |===============|
//      |      TANK     |
//      |===============|



export class Tank extends PhysicsObject {
    static nextId = 0;

    // This constructor has as default values, the values that were analyzed from the original game
    constructor(
        posSpawn = new Vec2(1, 1),
        angleSpawn = 0,
        scale = 1,
        baseDrivingSpeed = 1.6,
        turningSpeed = 5,
        color = "#555",
        controls = {
            up: "ArrowUp",
            down: "ArrowDown",
            left: "ArrowLeft",
            right: "ArrowRight",
            shoot: "m",
        },
        customName
    ) {        
        super({ // PhysicsObject
            pos: posSpawn,
            vel: new Vec2(),
            angle: angleSpawn,
            scale: scale,
        });

        this.name = customName ?? `Tank ${Tank.nextId}`;
        this.shortName = `t${Tank.nextId++}`;

        this.length = 2 / 5; // Tiles
        this.width = 1 / 3 // Tiles
        
        this.baseDrivingSpeed = baseDrivingSpeed;
        this.turningSpeed = turningSpeed;
        this.color = color;
        this.controls = controls;

        this.weapon = new WEAPONS.chainShotgunBoom(this); // Default weapon
        this.maxBullets = 5;       // Only applies to "default" powerup
        this.ammo = -1;            // -1 means infinite "default" ammo

        this.trackRotation = {left: 0, right: 0}
        this.trackRotationSinceMark = {left: 0, right: 0}
        this.health = 1;

        getGlobal().entities.tanks.push(this);
    }

    // Triggered once when the shoot-key is pressed down
    shootPress() {
        this.weapon.press();
    }

    // Triggered as long as the shoot-key is pressed down
    shootHold(gameDeltaTime) {
        this.weapon.hold(gameDeltaTime);
    }

    // Triggered once the shoot-key is released
    shootRelease() {
        this.weapon.release();
    }

    applyPowerUp(PowerUpClass) {
        console.log(`%cTank ${this.name} - PowerUp applied: ${PowerUpClass.name}`, "color: aqua; font-weight: bold;");
        this.weapon = new PowerUpClass(this);
    }

    update(gameDeltaTime) {

        // Detect shooting press & release
        const isShooting = globalKeys[this.controls.shoot];

        if (isShooting && !this.wasShooting) {
            this.shootPress();
        }
        if (!isShooting && this.wasShooting) {
            this.shootRelease();
        }
        this.wasShooting = isShooting;

        // Handle shoot hold
        if (globalKeys[this.controls.shoot]) {
            this.shootHold(gameDeltaTime);
        }
    
        // Rotation - Turning
        const trackCenterRadius = 5 / 12 * this.width;
        if (!(globalKeys[this.controls.left] && globalKeys[this.controls.right])) {
            const linearVelocityAtRadius = trackCenterRadius * this.turningSpeed;
            if (globalKeys[this.controls.left]) {
                this.angle += this.turningSpeed * gameDeltaTime;
                this.trackRotation.left += linearVelocityAtRadius * gameDeltaTime;
                this.trackRotation.right -= linearVelocityAtRadius * gameDeltaTime;
            }
            if (globalKeys[this.controls.right]) {
                this.angle -= this.turningSpeed * gameDeltaTime;
                this.trackRotation.left -= linearVelocityAtRadius * gameDeltaTime;
                this.trackRotation.right += linearVelocityAtRadius * gameDeltaTime;
            }
            this.angle = (this.angle + 2 * Math.PI) % (2 * Math.PI);
        }
    
        // Reset velocity to (0, 0) when no keys are pressed
        this.vel.zero();
    
        // Velocity-based movement
        if (globalKeys[this.controls.up]) {
            this.vel = Vec2.fromAngle(this.angle, this.baseDrivingSpeed);
        }
        if (globalKeys[this.controls.down]) {
            this.vel = Vec2.fromAngle(this.angle, -this.baseDrivingSpeed);
        }

        // Update position using velocity
        this.pos = this.pos.add(this.vel.scale(gameDeltaTime));

        // Update track rotation
        const forwardSpeed = Math.cos(this.angle) * this.vel.x + Math.sin(this.angle) * this.vel.y;
        this.trackRotation.left += forwardSpeed * gameDeltaTime;
        if (Math.abs(this.trackRotationSinceMark.left - this.trackRotation.left) > 0.05) {
            const offset = new Vec2(0, -trackCenterRadius)
            spawnClassRelatively(PARTICLES.tankTrackMark, this, this.pos, this.angle, this.scale, offset, 0, 0, 0, 5.000);
            this.trackRotationSinceMark.left = this.trackRotation.left;
        }
        this.trackRotation.right += forwardSpeed * gameDeltaTime;
        if (Math.abs(this.trackRotationSinceMark.right - this.trackRotation.right) > 0.05) {
            const offset = new Vec2(0, trackCenterRadius)
            spawnClassRelatively(PARTICLES.tankTrackMark, this, this.pos, this.angle, this.scale, offset, 0, 0, 0, 5.000);
            this.trackRotationSinceMark.right = this.trackRotation.right;
        }
        // if (this.name === "tank0") {
        //     window.globalSyncConsoleLogStr += `Tank0\nforwardSpeed: ${forwardSpeed.toFixed(3)} tl/s\ntrack L: ${this.trackRotation.left.toFixed(3)}\ttrack R: ${this.trackRotation.right.toFixed(3)}`;
        // }

        this.updateAge(gameDeltaTime);
        this.updateHitbox();
    }

    render(ctx, realDeltaTime) {
        ctx.save();

        const renderScale = getGlobal().renderScale

        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);

        // Body
        const BodyLength = this.length * this.radius;
        const BodyWidth = this.width * this.radius;
        drawRect(ctx, { x: -BodyLength / 2, y: -BodyWidth / 2 }, { w: BodyLength, h: BodyWidth }, this.color, "black", 0.02);

        // Tracks
        const trackLength = BodyLength;
        const trackWidth = BodyWidth / 6;
        drawRect(ctx, { x: -trackLength / 2, y: -BodyWidth / 2 }, { w: trackLength, h: trackWidth }, this.color, "black", 0.02);
        drawRect(ctx, { x: -trackLength / 2, y: BodyWidth / 2 - trackWidth }, { w: trackLength, h: trackWidth }, this.color, "black", 0.02);

        const amountOfTrackLinks = 12;
        this.trackRotation.left = posMod(this.trackRotation.left, amountOfTrackLinks * 2);
        this.trackRotation.right = posMod(this.trackRotation.right, amountOfTrackLinks * 2);
        const trackLinkLength = trackLength / amountOfTrackLinks;
        const trackLeftRotationRemainder = (this.trackRotation.left % (trackLinkLength * 2));
        const trackRightRotationRemainder = (this.trackRotation.right % (trackLinkLength * 2));
        for (let i = 0; i <= amountOfTrackLinks / 2; i++) {
            const trackLeftX1 = Math.min(Math.max(-trackLength / 2 + trackLinkLength * (2 * i - 1.5) + trackLeftRotationRemainder, -trackLength / 2), trackLength / 2)
            const trackLeftX2 = Math.min(Math.max(-trackLength / 2 + trackLinkLength * (2 * i - 1.5) + trackLeftRotationRemainder + trackLinkLength, -trackLength / 2), trackLength / 2)
            drawRect(ctx, { x: trackLeftX1, y: -BodyWidth / 2 }, { w: trackLeftX2 - trackLeftX1, h: trackWidth }, "rgba(0, 0, 0, 0.3)");
        }
        for (let i = 0; i <= amountOfTrackLinks / 2; i++) {
            const trackRightX1 = Math.min(Math.max(-trackLength / 2 + trackLinkLength * (2 * i - 1.5) + trackRightRotationRemainder, -trackLength / 2), trackLength / 2)
            const trackRightX2 = Math.min(Math.max(-trackLength / 2 + trackLinkLength * (2 * i - 1.5) + trackRightRotationRemainder + trackLinkLength, -trackLength / 2), trackLength / 2)
            drawRect(ctx, { x: trackRightX1, y: BodyWidth / 2 - trackWidth }, { w: trackRightX2 - trackRightX1, h: trackWidth }, "rgba(0, 0, 0, 0.3)");
        }
        
        // TEMP DEBUGGING FOR FIXING TRACK VISUALS
        // if (this.id === "tank0") {
        //     window.globalSyncConsoleLogStr += `\ntrackLinkLength: ${trackLinkLength.toFixed(3)}\ntrackr L: ${trackLeftRotationRemainder.toFixed(3)}\ttrackr R: ${trackRightRotationRemainder.toFixed(3)}`;
        // }

        // Turret
        this.weapon.renderTurret(ctx, realDeltaTime);

        ctx.restore();

        // Player Name or ID
        const text = this.name
        const textPos = { x: this.pos.x, y: this.pos.y - 0.3};
        const textStyle = {
            align: "center",
            baseline: "bottom",
            fontSize: 16 / renderScale, //px
            font: "Consolas",
            fontWeight: "bold",
            textColor: this.color,
            outlineColor: "#000000",
            outlineWidth: 2 / renderScale, //px
        };
        drawText(ctx, text, textPos, textStyle);
    }

    debugrender(ctx, realDeltaTime) {
        // Velocity Arrow
        drawVectorArrow(ctx, this.pos, this.vel, "#0000FF", 0.02);

        // Heading Line
        const headingLength = 1; // Adjust this value to control the length of the heading line
        let heading = this.pos.add(Vec2.fromAngle(this.angle, headingLength));

        // Draw the heading line
        drawLine(ctx, this.pos, heading, "#808", 0.02);

        // Smiley :D
        const renderScale = getGlobal().renderScale
        const smileSize = 15 / renderScale; //px
        drawSmiley(ctx, this.pos, smileSize)

        // Draw the random indicator
        const randomAngle = (randomSeeded(this.id) - 0.5) * 2 * Math.PI;
        heading = this.pos.add(Vec2.fromAngle(randomAngle, headingLength));
        drawLine(ctx, this.pos, heading, "#4c00ff", 0.02);

        const text = `a: ${this.angle.toFixed(2)}π rad`;
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
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset naar screen space
        drawText(ctx, text, textPos, textStyle);
        ctx.restore();
    }
}