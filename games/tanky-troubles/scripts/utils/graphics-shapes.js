import { getGlobal } from '../global-state.js';
import { drawCircle, drawVertexLine, drawVertexPolygon} from './graphics-utils.js'






//      |===========================|
//      |      Graphics Shapes      |
//      |===========================|



// MARK: drawExplosion
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
        const y = pos.y + mouthRadius * Math.sin(angle); // offset down a bit
        mouthVertices.push({ x: x - pos.x, y: y - pos.y }); // relative to pos
    }

    drawVertexLine(ctx, pos, 0, mouthVertices, "#000", 5 / renderScale);
}

// MARK: drawRocket
export function drawRocket(ctx, pos, scale, color) {

    scale *= 0.2; // needs to be fixed laterl lol (TODO)
    
    const rocketVertices = [
        { x:  scale/1,    y: 0 },
        { x:  scale/1.25, y: -scale/3 },
        { x:  0,          y: -scale/2 },
        { x: -scale/2.5,  y: -scale/2 },
        { x: -scale/1.3,  y: -scale/1.5 },
        { x: -scale/1,    y: -scale/1.5 },
        { x: -scale/1.8,  y: -scale/3.5 },
        { x: -scale/1.8,  y: -scale/6 },
        { x: -scale/1.5,  y: -scale/6 },
        { x: -scale/1.6,  y: 0 },
        { x: -scale/1.5,  y: scale/6 },
        { x: -scale/1.8,  y: scale/6 },
        { x: -scale/1.8,  y: scale/3.5 },
        { x: -scale/1,    y: scale/1.5 },
        { x: -scale/1.3,  y: scale/1.5 },
        { x: -scale/2.5,  y: scale/2 },
        { x: 0,           y: scale/2 },
        { x:  scale/1.25, y: scale/3 },
    ];

    drawVertexPolygon(
        ctx,
        pos,
        0,
        rocketVertices,
        color,
        "#000000",
        0.02
    );
}