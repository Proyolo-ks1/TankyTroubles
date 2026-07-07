import { getGlobal } from '../global-state.js';
import { drawRect, drawCircle, drawVertexPolygon, drawTextBox, drawLine } from './graphics-utils.js'
import { darkenHex } from './color-utils.js'






//      |============================|
//      |      Graphics Structs      |      -> yes, this has nothing to do with structs
//      |============================|



// MARK: drawGraph
// - range min=max for completely auto
export function drawGraphBarsTYPEringBuffer(ctx, graphPos, graphSize, range, barValues, ringBufferIndex, ringBufferCount, graphColor, graphTitle, unit, currentSmoothedValue) {

    // Draw graph grid
    const gridSize = 0;  // MARK: TODO: Grid
    const gridRange = { min: range.min, max: range.max };

    // Draw graph background
    drawRect(ctx, graphPos, graphSize, "#9999", "#444", 2);

    // Draw bars
    const barWidth = graphSize.w / barValues.length;

    if (range.mode === "auto") {
        const { min, max } = getMinMaxFromArray(barValues);
        if (min < range.min) { gridRange.min = min}
        if (max > range.max) { gridRange.max = max}
    } // else its probably "static"
    
    if (currentSmoothedValue.min === null) {
        currentSmoothedValue.min = gridRange.min;
        currentSmoothedValue.max = gridRange.max;
    }

    // Calculate min & max with smoothing
    const smoothing = 0.95; // more is smoother
    currentSmoothedValue.min = (currentSmoothedValue.min * smoothing) + (gridRange.min * (1 - smoothing));
    currentSmoothedValue.max = (currentSmoothedValue.max * smoothing) + (gridRange.max * (1 - smoothing));
    const currentMinSmoothed = currentSmoothedValue.min;
    const currentMaxSmoothed = currentSmoothedValue.max;
    for (let i = 0; i < ringBufferCount; i++) {
        const idx = (ringBufferIndex + i) % barValues.length;
        const value = barValues[idx];

        const normalized = (value - currentMinSmoothed) / (currentMaxSmoothed - currentMinSmoothed);
        const clamped = Math.max(0, Math.min(normalized, 1));

        const minHeight = 2 ;
        const barHeight = Math.max(clamped * graphSize.h, minHeight);

        const barRect = {
            pos: { x: graphPos.x + i * barWidth, y: graphPos.y + graphSize.h - barHeight },
            size: { w: barWidth, h: barHeight },
            fillColor: graphColor,
            strokeColor: graphColor,
            strokeWidth: 1,
            borderRadius: 0,
        };

        drawRect(ctx, barRect.pos, barRect.size, barRect.fillColor, barRect.strokeColor, barRect.strokeWidth, barRect.borderRadius);
    }
    // Draw graph outline
    drawRect(ctx, graphPos, graphSize, null, "#444", 2);

    // Lines
    const points = [];

    for (let i = 0; i < ringBufferCount; i++) {
        const idx = (ringBufferIndex + i) % barValues.length;
        const value = getSmoothedValue(barValues, idx, 5);

        const normalized = (value - currentMinSmoothed) / (currentMaxSmoothed - currentMinSmoothed);
        const clamped = Math.max(0, Math.min(normalized, 1));

        const x = graphPos.x + i * barWidth;
        const y = graphPos.y + graphSize.h - (clamped * graphSize.h);

        points.push({ x, y });
    }
    for (let i = 0; i < points.length - 1; i++) {
        drawLine(ctx, points[i], points[i + 1], darkenHex(graphColor, 30), 3);
    }

    // Graph Grid
    const yValueRange = gridRange.max - gridRange.min;
    const spacing = Math.round(900 / yValueRange);
    const yPixelRange = graphPos.add(graphSize).y - graphPos.y
    for (let i = yPixelRange; i > 0; i--) {
        if (i % spacing === 0) {
            drawLine(ctx, { x: graphPos.x, y: graphPos.y + i } , { x: graphPos.add(graphSize).x, y: graphPos.y + i }, darkenHex(graphColor, 30), 2);
        }
    }
    
    // Graph Label
    const textHeight = 16;
    const latestIndex = (barValues.length + ringBufferIndex - 1) % barValues.length;
    const currentValueSmoothed = getSmoothedValue(barValues, latestIndex, 10);
    drawTextBox(
        ctx,
        `${graphTitle}: ${Math.round(currentValueSmoothed)} ${unit} | gridRange: ${gridRange.min};${gridRange.max} | Smooth: ${currentMinSmoothed.toFixed(2)};${currentMaxSmoothed.toFixed(2)}`,
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

// position is the middle bottom
export function drawHealthBar(ctx, Position, lifeSpan, age, barHeight) {
    const renderScale = getGlobal().renderScale

    const life = Math.min(1, Math.max(0, age / lifeSpan));
    const fillColor =
        life > 0.75 ? "#ff0000" :
        life > 0.5 ? "#ffcc00" :
                    "#00ff00";

    const barSize = { w: 50 / renderScale, h: barHeight }
    const barPos = { x: Position.x - 0.5 * barSize.w, y: Position.y - barSize.h } // Center Bottom like the text.
    drawRect(ctx, barPos, barSize, "#000000aa", "#555555", 2/ renderScale); // background
    drawRect(ctx, barPos, { w: barSize.w * life, h: barSize.h }, fillColor, null, 0); // background
    // drawText(ctx, shortName, Position, textStyle);
}



// === Helper functions ===

function getMinMaxFromArray(arr) {
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < arr.length; i++) {
        const v = arr[i];
        if (v < min) min = v;
        if (v > max) max = v;
    }

    return { min, max };
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