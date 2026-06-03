import { getGlobal } from '../global-state.js';
import { drawCircle, drawVertexLine, drawVertexPolygon} from './graphics-utils.js'






//      |===========================|
//      |      Graphics Shapes      |
//      |===========================|



// MARK: drawExplosion
// TODO

// MARK: drawSmiley
export function drawSmiley(ctx, pos, smileSize) {
    const renderScale = getGlobal().renderScale;

    // Face
    const faceRadius = smileSize; // base radius
    drawCircle(ctx, pos, faceRadius, "#FFEB3B", "#000", 5 / renderScale);

    // Eyes
    const eyeOffsetX = faceRadius / 3;
    const eyeOffsetY = faceRadius / 3;
    const eyeRadius = faceRadius / 10;

    drawCircle(ctx, { x: pos.x - eyeOffsetX, y: pos.y - eyeOffsetY }, eyeRadius, "#000");
    drawCircle(ctx, { x: pos.x + eyeOffsetX, y: pos.y - eyeOffsetY }, eyeRadius, "#000");

    // Mouth as a simple arc using vertices
    const mouthRadius = faceRadius / 2;
    const mouthVertices = [];
    const smileArcPixelLength = 10; //MARK: TODO: accurately calculate smileArcPixelLength
    const segments = Math.max(2, 2 / smileSize);
    // console.log(`SmileSegments: ${segments.toFixed(1)}\nlength: ${smileArcPixelLength.toFixed(1)} px`);
    const startAngle = Math.PI * 0.2; // slightly right of horizontal
    const endAngle = Math.PI * 0.8;   // slightly left of horizontal

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = startAngle + t * (endAngle - startAngle);
        const x = pos.x + mouthRadius * Math.cos(angle);
        const y = pos.y + mouthRadius * Math.sin(-angle); // offset down a bit
        mouthVertices.push({ x: x - pos.x, y: y - pos.y }); // relative to pos
    }

    drawVertexLine(ctx, pos, 0, mouthVertices, "#000", 5 / renderScale);
}

// MARK: drawRocket
const ROCKET_VERTICES = [
    { x:  1,     y: 0 },
    { x:  0.8,   y: -0.33 },
    { x:  0,     y: -0.5 },
    { x: -0.4,   y: -0.5 },
    { x: -0.77,  y: -0.66 },
    { x: -1,     y: -0.66 },
    { x: -0.55,  y: -0.28 },
    { x: -0.55,  y: -0.16 },
    { x: -0.66,  y: -0.16 },
    { x: -0.62,  y: 0 },
    { x: -0.66,  y: 0.16 },
    { x: -0.55,  y: 0.16 },
    { x: -0.55,  y: 0.28 },
    { x: -1,     y: 0.66 },
    { x: -0.77,  y: 0.66 },
    { x: -0.4,   y: 0.5 },
    { x:  0,     y: 0.5 },
    { x:  0.8,   y: 0.33 },
];

const ROCKET_SIZE = 0.1; // Tiles

export function drawRocket(ctx, pos, angle, scale, color) {

    const renderScale = getGlobal().renderScale

    scale = ROCKET_SIZE * scale; // needs to be fixed laterl lol (TODO)

    ctx.save();

    ctx.translate(pos.x, pos.y);
    ctx.rotate(-angle);
    ctx.scale(scale, scale);

    drawVertexPolygon(
        ctx,
        { x: 0, y: 0 },
        0,
        ROCKET_VERTICES,
        color,
        "#000000",
        0.05
    );

    ctx.restore();
}

// MARK: drawNuclearIcon
export function drawNuclearIcon(ctx, pos, scale, color) {

    const domeRadius = this.tank.width / 3;
    drawCircle(ctx, {x: 0, y: 0}, domeRadius, "#000");
    drawCircle(ctx, {x: 0, y: 0}, domeRadius * 0.8, GLOBAL_COLOR_KEYS.ATOMIC_YELLOW);
    for (let i = 0; i < 3; i++) {
        let triangleAngle = Math.PI + Math.PI * 2 / 3 * i;
        let triangleRotAngle = triangleAngle + Math.PI;
        let trianglePosRadius = domeRadius * 0.55;
        let trianglePos = { x: trianglePosRadius * Math.cos(triangleAngle) , y: trianglePosRadius * Math.sin(-triangleAngle) };
        drawRegPolygon(ctx, trianglePos, trianglePosRadius, 3, triangleRotAngle, "#000000");
    }
    drawCircle(ctx, {x: 0, y: 0}, domeRadius * 0.25, "#000");
    drawCircle(ctx, {x: 0, y: 0}, domeRadius * 0.15, GLOBAL_COLOR_KEYS.ATOMIC_YELLOW);
}
