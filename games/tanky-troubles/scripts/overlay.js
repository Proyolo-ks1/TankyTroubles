import { drawRect, drawVertexPolygon, drawCircle, drawText, drawLine, drawRegPolygon, drawVectorArrow} from './graphics-utils.js';
import { GAME_STATE_KEYS, OVERLAY_STATE_KEYS, getGlobal } from './global-state.js';






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



let lastRenderStatisticsTime = performance.now();
let overlayFps = 0;
let overlayDeltaTime = 0;
let statisticUpdatesPerSecond = 10



export function renderGameStatistics(ctx, currentTime, deltaTime) {
    
    const renderScale = getGlobal().renderScale
    const dbg = getGlobal().statsRingBuffers;

    // Calculate FPS with smoothing
    const fps = (overlayFps * 0.8) + (1 / deltaTime * 0.2);

    // Update overlay values only at defined intervals
    if (currentTime - lastRenderStatisticsTime >= 1000 / statisticUpdatesPerSecond) {
        overlayFps = fps;
        overlayDeltaTime = deltaTime;
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
        const calcHeight = Math.min(calcMs / maxMs, 1) * graphHeight;
        const renderHeight = Math.min(renderMs / maxMs, 1) * graphHeight;

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
    const padding = 10 / renderScale;
    const textSpacing = 2 / renderScale;
    const align = "left";
    const baseline = "top";
    const fontSize = 16 / renderScale;
    const font = "Consolas";
    const textColor = "#fff";
    const outlineColor = "#000";
    const outlineWidth = 2 / renderScale;
    const linesOfText = 5;
    const backgroundWidth = 150 / renderScale + 2 * padding;
    const backgroundHeight = linesOfText * fontSize + (linesOfText - 1) * textSpacing + 2 * padding;
    const size = { width: backgroundWidth, height: backgroundHeight };
    const borderRadius = padding;

    drawRect(ctx, pos, size, "rgba(0, 0, 0, 0.5)", null, null, borderRadius);

    // Overlay text
    pos = { x: pos.x + padding, y: pos.y + padding };

    drawText(ctx, `FPS:     ${Math.round(overlayFps)}`, { x: pos.x, y: pos.y }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);
    drawText(ctx, `ΔTime:   ${Math.round(overlayDeltaTime * 1000)}ms`, { x: pos.x, y: pos.y + 1 * fontSize + 1 * textSpacing }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);
    drawText(ctx, `Scale:   ${renderScale.toFixed(2)}`, { x: pos.x, y: pos.y + 2 * fontSize + 2 * textSpacing }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);
    drawText(ctx, `Tanks:   ${getGlobal().entities.tanks.length}`, { x: pos.x, y: pos.y + 3 * fontSize + 3 * textSpacing }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);
    drawText(ctx, `Bullets: ${getGlobal().entities.bullets.length}`, { x: pos.x, y: pos.y + 4 * fontSize + 4 * textSpacing }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);

    // Toggle Button for debugMode
    const buttonWidth = 150 / renderScale;
    const buttonHeight = 30 / renderScale;
    const buttonPos = { x: pos.x, y: pos.y + 5 * fontSize + 5 * textSpacing + padding };  // Position button below the overlay

    // Draw the button
    drawRect(ctx, buttonPos, { width: buttonWidth, height: buttonHeight }, "rgba(0, 0, 0, 0.7)", "white", 2 / renderScale, 5 / renderScale);

    // Button text (showing current state of debugMode)
    const debugText = getGlobal().debugMode ? "Debug: ON" : "Debug: OFF";
    drawText(ctx, debugText, { x: buttonPos.x + buttonWidth / 2, y: buttonPos.y + buttonHeight / 2 }, "center", "middle", fontSize, font, "white", "black", 2 / renderScale);
}