import { getGlobal, ENTITY_TYPES } from '../global-state.js';
import { drawRect, drawCircle, drawRegPolygon, drawLine, drawVectorArrow} from '../utils/graphics-utils.js';






//      |==================|
//      |      CAMERA      |
//      |==================|



class Camera {
    constructor() {
        this.pos = { x: 0, y: 0 };
        this.posTarget = { x: 0, y: 0 };
        this.targetEntities = []; // e.g. follow player(s)
        this.zoomLevel = 1 / 8;
        this.zoomLevelTarget = 1 / 8;
        this.smoothness = 0.01; // camera lerp (current -> target)
    }

    setTargets(entities) {
        this.targetEntities = entities;
    }

    update() {
        const gameApi = document.getElementById("game-container").runningGameApi;

        if (gameApi.mouse) {
            console.log(`gameApi.mouse.pos: ${gameApi.mouse.pos.x},${gameApi.mouse.pos.y}`);
            // this.posTarget = {x: gameApi.mouse.pos.x / 100, y: gameApi.mouse.pos.y / 100};
            // this.posTarget = getGlobal().entities.tanks[0].pos;
        }
        
        const { bounds, center } = getBoundsAndCenter(this.targetEntities);
        
        // Positon
        this.posTarget = center
        this.pos = lerp2(this.pos, this.posTarget, this.smoothness);

        // Zoom
        const canvasRatio = gameApi.canvasWidth / gameApi.canvasHeight;
        const spread = Math.max(bounds.width, bounds.height * canvasRatio);
        this.zoomLevelTarget = 1 / Math.max(2, Math.min(100, 6 + spread)); // 1 / Horizontal Tiles
        this.zoomLevel = lerp(this.zoomLevel, this.zoomLevelTarget, this.smoothness);
    }
}

export const camera = new Camera();






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerp2(a, b, t) {
    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
    };
}

function getBoundsAndCenter(entities) {
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
        center: {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2
        },
        bounds: {
            width: maxX - minX,
            height: maxY - minY
        }
    };
}