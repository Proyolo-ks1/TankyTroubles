import { getGlobal, ENTITY_TYPES } from '../global-state.js';
import { drawRect, drawCircle, drawRegPolygon, drawLine, drawVectorArrow} from '../utils/graphics-utils.js';
import { Vec2, lerp, lerpAngle, normalizeAngle } from "../utils/math-utils.js";






//      |==================|
//      |      CAMERA      |
//      |==================|



class Camera {
    constructor() {
        this.pos = new Vec2(); // World Space
        this.posTarget = new Vec2();
        this.zoomLevel = 1 / 8;
        this.zoomLevelTarget = 1 / 8;
        this.angle = 0;
        this.angleTarget = 0;
        this.targetEntities = []; // e.g. follow player(s)
        this.doTrackRotation = false;
        this.doTrackPosition = false;
        this.doTrackZoom = false;
        this.smoothness = 0.02; // camera lerp (current -> target)
        this.padding = 1; // tiles
        this.zoomMax = 1; // tiles
        this.zoomMin = 0.01; //tiles
        this.renderRadius = 1
    }

    // so its probably smarter to not use scale -1 so it flips y, because now text is upside down, but to just 
    setTargets(entities) {
        this.targetEntities = entities;
    }

    update(gameDeltaTime) {
        const gameApi = document.getElementById("game-container").runningGameApi;

        if (gameApi.mouse) {
            // console.log(`gameApi.mouse.pos: ${gameApi.mouse.pos.x},${gameApi.mouse.pos.y}`);
            // this.posTarget = {x: gameApi.mouse.pos.x / 100, y: gameApi.mouse.pos.y / 100};
            // this.posTarget = getGlobal().entities.tanks[0].pos;
        }
        
        if (this.targetEntities.length === 0) return;

        let bounds;
        let center;
        if (this.doTrackPosition || this.doTrackZoom) {
            ({ bounds, center } = getBoundsAndCenter(this.targetEntities));
        }

        // Positon
        if (this.doTrackPosition) {
            if (this.targetEntities.length === 1) {
                console.log(` this.targetEntities[0].vel: ${ this.targetEntities[0].vel}`);
                this.posTarget = new Vec2(center.x, center.y).add(this.targetEntities[0].vel.scaleMut(0.5));
                this.pos.lerp(this.posTarget, this.smoothness);
            } else {
                this.posTarget.set(center.x, center.y);
                this.pos.lerp(this.posTarget, this.smoothness);
            }
        }

        // Zoom
        if (this.doTrackZoom) {
            const canvasRatio = gameApi.canvasWidth / gameApi.canvasHeight;
            const spread = Math.max((bounds.size.w + 2*this.padding), (bounds.size.h + 2*this.padding) * canvasRatio);
            this.zoomLevelTarget = Math.max(this.zoomMin, Math.min(this.zoomMax, 1 / spread));
            this.zoomLevel = lerp(this.zoomLevel, this.zoomLevelTarget, this.smoothness);
        }

        // Rotation
        if (this.doTrackRotation) {
            if (this.targetEntities.length > 2) return;
            if (this.targetEntities.length === 1) {
                this.angleTarget = this.targetEntities[0].angle - 0.5*Math.PI;
                this.angle = normalizeAngle(this.angle);
                this.angle = lerpAngle(this.angle, this.angleTarget, this.smoothness * 2);
            }
            if (this.targetEntities.length === 2) {
                const dx = this.targetEntities[1].pos.x - this.targetEntities[0].pos.x;
                const dy = this.targetEntities[1].pos.y - this.targetEntities[0].pos.y;
                this.angleTarget = Math.atan2(dy, dx);
                this.angle = normalizeAngle(this.angle);
                this.angle = lerpAngle(this.angle, this.angleTarget, this.smoothness);
            }
            console.log(`Cam.angle: ${this.angle.toFixed(3)} rad`);
        }
    }

    debugrender(ctx, gameDeltaTime, canvasWidth, canvasHeight) {
        if (this.targetEntities.length === 0) return;
        const renderScale = getGlobal().renderScale;
        
        const { bounds, center } = getBoundsAndCenter(this.targetEntities);

        drawRect(ctx,  bounds.pos.sub({x: this.padding, y: this.padding}), {w: bounds.size.w+ 2*this.padding, h: bounds.size.h + 2*this.padding}, undefined, "rgb(253, 172, 51)", 5 / renderScale)
        drawRect(ctx, bounds.pos, bounds.size, undefined, "rgb(253, 91, 51)", 5 / renderScale)

        const p = this.padding;

        const oTL = { x: bounds.pos.x - p, y: bounds.pos.y - p };
        const oTR = { x: bounds.pos.x + bounds.size.w + p, y: bounds.pos.y - p };
        const oBR = { x: bounds.pos.x + bounds.size.w + p, y: bounds.pos.y + bounds.size.h + p };
        const oBL = { x: bounds.pos.x - p, y: bounds.pos.y + bounds.size.h + p };

        const iTL = bounds.pos;
        const iTR = { x: bounds.pos.x + bounds.size.w, y: bounds.pos.y };
        const iBR = { x: bounds.pos.x + bounds.size.w, y: bounds.pos.y + bounds.size.h };
        const iBL = { x: bounds.pos.x, y: bounds.pos.y + bounds.size.h };

        drawLine(ctx, oTL, iTL, "rgb(253, 91, 51)", 2 / renderScale);
        drawLine(ctx, oTR, iTR, "rgb(253, 91, 51)", 2 / renderScale);
        drawLine(ctx, oBR, iBR, "rgb(253, 91, 51)", 2 / renderScale);
        drawLine(ctx, oBL, iBL, "rgb(253, 91, 51)", 2 / renderScale);

        for (const target of this.targetEntities) {
            drawCircle(ctx, target.pos, 10 / renderScale, "rgb(253, 91, 51)")
            // drawLine(ctx, target.pos, center, "rgb(253, 91, 51)", 5 / renderScale)
        }

        // Position
        drawLine(ctx, iTL, iBR, "rgb(80, 133, 124)", 5 / renderScale);
        drawLine(ctx, iTR, iBL, "rgb(80, 133, 124)", 5 / renderScale);
        drawCircle(ctx, center, 10 / renderScale, "rgb(80, 133, 124)")
        const screenCenter = this.pos
        drawVectorArrow(ctx, screenCenter, center.sub(screenCenter), "rgb(162, 102, 231)", 5 / renderScale)
        drawCircle(ctx, screenCenter, 10 / renderScale, "rgb(122, 36, 221)")

        // Zoom
        const zoomTargetRectSize = zoomDebugRectSize(this.zoomLevelTarget, renderScale)
        drawRect(ctx, screenCenter.sub({ x: zoomTargetRectSize.w / 2, y: zoomTargetRectSize.h / 2 }), zoomTargetRectSize, undefined, "rgb(80, 133, 124)", 5 / renderScale)
        const zoomCurrentRectSize = zoomDebugRectSize(this.zoomLevel, renderScale)
        drawRect(ctx, screenCenter.sub({ x: zoomCurrentRectSize.w / 2, y: zoomCurrentRectSize.h / 2 }), zoomCurrentRectSize, undefined, "rgb(122, 36, 221)", 5 / renderScale)

        // Culling
        drawCircle(ctx, screenCenter, this.renderRadius, null, "rgb(150, 200, 200)", 0.02)
    }
}

function zoomDebugRectSize(zoomLevel, renderScale) {
    return  { w: zoomLevel * 100 / renderScale, h: zoomLevel * 100 / renderScale }
}

export const camera = new Camera();






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



function getBoundsAndCenter(entities) {
    if (entities.length === 0) {
        return {
            center: new Vec2(),
            bounds: {
                pos: new Vec2(),
                size: { w: 0, h: 0 }
            }
        };
    }

    if (entities.length === 1) {
        const pos = entities[0].pos;
        return {
            center: pos.clone(),
            bounds: {
                pos: pos.clone(),
                size: { w: 0, h: 0 }
            }
        };
    }

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (let i = 0; i < entities.length; i++) {
        const x = entities[i].pos.x;
        const y = entities[i].pos.y;

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }

    return {
        center: new Vec2((minX + maxX) / 2, (minY + maxY) / 2),
        bounds: {
            pos: new Vec2(minX, minY),
            size: {w: maxX - minX, h: maxY - minY},
        }
    };
}