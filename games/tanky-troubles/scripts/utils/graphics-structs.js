import { getGlobal } from '../global-state.js';
import { drawRect, drawCircle, drawVertexLine, drawVertexPolygon, drawTextBox} from './graphics-utils.js'






//      |============================|
//      |      Graphics Structs      |
//      |============================|



// MARK: drawGraph
export function drawGraphBarsTYPEringBuffer(ctx, graphPos, graphSize, range, barValues, ringBufferIndex, ringBufferCount, graphColor, graphTitle) {
    const renderScale = getGlobal().renderScale;

    // Draw graph grid
    const gridSize = 0;  // MARK: TODO: Grid

    // Draw graph outline
    drawRect(ctx, graphPos, graphSize, "#9999", "#444", 2 / renderScale);
    // drawRect(ctx, graphPos, graphSize, "#51ff002c", "#ff0000", 2 / renderScale);

    // Draw bars
    const barWidth = graphSize.w / barValues.length;

    for (let i = 0; i < ringBufferCount; i++) {
        const idx = (ringBufferIndex + i) % barValues.length;
        const value = barValues[idx];

        const normalized = (value - range.min) / (range.max - range.min);
        const clamped = Math.max(0, Math.min(normalized, 1));

        const minHeight = 2 / renderScale;
        const barHeight = Math.max(clamped * graphSize.h, minHeight);

        const barRect = {
            pos: { x: graphPos.x + i * barWidth, y: graphPos.y + graphSize.h - barHeight },
            size: { w: barWidth, h: barHeight },
            fillColor: graphColor,
            strokeColor: null,
            strokeWidth: 1 / renderScale,
            borderRadius: 0,
        };

        drawRect(ctx, barRect.pos, barRect.size, barRect.fillColor, barRect.strokeColor, barRect.strokeWidth, barRect.borderRadius);
    }
    
    const textHeight = 16;
    const currentValue = barValues[ringBufferIndex];
    drawTextBox(
        ctx,
        `${graphTitle}: ${Math.round(currentValue)}`,
        graphPos,
        { w: graphSize.w / 2, h: (textHeight + 2) / renderScale},
        {
            backgroundColor: "#222",
            borderColor: "#000000",
            borderWidth: 1 / renderScale,
            borderRadius: 2 / renderScale,
            padding: { x: 1 / renderScale, y: 1 / renderScale },
            textStyle: {
                fontSize: 16 / renderScale, // px
                font: "Arial",
                textColor: graphColor,
                outlineColor: "#000",
                outlineWidth: 2 / renderScale, // px
            },
        },
    )
}
