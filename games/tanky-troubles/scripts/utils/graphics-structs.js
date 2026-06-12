import { getGlobal } from '../global-state.js';
import { drawRect, drawCircle, drawVertexPolygon, drawTextBox, drawLine } from './graphics-utils.js'
import { darkenHex } from './color-utils.js'






//      |============================|
//      |      Graphics Structs      |
//      |============================|



// MARK: drawGraph
export function drawGraphBarsTYPEringBuffer(ctx, graphPos, graphSize, range, barValues, ringBufferIndex, ringBufferCount, graphColor, graphTitle, unit) {

    // Draw graph grid
    const gridSize = 0;  // MARK: TODO: Grid

    // Draw graph outline
    drawRect(ctx, graphPos, graphSize, "#9999", "#444", 2);

    // Draw bars
    const barWidth = graphSize.w / barValues.length;

    for (let i = 0; i < ringBufferCount; i++) {
        const idx = (ringBufferIndex + i) % barValues.length;
        const value = barValues[idx];

        const normalized = (value - range.min) / (range.max - range.min);
        const clamped = Math.max(0, Math.min(normalized, 1));

        const minHeight = 2 ;
        const barHeight = Math.max(clamped * graphSize.h, minHeight);

        const barRect = {
            pos: { x: graphPos.x + i * barWidth, y: graphPos.y + graphSize.h - barHeight },
            size: { w: barWidth, h: barHeight },
            fillColor: graphColor,
            strokeColor: null,
            strokeWidth: 1,
            borderRadius: 0,
        };

        drawRect(ctx, barRect.pos, barRect.size, barRect.fillColor, barRect.strokeColor, barRect.strokeWidth, barRect.borderRadius);
    }

    // Lines
    const points = [];

    for (let i = 0; i < ringBufferCount; i++) {
        const idx = (ringBufferIndex + i) % barValues.length;
        const value = getSmoothedValue(barValues, idx, 5);

        const normalized = (value - range.min) / (range.max - range.min);
        const clamped = Math.max(0, Math.min(normalized, 1));

        const x = graphPos.x + i * barWidth;
        const y = graphPos.y + graphSize.h - (clamped * graphSize.h);

        points.push({ x, y });
    }
    for (let i = 0; i < points.length - 1; i++) {
        drawLine(ctx, points[i], points[i + 1], darkenHex(graphColor, 30), 3);
    }
    
    const textHeight = 16;
    const latestIndex = (barValues.length + ringBufferIndex - 1) % barValues.length;
    const currentValue = getSmoothedValue(barValues, latestIndex, 10);
    drawTextBox(
        ctx,
        `${graphTitle}: ${Math.round(currentValue)} ${unit}`,
        graphPos,
        { w: graphSize.w * 3/4, h: (textHeight + 2)},
        {
            backgroundColor: "#222",
            borderColor: "#000000",
            borderWidth: 1 ,
            borderRadius: 2 ,
            padding: { x: 1, y: 1 },
            textStyle: {
                fontSize: 16 , // px
                font: "Arial",
                textColor: graphColor,
                outlineColor: "#000",
                outlineWidth: 2 , // px
            },
        },
    )
}

function getSmoothedValue(values, idx, window = 3) {
    let sum = 0;
    let count = 0;

    for (let i = 0; i < window; i++) {
        const j = (values.length + idx - i) % values.length;
        sum += values[j];
        count++;
    }

    return sum / count;
}
