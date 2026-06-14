import { getGlobal, GLOBAL_COLOR_KEYS } from '../global-state.js';
import { drawCircle, drawVertexLine, drawVertexPolygon, drawRegPolygon } from './graphics-utils.js'
import { Vec2 } from "../utils/math-utils.js";






//      |===========================|
//      |      Graphics Shapes      |
//      |===========================|



// MARK: drawExplosion
// TODO

// MARK: drawSmiley
export function drawSmiley(ctx, pos = new Vec2(), smileSize) {
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

    let segmentPos = new Vec2();
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = startAngle + t * (endAngle - startAngle);
        segmentPos = Vec2.fromAngle(angle, mouthRadius);
        mouthVertices.push(segmentPos); // relative to pos
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

export function drawRocket(ctx, pos, angle, scale, color) {
    const renderScale = getGlobal().renderScale
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    drawVertexPolygon(
        ctx,
        new Vec2(),
        0,
        ROCKET_VERTICES,
        color,
        "#000000",
        0.05
    );
    
    ctx.restore();
}

// MARK: drawNuclearIcon
export function drawNuclearIcon(ctx, pos, angle, radius, colorCenter, colorSecondary) {
    drawCircle(ctx, pos, radius, colorSecondary);
    drawCircle(ctx, pos, radius * 0.8, colorCenter);
    for (let i = 0; i < 3; i++) {
        let triangleAngle = angle + Math.PI + Math.PI * 2 / 3 * i;
        let trianglePosRadius = radius * 0.56;
        let trianglePos = pos.add(new Vec2(trianglePosRadius * Math.cos(triangleAngle), trianglePosRadius * Math.sin(triangleAngle)));
        let triangleRotAngle = triangleAngle + Math.PI;
        drawRegPolygon(ctx, trianglePos, trianglePosRadius, 3, triangleRotAngle, colorSecondary);
    }
    drawCircle(ctx, pos, radius * 0.25, colorSecondary);
    drawCircle(ctx, pos, radius * 0.15, colorCenter);
}
