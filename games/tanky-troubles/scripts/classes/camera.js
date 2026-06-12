import { getGlobal, ENTITY_TYPES } from '../global-state.js';
import { drawRect, drawCircle, drawRegPolygon, drawLine, drawVectorArrow} from '../utils/graphics-utils.js';
import { Vec2, lerp } from "../utils/math-utils.js";






//      |==================|
//      |      CAMERA      |
//      |==================|



class Camera {
    constructor() {
        this.pos = new Vec2();
        this.posTarget = new Vec2();
        this.targetEntities = []; // e.g. follow player(s)
        this.zoomLevel = 1 / 8;
        this.zoomLevelTarget = 1 / 8;
        this.smoothness = 0.005; // camera lerp (current -> target)
        this.padding = 1
    }

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
        
        const { bounds, center } = getBoundsAndCenter(this.targetEntities);
        
        // Positon
        this.posTarget.set(center.x, center.y);
        this.pos.lerp(this.posTarget, this.smoothness);

        // Zoom
        const canvasRatio = gameApi.canvasWidth / gameApi.canvasHeight;
        const spread = Math.max(bounds.size.w, bounds.size.h * canvasRatio);
        this.zoomLevelTarget = 1 / Math.max(2, Math.min(100, this.padding*2 + spread)); // 1 / Horizontal Tiles
        this.zoomLevel = lerp(this.zoomLevel, this.zoomLevelTarget, this.smoothness);
    }

    // == NEW after / renderscale ==
    // debugrender(ctx, gameDeltaTime, canvasWidth, canvasHeight) {
    //     const renderScale = getGlobal().renderScale;
        
    //     const { bounds, center } = getBoundsAndCenter(this.targetEntities);

    //     drawRect(ctx, bounds.pos.scale(renderScale), { x: bounds.size.x * renderScale, y: bounds.size.y * renderScale }, undefined, "rgb(253, 172, 51)", 5)
    //     drawRect(ctx,bounds.pos.scale(renderScale), { x: bounds.size.x * renderScale, y: bounds.size.y * renderScale }, undefined, "rgb(253, 91, 51)", 5)
    //     for (const target of this.targetEntities) {
    //         drawCircle(ctx, target.pos.scale(renderScale), 10, "rgb(84, 201, 181)")
    //         drawLine(ctx, target.pos.scale(renderScale), center.scale(renderScale), "rgb(84, 201, 181)", 5)
    //     }
    //     drawCircle(ctx, center.scale(renderScale), 10 / renderScale, "rgb(60, 85, 81)")
    //     const screenCenter = new Vec2(canvasWidth / 2, canvasHeight / 2);
    //     drawVectorArrow(ctx, screenCenter, center.scale(renderScale).sub(screenCenter), "rgb(162, 102, 231)", 5)
    //     drawCircle(ctx, screenCenter, 10, "rgb(122, 36, 221)")
    // }

    
    // == OLD before / renderscale ==
    debugrender(ctx, gameDeltaTime, canvasWidth, canvasHeight) {
        const renderScale = getGlobal().renderScale;
        
        const { bounds, center } = getBoundsAndCenter(this.targetEntities);

        drawRect(ctx,  bounds.pos.sub({x: this.padding, y: this.padding}), {w: bounds.size.w+ 2*this.padding, h: bounds.size.h + 2*this.padding}, undefined, "rgb(253, 172, 51)", 5 / renderScale)
        drawRect(ctx, bounds.pos, bounds.size, undefined, "rgb(253, 91, 51)", 5 / renderScale)
        for (const target of this.targetEntities) {
            drawCircle(ctx, target.pos, 10 / renderScale, "rgb(84, 201, 181)")
            drawLine(ctx, target.pos, center, "rgb(84, 201, 181)", 5 / renderScale)
        }
        drawCircle(ctx, center, 10 / renderScale, "rgb(60, 85, 81)")
        const screenCenter = this.pos
        drawVectorArrow(ctx, screenCenter, center.sub(screenCenter), "rgb(162, 102, 231)", 5 / renderScale)
        drawCircle(ctx, screenCenter, 10 / renderScale, "rgb(122, 36, 221)")
    }
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