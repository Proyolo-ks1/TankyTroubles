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

    // Calculate FPS with smoothing
    const fps = (overlayFps * 0.8) + (1 / realDeltaTime * 0.2);

    // Update overlay values only at defined intervals
    if (currentTime - lastRenderStatisticsTime >= 1000 / statisticUpdatesPerSecond) {
        overlayFps = fps;
        overlayDeltaTime = realDeltaTime;
        lastRenderStatisticsTime = currentTime;
    }

    // Graph area
    const graphWidth = 100 / renderScale;       // width in pixels
    const graphHeight = 40 / renderScale;       // height in pixels
    const graphPadding = 5 / renderScale;
    let graphX = 5 / renderScale;
    let graphY = 5 / renderScale;

    // Draw background for graphs
    drawRect(ctx, { x: graphX, y: graphY }, { width: graphWidth + 2 * graphPadding, height: 2 * graphHeight + 3 * graphPadding }, "rgba(0,0,0,0.5)", null, 0, 0.02);

    // Draw bars
    for (let i = 0; i < dbg.count; i++) {
        const idx = (dbg.index + i) % dbg.calculateTime.length;

        const calcMs = dbg.calculateTime[idx];
        const renderMs = dbg.renderTime[idx];

        // Map ms → pixel height
        const maxMs = 50; // 50 ms = top of graph
        const calcHeight = Math.min(calcMs / maxMs, 1) * graphHeight + 2 / renderScale;
        const renderHeight = Math.min(renderMs / maxMs, 1) * graphHeight + 2 / renderScale;

        const barWidth = graphWidth / dbg.calculateTime.length;

        // Draw calculateTime bar (top graph)
        drawRect(ctx, 
            { x: graphX + i * barWidth, y: graphY + graphHeight - calcHeight }, 
            { width: barWidth, height: calcHeight }, 
            "#0f0"
        );

        // Draw renderTime bar (bottom graph)
        drawRect(ctx, 
            { x: graphX + i * barWidth, y: graphY + 2 * graphPadding + graphHeight + graphHeight - renderHeight }, 
            { width: barWidth, height: renderHeight }, 
            "#0ff"
        );
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
    const padding = 10 / renderScale;
    const textSpacing = 2 / renderScale;
    const fontSize = 16 / renderScale;
    const linesOfText = 6;
    const backgroundWidth = 200 / renderScale + 2 * padding;
    const backgroundHeight = linesOfText * fontSize + (linesOfText - 1) * textSpacing + 2 * padding;
    const size = { width: backgroundWidth, height: backgroundHeight };
    const borderRadius = padding;


    // Overlay text
    drawRect(ctx, pos, size, "rgba(0, 0, 0, 0.5)", null, null, borderRadius);
    pos = { x: pos.x + padding, y: pos.y + padding };
    const drawNextLine = createOverlayTextDrawer(ctx, pos, textStyle, textSpacing);

    drawNextLine(`FPS:     ${Math.round(overlayFps)}`);
    drawNextLine(`ΔTime:   ${Math.round(overlayDeltaTime * 1000)} ms`);
    drawNextLine(`Scale:   ${renderScale.toFixed(2)} px/tile`);
    drawNextLine(`Tanks:   ${getGlobal().entities.tanks.length}`);
    drawNextLine(`Bullets: ${getGlobal().entities.bullets.length}`);
    drawNextLine(`Speed:   ${getGlobal().gameTime.gameSpeed}x`);

    // Toggle Button for debugMode
    const buttonWidth = 150 / renderScale;
    const buttonHeight = 30 / renderScale;
    const buttonPos = { x: pos.x, y: pos.y + 6 * fontSize + 6 * textSpacing + padding };  // Position button below the overlay

    // Draw the button
    drawRect(ctx, buttonPos, { width: buttonWidth, height: buttonHeight }, "rgba(0, 0, 0, 0.7)", "white", 2 / renderScale, 5 / renderScale);

    // Button text (showing current state of debugMode)
    const debugText = getGlobal().debugMode ? "Debug: ON" : "Debug: OFF";
    drawText(ctx, debugText, { x: buttonPos.x + buttonWidth / 2, y: buttonPos.y + buttonHeight / 2 }, { ...textStyle, align: "center", baseline: "middle" });



    // GameTime Indicators
    const timePanelWidth = 150 / renderScale;
    const timePanelHeight = 60 / renderScale;
    const timePanelPosX = getGlobal().canvasScale / 2 / renderScale - timePanelWidth / 2;
    const timePanelPosY = 5 / renderScale;

    // Background
    drawRect(ctx, { x: timePanelPosX, y: timePanelPosY }, { width: timePanelWidth, height: timePanelHeight }, "rgba(0, 0, 0, 0.7)", "rgba(61, 61, 61, 0.7)", 2 / renderScale, 5 / renderScale);

    // Play / Pause
    const pauseX = timePanelPosX + padding;
    const pauseY = timePanelPosY + padding / 2;
    const gt = getGlobal().gameTime; 
    if (gt.paused) {
        // Paused
        const barWidth = 3 / renderScale;
        const barHeight = 16 / renderScale;
        drawRect(ctx, { x: pauseX - 4 / renderScale, y: pauseY }, { width: barWidth, height: barHeight }, "#ff0000");
        drawRect(ctx, { x: pauseX + 1 / renderScale, y: pauseY }, { width: barWidth, height: barHeight }, "#ff0000");
    } else {
        // Playing
        drawRegPolygon(ctx, { x: pauseX, y: pauseY + 8 / renderScale }, 8 / renderScale, 3, Math.PI * 2, "#33ff00");
    }
    drawText(ctx, `Paused: ${gt.paused}`, { x: pauseX + 15 / renderScale, y: pauseY }, textStyle);

    // Game Speed
    // Slider line
    const sliderX = timePanelPosX + padding;
    const sliderY = timePanelPosY + timePanelHeight - padding;
    const sliderWidth = timePanelWidth - 2 * padding;
    drawLine(ctx, { x: sliderX, y: sliderY }, { x: sliderX + sliderWidth, y: sliderY }, "#fff", 0.01);

    // Slider Markers
    const textOffsetY = 17;
    drawText(ctx, "1/32", { x: sliderX, y: sliderY - textOffsetY / renderScale }, { ...textStyle, align: "left" });
    drawText(ctx, "1", { x: sliderX + sliderWidth / 2, y: sliderY - textOffsetY / renderScale }, { ...textStyle, align: "center" });
    drawText(ctx, "16", { x: sliderX + sliderWidth, y: sliderY - textOffsetY / renderScale }, { ...textStyle, align: "right" });

    // Slider Indicator (Logarithmic)
    const gsLogMin = Math.log2(1/32);
    const gsLogMax = Math.log2(16);
    const gsLog = Math.log2(gt.gameSpeed);
    const t = (gsLog - gsLogMin) / (gsLogMax - gsLogMin); // 0..1
    const circleX = sliderX + t * sliderWidth;
    drawCircle(ctx, { x: circleX, y: sliderY }, 4 / renderScale, "#ff0", "#000", 0.01);

    // Text for current speed
    drawText(ctx, `${gt.gameSpeed.toFixed(2)}x`, { x: sliderX + sliderWidth + 20 / renderScale, y: sliderY }, { ...textStyle, align: "left" });

}