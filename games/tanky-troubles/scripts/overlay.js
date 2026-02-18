import { drawRect, drawVertexPolygon, drawCircle, drawText, drawLine, drawRegPolygon, drawVectorArrow} from './utils/graphics-utils.js';
import { GAME_STATE_KEYS, OVERLAY_STATE_KEYS, getGlobal } from './global-state.js';






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



function createOverlayTextDrawer(ctx, basePos, style, spacing) {
    let lineIndex = 0;

    return function drawNextOverlayLine(text) {
        drawText(ctx, text, {
            x: basePos.x,
            y: basePos.y + lineIndex * (style.fontSize + spacing),
        }, style);

        lineIndex++;
    };
}


let lastRenderStatisticsTime = performance.now();
let overlayFps = 0;
let overlayDeltaTime = 0;
let statisticUpdatesPerSecond = 10

export function renderGameStatistics(ctx, currentTime, realDeltaTime) {
    
    const renderScale = getGlobal().renderScale
    const dbg = getGlobal().statsRingBuffers;
    const DebugLeftPannel = {posX: 0 / renderScale, posY: 0 / renderScale, width: 250 / renderScale, padding: 5 / renderScale} // px

    // Calculate FPS with smoothing
    const smoothing = 0.3; // more is smoother
    const fps = (overlayFps * smoothing) + (1 / realDeltaTime * (1 - smoothing));

    // Update overlay values only at defined intervals
    if (currentTime - lastRenderStatisticsTime >= 1000 / statisticUpdatesPerSecond) {
        overlayFps = fps;
        overlayDeltaTime = realDeltaTime;
        lastRenderStatisticsTime = currentTime;
    }

    const graphBgPosX = DebugLeftPannel.posX + DebugLeftPannel.padding;
    const graphBgPosY = DebugLeftPannel.posY + DebugLeftPannel.padding;
    const graphBgWidth = DebugLeftPannel.width;

    // Graph area
    const graphPadding = 10 / renderScale; // px
    const graphX = graphBgPosX + graphPadding;
    const graphY = graphBgPosY + graphPadding;
    const graphWidth = graphBgWidth - 2 * graphPadding;
    const graphHeight = 150 / renderScale; // px
    
    const amountOfGraphs = Object.keys(dbg).length - 2;
    const graphBgHeight = amountOfGraphs * graphHeight + amountOfGraphs * DebugLeftPannel.padding + DebugLeftPannel.padding;

    // Background rectangle
    const bgRect = {
        pos: { x: graphBgPosX, y: graphBgPosY },
        size: { w: graphBgWidth, h: graphBgHeight },
        fillColor: "rgba(0,0,0,0.5)",
        strokeColor: null,
        strokeWidth: 1 / renderScale,
        borderRadius: 5 / renderScale,
    };
    drawRect(ctx, bgRect.pos, bgRect.size, bgRect.fillColor, bgRect.strokeColor, bgRect.strokeWidth, bgRect.borderRadius);


    // Per graph...
    for (let i = 0; i < amountOfGraphs; i++) {
        //for each graph
    }



    // Graph background

    // Draw graph grid
    const gridSize = 0;  // MARK: TODO: gridSize
    drawRect(ctx, {x: graphX, y: graphY}, {w: graphWidth, h: graphHeight}, "#9999", "#444", 2 / renderScale);
    drawRect(ctx, {x: graphX, y: graphY + graphHeight + graphPadding}, {w: graphWidth, h: graphHeight}, "#9999", "#444", 2 / renderScale);

    // Draw bars
    const barWidth = graphWidth / dbg.calculateTime.length;

    for (let i = 0; i < dbg.count; i++) {
        const idx = (dbg.index + i) % dbg.calculateTime.length;

        const calcMs = dbg.calculateTime[idx];
        const renderMs = dbg.renderTime[idx];

        const maxMs = 30; // Max milliseconds

        const calcHeight = Math.min(calcMs / maxMs, 1) * graphHeight + 2 / renderScale;
        const renderHeight = Math.min(renderMs / maxMs, 1) * graphHeight + 2 / renderScale;

        const calcBarRect = {
            pos: { x: graphX + i * barWidth, y: graphY + graphHeight - calcHeight },
            size: { w: barWidth, h: calcHeight },
            fillColor: "#0f0",
            strokeColor: null,
            strokeWidth: 1 / renderScale,
            borderRadius: 0,
        };

        const renderBarRect = {
            pos: { x: graphX + i * barWidth, y: graphY + graphPadding + graphHeight + graphPadding + graphHeight - renderHeight },
            size: { w: barWidth, h: renderHeight },
            fillColor: "#0ff",
            strokeColor: null,
            strokeWidth: 1 / renderScale,
            borderRadius: 0,
        };

        drawRect(ctx, calcBarRect.pos, calcBarRect.size, calcBarRect.fillColor, calcBarRect.strokeColor, calcBarRect.strokeWidth, calcBarRect.borderRadius);
        drawRect(ctx, renderBarRect.pos, renderBarRect.size, renderBarRect.fillColor, renderBarRect.strokeColor, renderBarRect.strokeWidth, renderBarRect.borderRadius);
    }

    // Background (unit: pixel)
    let pos = { x: graphX, y: graphY + 2 * graphHeight + 3 * graphPadding + 5 / renderScale };
    let textStyle = {
        align: "left",
        baseline: "top",
        fontSize: 16 / renderScale,
        font: "Consolas",
        textColor: "#fff",
        outlineColor: "#000",
        outlineWidth: 2 / renderScale,
    };
    const padding = 5 / renderScale;
    const textSpacing = 2 / renderScale;
    const fontSize = 16 / renderScale; // unsure, something broke this
    const linesOfText = 6;
    const backgroundWidth = DebugLeftPannel.width + 2 * padding;
    const backgroundHeight = linesOfText * fontSize + (linesOfText - 1) * textSpacing + 2 * padding;
    const size = { w: backgroundWidth, h: backgroundHeight };
    const borderRadius = padding;


    // Overlay text
    drawRect(ctx, pos, size, "rgba(0, 0, 0, 0.5)", null, null, borderRadius);
    pos = { x: pos.x + padding, y: pos.y + padding };
    const drawNextLine = createOverlayTextDrawer(ctx, pos, textStyle, textSpacing);

    drawNextLine(`FPS:       ${Math.round(overlayFps)}`);
    drawNextLine(`ΔTime:     ${Math.round(overlayDeltaTime * 1000)} ms`);
    drawNextLine(`TileScale: ${renderScale.toFixed(2)} px/tile`);
    drawNextLine(`Tanks:     ${getGlobal().entities.tanks.length}`);
    drawNextLine(`Bullets:   ${getGlobal().entities.bullets.length}`);
    drawNextLine(`Speed:     ${getGlobal().gameTime.gameSpeed}x`);

    // Toggle Button for debugMode
    const buttonWidth = 150 / renderScale;
    const buttonHeight = 30 / renderScale;
    const buttonPos = { x: pos.x, y: pos.y + 6 * fontSize + 6 * textSpacing + padding };  // Position button below the overlay

    // Draw the button
    drawRect(ctx, buttonPos, { w: buttonWidth, h: buttonHeight }, "rgba(0, 0, 0, 0.7)", "white", 2 / renderScale, 5 / renderScale);

    // Button text (showing current state of debugMode)
    const debugText = getGlobal().debugMode ? "Debug: ON" : "Debug: OFF";
    drawText(ctx, debugText, { x: buttonPos.x + buttonWidth / 2, y: buttonPos.y + buttonHeight / 2 }, { ...textStyle, align: "center", baseline: "middle" });





    // GAME TIME
    const timePanelWidth = 150 / renderScale;
    const timePanelHeight = 75 / renderScale;
    const timePanelPosX = getGlobal().canvasScale / 2 / renderScale - timePanelWidth / 2;
    const timePanelPosY = 5 / renderScale;

    // Background
    drawRect(ctx, { x: timePanelPosX, y: timePanelPosY }, { w: timePanelWidth, h: timePanelHeight }, "rgba(0, 0, 0, 0.7)", "rgba(61, 61, 61, 0.7)", 2 / renderScale, 5 / renderScale);



    // -- Play / Pause --
    const pausePad = 5 / renderScale; // px
    const pauseX = timePanelPosX + pausePad;
    const pauseY = timePanelPosY + pausePad;
    const pauseSize = textStyle.fontSize;
    const gt = getGlobal().gameTime;

    if (gt.paused) {
        // Paused
        const barWidth = pauseSize / 4;
        const barHeight = pauseSize * 0.8;
        const barOffset = pauseSize / 8;
        drawRect(ctx, { x: pauseX + barOffset, y: pauseY + (pauseSize - barHeight) / 2}, { w: barWidth, h: barHeight }, "#ff0000");
        drawRect(ctx, { x: pauseX + pauseSize - barWidth - barOffset, y: pauseY + (pauseSize - barHeight) / 2 }, { w: barWidth, h: barHeight }, "#ff0000");
    } else {
        // Playing
        const triangleOffset = (pauseSize / 2) * 0.25; // its ( radius ) / ( cos(120 degrees) / 2 ) -> which turns out is radius / 0.25
        drawRegPolygon(ctx, { x: pauseX + pauseSize / 2 - triangleOffset, y: pauseY + pauseSize / 2 }, pauseSize / 2, 3, Math.PI * 2, "#33ff00");
    }
    drawText(ctx, `Paused: ${gt.paused}`, { x: pauseX + pauseSize + pausePad, y: pauseY }, textStyle);



    // -- Game Speed --

    // Slider Markers
    const markerPosY = pauseY + pauseSize + pausePad // sliderY - textStyle.fontSize * 1;
    const sliderX = timePanelPosX + pausePad;
    const sliderWidth = timePanelWidth - 2 * pausePad;
    drawText(ctx, "1/32", { x: sliderX, y: markerPosY }, { ...textStyle, align: "left" });
    drawText(ctx, "1", { x: sliderX + sliderWidth / 2, y: markerPosY }, { ...textStyle, align: "center" });
    drawText(ctx, "32", { x: sliderX + sliderWidth, y: markerPosY }, { ...textStyle, align: "right" });

    // Slider line
    const sliderY = pauseY + pauseSize + pausePad + textStyle.fontSize * 1.2;
    const sliderHeight = 8 / renderScale;
    drawRect(ctx, { x: sliderX, y: sliderY }, { w: sliderWidth, h: sliderHeight }, "#fff", "#777", 1 / renderScale, sliderHeight / 2);

    // Slider Dividers
    const steps = 10;
    const circleRadius = sliderHeight / 2;
    const sliderIndicatorAxisWidth = sliderWidth - 2 * circleRadius;
    const stepSize = sliderIndicatorAxisWidth / steps;
    for (let i = 0; i <= steps; i++) {
        const dividerPosX = sliderX + circleRadius + stepSize * i;
        drawLine(ctx, { x: dividerPosX, y: sliderY + sliderHeight * 0.2 }, { x: dividerPosX, y: sliderY + sliderHeight - sliderHeight * 0.2 }, "#333", 1 / renderScale)
    }

    // Slider Indicator (Logarithmic)
    const gsLogMin = Math.log2(1/32);
    const gsLogMax = Math.log2(32);
    const gsLog = Math.log2(gt.gameSpeed);
    const t = (gsLog - gsLogMin) / (gsLogMax - gsLogMin); // 0..1
    const circlePosX = sliderX + circleRadius + t * sliderIndicatorAxisWidth;
    drawCircle(ctx, { x: circlePosX, y: sliderY + circleRadius }, circleRadius, "#ff0", "#000", 2 / renderScale);

    // Text for current speed
    const sliderValuePosX = timePanelPosX + timePanelWidth / 2 - ctx.measureText("0.00x").width / 2 / renderScale;
    const sliderValuePosY = sliderY + sliderHeight + pausePad;
    drawText(ctx, `${gt.gameSpeed.toFixed(2)}x`, { x: sliderValuePosX, y: sliderValuePosY }, { ...textStyle, align: "left" });
}