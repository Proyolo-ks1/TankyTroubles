import { drawRect, drawVertexPolygon, drawCircle, drawText, drawLine, drawRegPolygon, drawVectorArrow} from './utils/graphics-utils.js';
import { GAME_STATE_KEYS, OVERLAY_STATE_KEYS, getGlobal } from './global-state.js';
import { drawGraphBarsTYPEringBuffer } from './utils/graphics-structs.js';
import { Vec2 } from "./utils/math-utils.js";






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
    const dbg = getGlobal().statsRingBuffers;

    let textStyle = {
        align: "left",
        baseline: "top",
        fontSize: 16 ,
        font: "Consolas",
        textColor: "#fff",
        outlineColor: "#000",
        outlineWidth: 2 , //px
    };

    renderOverlayLeftPanel(ctx, currentTime, realDeltaTime, dbg, textStyle);
    renderOverlayTime(ctx, textStyle);
    renderOverlayRightPanel(ctx, currentTime, realDeltaTime, dbg, textStyle);
}



// LEFT PANEL
function renderOverlayLeftPanel(ctx, currentTime, realDeltaTime, dbg, textStyle) {
    const DebugPanelSize = { w: 250, h: 250 }; // px
    const DebugPanelPos = { x: 0, y: 0 };
    const DebugLeftPanel = {
        pos: DebugPanelPos,
        size: DebugPanelSize,
        padding: 5, // px
        cursor: DebugPanelPos,
    };

    renderOverlayGraphs(ctx, DebugLeftPanel, dbg, textStyle);
}



// GRAPHS
function renderOverlayGraphs(ctx, ParentPanel, dbg, textStyle) {
    // Panel padding
    ParentPanel.cursor.x += ParentPanel.padding;
    ParentPanel.cursor.y += ParentPanel.padding;
    const availableWidth = ParentPanel.size.w - 2 * ParentPanel.padding;

    const graphHeight = 100; // px
    const amountOfGraphs = 3;

    // Graphs Container
    let graphsContainer = {
        pos: { ...ParentPanel.cursor },
        size: { w: availableWidth, h: 0 },
        cursor: { ...ParentPanel.cursor },
        gap: 5,
    };
    graphsContainer.size.h = amountOfGraphs * graphHeight + (amountOfGraphs - 1) * graphsContainer.gap;
    drawRect(ctx, graphsContainer.pos, graphsContainer.size, "rgba(0,0,0,0.5)", null, 1 , 5 );

    let defaultGraph = { pos: { x: 0, y: 0 }, size: { w: availableWidth, h: graphHeight } };

    // Draw Bar Graphs
    drawGraphBarsTYPEringBuffer(ctx, graphsContainer.cursor, defaultGraph.size, { min: 0, max: 30 }, dbg.calculationDurations, dbg.index, dbg.count, "#0f0", "calcTime", "ms");
    graphsContainer.cursor.y += defaultGraph.size.h + graphsContainer.gap;
    drawGraphBarsTYPEringBuffer(ctx, graphsContainer.cursor, defaultGraph.size, { min: 0, max: 30 }, dbg.renderingDurations, dbg.index, dbg.count, "#0ff", "renderTime", "ms");
    graphsContainer.cursor.y += defaultGraph.size.h + graphsContainer.gap;
    drawGraphBarsTYPEringBuffer(ctx, graphsContainer.cursor, defaultGraph.size, { min: 0, max: 150 }, dbg.fps, dbg.index, dbg.count, "#fa0", "frames", "fps");
    graphsContainer.cursor.y += defaultGraph.size.h;
    ParentPanel.size.h = graphsContainer.cursor.y;

    ParentPanel.cursor.y += ParentPanel.size.h + ParentPanel.padding;

    return
}



// GAME VARIABLES
function renderOverlayVariables(ctx, ParentPanel, currentTime, realDeltaTime, textStyle) {
    // Background (unit: pixel)
    let pos = { x: ParentPanel.cursor.x, y: ParentPanel.cursor.y };
    const padding = 5 ;
    const textSpacing = 2 ;
    const fontSize = 16 ;  // unsure, something broke this
    const linesOfText = 7;
    const backgroundWidth = ParentPanel.size.w + 2 * padding;
    const backgroundHeight = linesOfText * fontSize + (linesOfText - 1) * textSpacing + 2 * padding;
    const size = { w: backgroundWidth, h: backgroundHeight };
    const borderRadius = padding;

    // Values
    // Calculate FPS with smoothing
    const smoothing = 0.3; // more is smoother
    const fps = (overlayFps * smoothing) + (1 / realDeltaTime * (1 - smoothing));

    // Update overlay values only at defined intervals
    if (currentTime - lastRenderStatisticsTime >= 1000 / statisticUpdatesPerSecond) {
        overlayFps = fps;
        overlayDeltaTime = realDeltaTime;
        lastRenderStatisticsTime = currentTime;
    }

    // Overlay text
    drawRect(ctx, pos, size, "rgba(0, 0, 0, 0.5)", null, null, borderRadius);
    pos = { x: pos.x + padding, y: pos.y + padding };
    const drawNextLine = createOverlayTextDrawer(ctx, pos, textStyle, textSpacing);

    drawNextLine(`== Variables ==`);
    drawNextLine(`FPS:       ${Math.round(overlayFps)}`);
    drawNextLine(`ΔTime:     ${Math.round(overlayDeltaTime * 1000)} ms`);
    drawNextLine(`TileScale: ${getGlobal().renderScale.toFixed(2)} px/tile`);
    drawNextLine(`Tanks:     ${getGlobal().entities.tanks.length}`);
    drawNextLine(`Bullets:   ${getGlobal().entities.bullets.length}`);
    drawNextLine(`Speed:     ${getGlobal().gameTime.gameSpeed}x`);

    // Toggle Button for debugMode
    const buttonWidth = 150 ;
    const buttonHeight = 30 ;
    const buttonPos = { x: pos.x, y: pos.y + linesOfText * fontSize + linesOfText * textSpacing + padding };  // Position button below the overlay

    // Draw the button
    drawRect(ctx, buttonPos, { w: buttonWidth, h: buttonHeight }, "rgba(0, 0, 0, 0.7)", "white", 2 , 5 );

    // Button text (showing current state of debugMode)
    const debugText = getGlobal().debugOverlays.ShowDebugOverlays ? "Debug: ON" : "Debug: OFF";
    drawText(ctx, debugText, { x: buttonPos.x + buttonWidth / 2, y: buttonPos.y + buttonHeight / 2 }, { ...textStyle, align: "center", baseline: "middle" });
}



// GAME TIME
function renderOverlayTime(ctx, textStyle) {
    const timePanelWidth = 150 ;
    const timePanelHeight = 75 ;
    const timePanelPosX = getGlobal().canvasScale / 2  - timePanelWidth / 2;
    const timePanelPosY = 5 ;

    // Background
    drawRect(ctx, { x: timePanelPosX, y: timePanelPosY }, { w: timePanelWidth, h: timePanelHeight }, "rgba(0, 0, 0, 0.7)", "rgba(61, 61, 61, 0.7)", 2 , 5 );



    // -- Play / Pause --
    const pausePad = 5 ; // px
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
        drawRegPolygon(ctx, new Vec2(pauseX + pauseSize / 2 - triangleOffset, pauseY + pauseSize / 2), pauseSize / 2, 3, Math.PI * 2, "#33ff00");
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
    const sliderHeight = 8 ;
    drawRect(ctx, { x: sliderX, y: sliderY }, { w: sliderWidth, h: sliderHeight }, "#fff", "#777", 1 , sliderHeight / 2);

    // Slider Dividers
    const steps = 10;
    const circleRadius = sliderHeight / 2;
    const sliderIndicatorAxisWidth = sliderWidth - 2 * circleRadius;
    const stepSize = sliderIndicatorAxisWidth / steps;
    for (let i = 0; i <= steps; i++) {
        const dividerPosX = sliderX + circleRadius + stepSize * i;
        drawLine(ctx, { x: dividerPosX, y: sliderY + sliderHeight * 0.2 }, { x: dividerPosX, y: sliderY + sliderHeight - sliderHeight * 0.2 }, "#333", 1 )
    }

    // Slider Indicator (Logarithmic)
    const gsLogMin = Math.log2(1/32);
    const gsLogMax = Math.log2(32);
    const gsLog = Math.log2(gt.gameSpeed);
    const t = (gsLog - gsLogMin) / (gsLogMax - gsLogMin); // 0..1
    const circlePosX = sliderX + circleRadius + t * sliderIndicatorAxisWidth;
    drawCircle(ctx, { x: circlePosX, y: sliderY + circleRadius }, circleRadius, "#ff0", "#000", 2 );

    // Text for current speed
    const sliderValuePosX = timePanelPosX + timePanelWidth / 2 - ctx.measureText("0.00x").width / 2 ;
    const sliderValuePosY = sliderY + sliderHeight + pausePad;
    drawText(ctx, `${gt.gameSpeed.toFixed(2)}x`, { x: sliderValuePosX, y: sliderValuePosY }, { ...textStyle, align: "left" });
}



// RIGHT PANEL
function renderOverlayRightPanel(ctx, currentTime, realDeltaTime, dbg, textStyle) {
    const DebugPanelSize = { w: 250, h: 250 }; // px
    const DebugPanelPos = { x: getGlobal().canvasScale - 250, y: 0 };
    const DebugRightPanel = {
        pos: DebugPanelPos,
        size: DebugPanelSize,
        padding: 5, // px
        cursor: DebugPanelPos,
    };

    renderCalcandRenderAverage(ctx, DebugRightPanel, currentTime, realDeltaTime, textStyle);
    renderOverlayVariables(ctx, DebugRightPanel, currentTime, realDeltaTime, textStyle);
}

// GRAPHS
function renderCalcandRenderAverage(ctx, ParentPanel, currentTime, realDeltaTime, textStyle) {
    
    // Background (unit: pixel)
    const padding = 5 ;
    let pos = { x: ParentPanel.cursor.x, y: ParentPanel.cursor.y };
    const textSpacing = 2 ;
    const fontSize = 16 ;  // unsure, something broke this
    const linesOfText = 3;
    const backgroundWidth = ParentPanel.size.w + 2 * padding;
    const backgroundHeight = linesOfText * fontSize + (linesOfText - 1) * textSpacing + 2 * padding;
    const size = { w: backgroundWidth, h: backgroundHeight };
    const borderRadius = padding;

    // Overlay text
    drawRect(ctx, pos, size, "rgba(0, 0, 0, 0.5)", null, null, borderRadius);
    pos = { x: pos.x + padding, y: pos.y + padding };
    const drawNextLine = createOverlayTextDrawer(ctx, pos, textStyle, textSpacing);

    const debugSRBs = getGlobal().statsRingBuffers;
    const averageCalc = ringAverageFromIndex(debugSRBs.calculationDurations, debugSRBs.index, debugSRBs.count);
    const averageRender = ringAverageFromIndex(debugSRBs.renderingDurations, debugSRBs.index, debugSRBs.count);

    drawNextLine(`== Averages ==`);
    drawNextLine(`ΔCalc:   ${averageCalc.toFixed(2)} ms`);
    drawNextLine(`ΔRender: ${averageRender.toFixed(2)} ms`);

    ParentPanel.pos.y += backgroundHeight + padding;
}

function ringAverageFromIndex(buffer, index, count) {
    let sum = 0;

    for (let i = 0; i < count; i++) {
        const idx = (index - i + buffer.length) % buffer.length;
        sum += buffer[idx];
    }

    return count > 0 ? sum / count : 0;
}