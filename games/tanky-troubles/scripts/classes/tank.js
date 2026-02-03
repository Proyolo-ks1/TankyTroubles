import { getGlobal } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawLine, drawRegPolygon, drawVectorArrow} from '../utils/graphics-utils.js';
import { NoWeapon, Chaingun, Shotgun, FlameThrower, ChainShotgun, ShrepnalBombWeapon, ExperimentalWeapon, ChainShotgunBOOM, OppenheimerBOOOM } from './weapons.js';
import { posMod } from '../utils/math-utils.js';
import { PhysicsObject } from './entity.js';
import { OppenheimerBullet } from './bullet.js';

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
    constructor(posSpawn = { x: 1, y: 1 }, angleSpawn = 0, size = {length: 2 / 5, width: 1 / 3}, speed = 1.6, turningSpeed = 5, scale = 1, color = "#555", controls = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "m" }) {
        super({ // PhysicsObject
            pos: posSpawn,
            vel: { x: 0, y: 0 },
            angle: angleSpawn,
        });
        this.name = `Tank ${Tank.nextId}`;
        this.shortName = `t${Tank.nextId++}`;
        
        this.speed = speed;
        this.turningSpeed = turningSpeed;
        this.scale = scale
        this.size = { length: size.length * scale, width: size.width * scale };
        this.color = color;
        this.controls = controls;
        this.weapon = new FlameThrower(this); // Default weapon
        this.maxBullets = 5;       // Only applies to "default" powerup
        this.ammo = -1;            // -1 means infinite "default" ammo
        this.trackRotation = {left: 0, right: 0}

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

    update(realDeltaTime) {

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
            this.shootHold(realDeltaTime);
        }
    
        // Rotation - Turning
        if (!(globalKeys[this.controls.left] && globalKeys[this.controls.right])) {
            let trackCenterRadius = 5 / 12 * this.size.width
            const linearVelocityAtRadius = trackCenterRadius * this.turningSpeed
            if (globalKeys[this.controls.left]) {
                this.angle -= this.turningSpeed * realDeltaTime;
                this.trackRotation.left -= linearVelocityAtRadius * realDeltaTime;
                this.trackRotation.right += linearVelocityAtRadius * realDeltaTime;
            }
            if (globalKeys[this.controls.right]) {
                this.angle += this.turningSpeed * realDeltaTime;
                this.trackRotation.left += linearVelocityAtRadius * realDeltaTime;
                this.trackRotation.right -= linearVelocityAtRadius * realDeltaTime;
            }
            this.angle = (this.angle + 2 * Math.PI) % (2 * Math.PI);
        }
    
        // Reset velocity to (0, 0) when no keys are pressed
        this.vel.x = 0;
        this.vel.y = 0;
    
        // Velocity-based movement
        if (globalKeys[this.controls.up]) {
            this.vel.x = Math.cos(this.angle) * this.speed;
            this.vel.y = Math.sin(this.angle) * this.speed;
        }
        if (globalKeys[this.controls.down]) {
            this.vel.x = -Math.cos(this.angle) * this.speed;
            this.vel.y = -Math.sin(this.angle) * this.speed;
        }

        // Update position using velocity
        this.pos.x += this.vel.x * realDeltaTime;
        this.pos.y += this.vel.y * realDeltaTime;

        // Update track rotation
        const forwardSpeed = Math.cos(this.angle) * this.vel.x + Math.sin(this.angle) * this.vel.y;
        this.trackRotation.left += forwardSpeed * realDeltaTime;
        this.trackRotation.right += forwardSpeed * realDeltaTime;
        // if (this.name === "tank0") {
        //     window.globalSyncConsoleLogStr += `Tank0\nforwardSpeed: ${forwardSpeed.toFixed(3)} tl/s\ntrack L: ${this.trackRotation.left.toFixed(3)}\ttrack R: ${this.trackRotation.right.toFixed(3)}`;
        // }
    }

    render(ctx, realDeltaTime) {
        ctx.save();

        const renderScale = getGlobal().canvasScale * getGlobal().zoomLevel;

        ctx.translate(this.pos.x * renderScale, this.pos.y * renderScale);
        ctx.rotate(this.angle);

        // Body
        const BodyLength = this.size.length
        const BodyWidth = this.size.width
        drawRect(ctx, { x: -BodyLength / 2, y: -BodyWidth / 2 }, { width: BodyLength, height: BodyWidth }, this.color, "black", 0.02);

        // Tracks
        const trackLength = BodyLength
        const trackWidth = this.size.width / 6
        drawRect(ctx, { x: -trackLength / 2, y: -BodyWidth / 2 }, { width: trackLength, height: trackWidth }, this.color, "black", 0.02);
        drawRect(ctx, { x: -trackLength / 2, y: BodyWidth / 2 - trackWidth }, { width: trackLength, height: trackWidth }, this.color, "black", 0.02);

        const amountOfTrackLinks = 12;
        this.trackRotation.left = posMod(this.trackRotation.left, amountOfTrackLinks * 2);
        this.trackRotation.right = posMod(this.trackRotation.right, amountOfTrackLinks * 2);
        const trackLinkLength = trackLength / amountOfTrackLinks;
        const trackLeftRotationRemainder = (this.trackRotation.left % (trackLinkLength * 2));
        const trackRightRotationRemainder = (this.trackRotation.right % (trackLinkLength * 2));
        for (let i = 0; i <= amountOfTrackLinks / 2; i++) {
            const trackLeftX1 = Math.min(Math.max(-trackLength / 2 + trackLinkLength * (2 * i - 1.5) + trackLeftRotationRemainder, -trackLength / 2), trackLength / 2)
            const trackLeftX2 = Math.min(Math.max(-trackLength / 2 + trackLinkLength * (2 * i - 1.5) + trackLeftRotationRemainder + trackLinkLength, -trackLength / 2), trackLength / 2)
            drawRect(ctx, { x: trackLeftX1, y: -BodyWidth / 2 }, { width: trackLeftX2 - trackLeftX1, height: trackWidth }, "rgba(0, 0, 0, 0.3)");
        }
        for (let i = 0; i <= amountOfTrackLinks / 2; i++) {
            const trackRightX1 = Math.min(Math.max(-trackLength / 2 + trackLinkLength * (2 * i - 1.5) + trackRightRotationRemainder, -trackLength / 2), trackLength / 2)
            const trackRightX2 = Math.min(Math.max(-trackLength / 2 + trackLinkLength * (2 * i - 1.5) + trackRightRotationRemainder + trackLinkLength, -trackLength / 2), trackLength / 2)
            drawRect(ctx, { x: trackRightX1, y: BodyWidth / 2 - trackWidth }, { width: trackRightX2 - trackRightX1, height: trackWidth }, "rgba(0, 0, 0, 0.3)");
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
        const textPos = { x: this.pos.x, y: this.pos.y - 0.3 * this.scale };
        const textStyle = {
            align: "center",
            baseline: "bottom",
            fontSize: 1,
            font: "Consolas",
            textColor: this.color,
            outlineColor: "#000000",
            outlineWidth: 0.02
        };
        drawText(ctx, text, textPos, textStyle);
    }

    debugrender(ctx, realDeltaTime) {
        // Velocity Arrow
        drawVectorArrow(ctx, this.pos, this.vel, "#0000FF", 0.02);

        // Heading Line
        const headingLength = 1; // Adjust this value to control the length of the heading line
        const headingX = this.pos.x + Math.cos(this.angle) * headingLength;
        const headingY = this.pos.y + Math.sin(this.angle) * headingLength;

        // Draw the heading line
        drawLine(ctx, this.pos, { x: headingX, y: headingY }, "#808", 0.02);
    }
}