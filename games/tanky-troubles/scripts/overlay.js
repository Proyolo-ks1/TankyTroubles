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
    const canvasScale = getGlobal().canvasScale;

    // Calculate FPS with smoothing
    const fps = (overlayFps * 0.8) + (1 / deltaTime * 0.2);

    // Update overlay values only at defined intervals
    if (currentTime - lastRenderStatisticsTime >= 1000 / statisticUpdatesPerSecond) {
        overlayFps = fps;
        overlayDeltaTime = deltaTime;
        lastRenderStatisticsTime = currentTime;
    }

    // Background
    let pos = { x: 5 / canvasScale, y: 5 / canvasScale };
    const padding = 10 / canvasScale;
    const textSpacing = 2 / canvasScale;
    const align = "left";
    const baseline = "top";
    const fontSize = 16 / canvasScale;
    const font = "Consolas";
    const textColor = "#fff";
    const outlineColor = "#000";
    const outlineWidth = 2;
    const linesOfText = 5;
    const backgroundWidth = 150 / canvasScale + 2 * padding;
    const backgroundHeight = linesOfText * fontSize + (linesOfText - 1) * textSpacing + 2 * padding;
    const size = { width: backgroundWidth, height: backgroundHeight };
    const borderRadius = padding;

    drawRect(ctx, pos, size, "rgba(0, 0, 0, 0.5)", null, null, borderRadius);

    // Overlay text
    pos = { x: pos.x + padding, y: pos.y + padding };

    drawText(ctx, `FPS:     ${Math.round(overlayFps)}`, { x: pos.x, y: pos.y }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);
    drawText(ctx, `ΔTime:   ${Math.round(overlayDeltaTime * 1000)}ms`, { x: pos.x, y: pos.y + 1 * fontSize + 1 * textSpacing }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);
    drawText(ctx, `Scale:   ${canvasScale.toFixed(2)}`, { x: pos.x, y: pos.y + 2 * fontSize + 2 * textSpacing }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);
    drawText(ctx, `Tanks:   ${getGlobal().entities.tanks.length}`, { x: pos.x, y: pos.y + 3 * fontSize + 3 * textSpacing }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);
    drawText(ctx, `Bullets: ${getGlobal().entities.bullets.length}`, { x: pos.x, y: pos.y + 4 * fontSize + 4 * textSpacing }, align, baseline, fontSize, font, textColor, outlineColor, outlineWidth);

    // Toggle Button for debugMode
    const buttonWidth = 150 / canvasScale;
    const buttonHeight = 30 / canvasScale;
    const buttonPos = { x: pos.x, y: pos.y + 5 * fontSize + 5 * textSpacing + padding };  // Position button below the overlay

    // Draw the button
    drawRect(ctx, buttonPos, { width: buttonWidth, height: buttonHeight }, "rgba(0, 0, 0, 0.7)", "white", 2, 5);

    // Button text (showing current state of debugMode)
    const debugText = getGlobal().debugMode ? "Debug: ON" : "Debug: OFF";
    drawText(ctx, debugText, { x: buttonPos.x + buttonWidth / 2, y: buttonPos.y + buttonHeight / 2 }, "center", "middle", fontSize, font, "white", "black", 2);
}