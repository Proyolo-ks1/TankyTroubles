import { getGlobal } from '../global-state.js';
import { randomColorHSLSeeded } from './math-utils.js';






//      |==============================|
//      |      Graphics Utilities      |
//      |==============================|



// MARK: drawText
// Function to draw text with optional outline, applying canvas scaling
export function drawText(ctx, text, pos, textStyle = {}) {
    const renderScale = getGlobal().renderScale;

    // Destructure style object with default values
    const {
        align = "left",
        baseline = "top",
        fontSize = 16 / renderScale,
        font = "Consolas",
        fontWeight = "normal",
        textColor = "#fff",
        outlineColor = null,
        outlineWidth = 0.02,

        // Debugging text
        debugBox = true
    } = textStyle;

    // Scale the position and font size according to canvas scale
    const scaledX = pos.x * renderScale;
    const scaledY = pos.y * renderScale;
    const scaledFontSize = fontSize * renderScale;

    // Set font and alignment
    ctx.font = `${fontWeight} ${scaledFontSize.toFixed(0)}px ${font}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    // Draw outline if provided
    if (outlineColor) {
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth * renderScale;
        ctx.strokeText(text, scaledX, scaledY);
    }

    // Debugging - Textbox
    if (getGlobal().debugMode && debugBox) {
        const metrics = ctx.measureText(text);

        const textWidth = metrics.width;
        const textHeight = scaledFontSize;

        let boxX = scaledX;
        let boxY = scaledY;

        // Horizontal alignment
        if (align === "center") boxX -= textWidth / 2;
        else if (align === "right") boxX -= textWidth;

        // Vertical baseline
        if (baseline === "middle") boxY -= textHeight / 2;
        else if (baseline === "bottom") boxY -= textHeight;

        ctx.strokeStyle = '#f0f' // or random: randomColorHSLSeeded(text.length, 100, 220);
        // seed,
        // saturation
        // lightness
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX, boxY, textWidth, textHeight);
    }

    // Draw the text
    ctx.fillText(text, scaledX, scaledY);
}

// MARK: drawImg
// Function to draw an image
export function drawImg(ctx, pos = { x: 0, y: 0 }, size = { w: 0, h: 0 }, img, opacity = 1) {
    const renderScale = getGlobal().renderScale;

    const scaledX = pos.x * renderScale;
    const scaledY = pos.y * renderScale;
    const scaledW = size.w * renderScale;
    const scaledH = size.h * renderScale;

    ctx.globalAlpha = opacity;

    ctx.drawImage(img, scaledX, scaledY, scaledW, scaledH);

    ctx.globalAlpha = 1;
}

// MARK: drawImgRotated
// Function to draw an rotated image
export function drawImgRotated(ctx, pos, angle, size, img, opacity = 1) {
    const renderScale = getGlobal().renderScale;

    const w = size.w * renderScale;
    const h = size.h * renderScale;

    ctx.save();
    ctx.translate(pos.x * renderScale, pos.y * renderScale);
    ctx.rotate(-angle);

    ctx.globalAlpha = opacity;

    // centered draw
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.globalAlpha = 1;
    ctx.restore();
}

// MARK: drawRect
// Function to draw a rectangle with optional rounded corners, applying canvas scaling - 0,0 topleft
export function drawRect(ctx, pos = {x: null, y: null}, size = {w: null, h: null}, fillColor = null, strokeColor = null, strokeWidth = null, borderRadius = 0) {
    const renderScale = getGlobal().renderScale

    // Scale values
    const scaledX = pos.x * renderScale;
    const scaledY = pos.y * renderScale;
    const scaledWidth = size.w * renderScale;
    const scaledHeight = size.h * renderScale;
    const scaledBorderRadius = borderRadius * renderScale;

    // If borderRadius is 0, use a simple fillRect and strokeRect for efficiency
    if (scaledBorderRadius === 0) {
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
        }

        if (strokeColor && strokeWidth > 0) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth * renderScale;
            ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
        }
    } else {
        // Use arc to draw rounded corners when borderRadius is provided
        ctx.beginPath();
        ctx.moveTo(scaledX + scaledBorderRadius, scaledY); // Top-left corner
        ctx.lineTo(scaledX + scaledWidth - scaledBorderRadius, scaledY); // Top-right corner
        ctx.arcTo(scaledX + scaledWidth, scaledY, scaledX + scaledWidth, scaledY + scaledHeight, scaledBorderRadius); // Top-right rounded corner
        ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight - scaledBorderRadius); // Bottom-right corner
        ctx.arcTo(scaledX + scaledWidth, scaledY + scaledHeight, scaledX + scaledWidth - scaledBorderRadius, scaledY + scaledHeight, scaledBorderRadius); // Bottom-right rounded corner
        ctx.lineTo(scaledX + scaledBorderRadius, scaledY + scaledHeight); // Bottom-left corner
        ctx.arcTo(scaledX, scaledY + scaledHeight, scaledX, scaledY + scaledHeight - scaledBorderRadius, scaledBorderRadius); // Bottom-left rounded corner
        ctx.lineTo(scaledX, scaledY + scaledBorderRadius); // Top-left corner
        ctx.arcTo(scaledX, scaledY, scaledX + scaledBorderRadius, scaledY, scaledBorderRadius); // Top-left rounded corner
        ctx.closePath();

        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        if (strokeColor && strokeWidth) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth * renderScale;
            ctx.stroke();
        }
    }
}

// MARK: drawRectRotated
// Draw a rotated rectangle with optional rounded corners, center-based coordinates
export function drawRectRotated(ctx, posCenter = {x: 0, y: 0}, angle = 0, size = {w: 0, h: 0}, fillColor = null, strokeColor = null, strokeWidth = 0, borderRadius = 0) {
    const renderScale = getGlobal().renderScale;
    const scaledWidth = size.w * renderScale;
    const scaledHeight = size.h * renderScale;
    const scaledBorderRadius = borderRadius * renderScale;

    ctx.save();
    ctx.translate(posCenter.x * renderScale, posCenter.y * renderScale);
    ctx.rotate(-angle);

    if (scaledBorderRadius === 0) {
        // Simple rectangle
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(-scaledWidth/2, -scaledHeight/2, scaledWidth, scaledHeight);
        }
        if (strokeColor && strokeWidth > 0) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth * renderScale;
            ctx.strokeRect(-scaledWidth/2, -scaledHeight/2, scaledWidth, scaledHeight);
        }
    } else {
        // Rounded rectangle
        const x = -scaledWidth / 2;
        const y = -scaledHeight / 2;
        const w = scaledWidth;
        const h = scaledHeight;
        const r = scaledBorderRadius;

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();

        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        if (strokeColor && strokeWidth > 0) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth * renderScale;
            ctx.stroke();
        }
    }

    ctx.restore();
}


// MARK: drawTextBox
// Draws a rectangle (background / border) with text on top
export function drawTextBox(ctx, text, pos, size, options = {}) {
    const {
        // Box
        backgroundColor = null,
        borderColor = null,
        borderWidth = 0.02,
        borderRadius = 0,
        padding = { x: 0.3, y: 0.2 },

        // Text
        textStyle = {},
    } = options;

    // Draw background / border if requested
    if (backgroundColor || borderColor) {
        drawRect(
            ctx,
            pos,
            size,
            backgroundColor ?? "transparent",
            borderColor,
            borderWidth,
            borderRadius
        );
    }

    // Text position inside the box (top-left by default)
    const textPos = {
        x: pos.x + padding.x,
        y: pos.y + padding.y,
    };

    drawText(ctx, text, textPos, {
        baseline: "top",
        align: "left",
        ...textStyle,
    });

    if (getGlobal().debugMode) {
        const renderScale = getGlobal().renderScale
        drawRect(ctx, pos, size, null, "#8000ff", 1 / renderScale, 0);
    }
}

// MARK: drawCircle
// Function to draw a circle with optional outline, applying canvas scaling
export function drawCircle(ctx, posCenter, radius, fillColor = null, strokeColor = null, strokeWidth = 0.02) {
    const renderScale = getGlobal().renderScale;

    const scaledX = posCenter.x * renderScale;
    const scaledY = posCenter.y * renderScale;
    const scaledRadius = radius * renderScale;

    ctx.beginPath();
    ctx.arc(scaledX, scaledY, scaledRadius, 0, Math.PI * 2);

    // Fill only if requested
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    // Stroke only if requested
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * renderScale;
        ctx.stroke();
    }
}

// MARK: drawRegPolygon
// Function to draw a regular polygon with one flat side facing the bottom
export function drawRegPolygon(ctx, posCenter, radius, n, direction = 0, fillColor, strokeColor = null, strokeWidth = 0.02) {
    const renderScale = getGlobal().renderScale
    const angleStep = (Math.PI * 2) / n;

    // Scale the center position and radius early
    const scaledX = posCenter.x * renderScale;
    const scaledY = posCenter.y * renderScale;
    const scaledRadius = radius * renderScale;

    // Adjust the rotation offset based on the desired direction
    const baseRotation = direction; // Add direction to the base rotation
    const startRotation = baseRotation + Math.PI + angleStep / 2

    ctx.beginPath();

    // Start at the rotated position
    for (let i = 0; i < n; i++) {
        // Calculate the angle for each vertex, considering the rotation offset and direction
        const angle = startRotation + angleStep * i;

        // Calculate the x and y position using polar coordinates, already scaled
        const vx = scaledX + scaledRadius * Math.cos(angle);
        const vy = scaledY + scaledRadius * Math.sin(-angle);

        // Move to the first vertex or draw a line to the next vertex
        if (i === 0) {
            ctx.moveTo(vx, vy);
        } else {
            ctx.lineTo(vx, vy);
        }
    }

    ctx.closePath();

    ctx.fillStyle = fillColor;
    ctx.fill();

    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * renderScale; // Apply scaling to stroke width
        ctx.stroke();
    }
}

// MARK: drawLine
// Function to draw a line between two points
export function drawLine(ctx, startPos, endPos, strokeColor = "#000000", strokeWidth = 0.02) {
    const renderScale = getGlobal().renderScale
    
    // Apply canvas scaling
    const scaledStartX = startPos.x * renderScale;
    const scaledStartY = startPos.y * renderScale;
    const scaledEndX = endPos.x * renderScale;
    const scaledEndY = endPos.y * renderScale;

    ctx.beginPath();
    ctx.moveTo(scaledStartX, scaledStartY);
    ctx.lineTo(scaledEndX, scaledEndY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth * renderScale; // Apply scaling to stroke width
    ctx.stroke();
}

// MARK: drawVertexLine
// Draw a line following a set of vertices
export function drawVertexLine(ctx, pos, angle, vertices, strokeColor = "#000", strokeWidth = 0.02) {
    const renderScale = getGlobal().renderScale;
    
    if (vertices.length < 2) {
        console.warn("A (poly)line needs at least 2 vertices.");
        return;
    }

    ctx.beginPath();

    // Transform and move to the first vertex
    const firstVertex = transformVertex(vertices[0], pos, angle * (Math.PI / 180), renderScale);
    ctx.moveTo(firstVertex.x, firstVertex.y);

    // Draw lines to the remaining vertices
    for (let i = 1; i < vertices.length; i++) {
        const vertex = transformVertex(vertices[i], pos, angle * (Math.PI / 180), renderScale);
        ctx.lineTo(vertex.x, vertex.y);
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth * renderScale;
    ctx.stroke();
}

// MARK: drawVertexPolygon
// Function to draw a polygon based on a list of positions relative to a position and angle
export function drawVertexPolygon(ctx, pos, angle, vertices, fillColor, strokeColor = null, strokeWidth = 0.02) {
    const renderScale = getGlobal().renderScale
    
    if (vertices.length < 3) {
        console.warn("A polygon must have at least 3 vertices.");
        return;
    }

    ctx.beginPath();

    // Apply translation and rotation to each vertex
    const angleInRadians = angle * (Math.PI / 180); // Convert to radians

    // Start at the first transformed vertex
    const firstVertex = transformVertex(vertices[0], pos, angleInRadians, renderScale);
    ctx.moveTo(firstVertex.x, firstVertex.y);

    // Transform and draw lines to the remaining vertices
    for (let i = 1; i < vertices.length; i++) {
        const vertex = transformVertex(vertices[i], pos, angleInRadians, renderScale);
        ctx.lineTo(vertex.x, vertex.y);
    }

    ctx.closePath();

    // Fill color
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Stroke color
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * renderScale;
        ctx.stroke();
    }
}

// MARK: drawVectorArrow
// Function to draw a vector arrow from a start position in the direction of a vector
export function drawVectorArrow(ctx, startPos, vector, strokeColor = "#000000", strokeWidth = 0.02) {
    const renderScale = getGlobal().renderScale

    
    const endPos = {
        x: startPos.x + vector.x, 
        y: startPos.y + vector.y,
    };
    const arrowAngle = Math.PI / 6
    const arrowHeadLength = Math.sqrt(vector.x ** 2 + vector.y ** 2) / 8;

    ctx.beginPath();
    ctx.moveTo(startPos.x * renderScale, startPos.y * renderScale);
    ctx.lineTo(endPos.x * renderScale, endPos.y * renderScale);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth * renderScale;
    ctx.stroke();

    // Calculate angle of the line
    const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);

    // Calculate arrowhead positions
    const arrowHead1 = {
        x: endPos.x - arrowHeadLength * Math.cos(angle - arrowAngle),
        y: endPos.y - arrowHeadLength * Math.sin(angle - arrowAngle)
    };
    const arrowHead2 = {
        x: endPos.x - arrowHeadLength * Math.cos(angle + arrowAngle),
        y: endPos.y - arrowHeadLength * Math.sin(angle + arrowAngle)
    };

    ctx.beginPath();
    ctx.moveTo(endPos.x * renderScale, endPos.y * renderScale);
    ctx.lineTo(arrowHead1.x * renderScale, arrowHead1.y * renderScale);
    ctx.moveTo(endPos.x * renderScale, endPos.y * renderScale);
    ctx.lineTo(arrowHead2.x * renderScale, arrowHead2.y * renderScale);
    ctx.stroke();
}



// MARK: HELPERFUNCTIONS



// MARK: transformVertex
// Helper function to transform each vertex with a position and angle
function transformVertex(vertex, pos, angle, renderScale) {
    // Rotate the vertex by the given angle
    const rotatedX = vertex.x * Math.cos(angle) - vertex.y * Math.sin(angle);
    const rotatedY = vertex.x * Math.sin(angle) + vertex.y * Math.cos(angle);

    // Apply the position offset and scale
    const finalX = (rotatedX + pos.x) * renderScale;
    const finalY = (rotatedY + pos.y) * renderScale;

    return { x: finalX, y: finalY };
}
