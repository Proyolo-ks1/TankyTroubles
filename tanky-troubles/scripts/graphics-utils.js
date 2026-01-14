import { getGlobalVariable, GLOBAL_VARIABLES } from './global-state.js';






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// MARK: drawText
// Function to draw text with optional outline, applying canvas scaling
export function drawText(ctx, text, pos, align = "left", baseline = "top", fontSize, font, color, outlineColor = null, outlineWidth = 1) {
    const canvasScale = getGlobalVariable(GLOBAL_VARIABLES.CANVAS_SCALE);

    // Scale the position and font size according to the canvas scale
    const scaledX = pos.x * canvasScale;
    const scaledY = pos.y * canvasScale;
    const scaledFontSize = fontSize * canvasScale;

    // Set the font size and alignment for the text
    ctx.font = `${scaledFontSize.toFixed(0)}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    // Draw the text outline if outlineColor is provided
    if (outlineColor) {
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth * canvasScale; // Scale stroke width according to canvas scale
        ctx.strokeText(text, scaledX, scaledY); // Draw the outline
    }

    // Draw the text on the canvas
    ctx.fillText(text, scaledX, scaledY);
}


export function drawImg(ctx, pos, size, img, strokeColor = null, strokeWidth = 1, borderRadius = 0) {
    const canvasScale = getGlobalVariable(GLOBAL_VARIABLES.CANVAS_SCALE);

    // Scale values
    const scaledX = pos.x * canvasScale;
    const scaledY = pos.y * canvasScale;
    const scaledWidth = size.width * canvasScale;
    const scaledHeight = size.height * canvasScale;
    const scaledBorderRadius = borderRadius * canvasScale;
}



// MARK: SHAPES



// MARK: drawRect
// Function to draw a rectangle with optional rounded corners, applying canvas scaling
export function drawRect(ctx, pos, size, fillColor, strokeColor = null, strokeWidth = 1, borderRadius = 0) {
    const canvasScale = getGlobalVariable(GLOBAL_VARIABLES.CANVAS_SCALE);

    // Scale values
    const scaledX = pos.x * canvasScale;
    const scaledY = pos.y * canvasScale;
    const scaledWidth = size.width * canvasScale;
    const scaledHeight = size.height * canvasScale;
    const scaledBorderRadius = borderRadius * canvasScale;

    // If borderRadius is 0, use a simple fillRect and strokeRect for efficiency
    if (scaledBorderRadius === 0) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);

        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth * canvasScale;
            ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
        }
    } else {
        // Use arc to draw rounded corners when borderRadius is provided
        ctx.fillStyle = fillColor;
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
        ctx.fill();

        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth * canvasScale;
            ctx.stroke();
        }
    }
}

// MARK: drawCircle
// Function to draw a circle with optional outline, applying canvas scaling
export function drawCircle(ctx, posCenter, radius, fillColor, strokeColor = null, strokeWidth = 1) {
    const canvasScale = getGlobalVariable(GLOBAL_VARIABLES.CANVAS_SCALE);

    const scaledX = posCenter.x * canvasScale;
    const scaledY = posCenter.y * canvasScale;
    const scaledRadius = radius * canvasScale;

    ctx.beginPath();
    ctx.arc(scaledX, scaledY, scaledRadius, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();

    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * canvasScale; // Scale stroke width too
        ctx.stroke();
    }
}

// MARK: drawRegPolygon
// Function to draw a regular polygon with one flat side facing the bottom
export function drawRegPolygon(ctx, posCenter, radius, n, direction = 0, fillColor, strokeColor = null, strokeWidth = 1) {
    const canvasScale = getGlobalVariable(GLOBAL_VARIABLES.CANVAS_SCALE);
    const angleStep = (Math.PI * 2) / n;

    // Scale the center position and radius early
    const scaledX = posCenter.x * canvasScale;
    const scaledY = posCenter.y * canvasScale;
    const scaledRadius = radius * canvasScale;

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
        const vy = scaledY + scaledRadius * Math.sin(angle);

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
        ctx.lineWidth = strokeWidth * canvasScale; // Apply scaling to stroke width
        ctx.stroke();
    }
}

// MARK: drawLine
// Function to draw a line between two points
export function drawLine(ctx, startPos, endPos, strokeColor = "#000000", strokeWidth = 1) {
    const canvasScale = getGlobalVariable(GLOBAL_VARIABLES.CANVAS_SCALE);
    
    // Apply canvas scaling
    const scaledStartX = startPos.x * canvasScale;
    const scaledStartY = startPos.y * canvasScale;
    const scaledEndX = endPos.x * canvasScale;
    const scaledEndY = endPos.y * canvasScale;

    ctx.beginPath();
    ctx.moveTo(scaledStartX, scaledStartY);
    ctx.lineTo(scaledEndX, scaledEndY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth * canvasScale; // Apply scaling to stroke width
    ctx.stroke();
}

// MARK: drawVectorArrow
// Function to draw a vector arrow from a start position in the direction of a vector
export function drawVectorArrow(ctx, startPos, vector, strokeColor = "#000000", strokeWidth = 1) {
    const canvasScale = getGlobalVariable(GLOBAL_VARIABLES.CANVAS_SCALE);

    
    const endPos = {
        x: startPos.x + vector.x / 4, 
        y: startPos.y + vector.y / 4
    };
    const arrowAngle = Math.PI / 6
    const arrowHeadLength = Math.sqrt(vector.x ** 2 + vector.y ** 2) / 8;

    ctx.beginPath();
    ctx.moveTo(startPos.x * canvasScale, startPos.y * canvasScale);
    ctx.lineTo(endPos.x * canvasScale, endPos.y * canvasScale);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth * canvasScale;
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
    ctx.moveTo(endPos.x * canvasScale, endPos.y * canvasScale);
    ctx.lineTo(arrowHead1.x * canvasScale, arrowHead1.y * canvasScale);
    ctx.moveTo(endPos.x * canvasScale, endPos.y * canvasScale);
    ctx.lineTo(arrowHead2.x * canvasScale, arrowHead2.y * canvasScale);
    ctx.stroke();
}

// MARK: drawVertexPolygon
// Function to draw a polygon based on a list of positions relative to a position and angle
export function drawVertexPolygon(ctx, pos, angle, vertices, fillColor, strokeColor = null, strokeWidth = 1) {
    if (vertices.length < 3) {
        console.warn("A polygon must have at least 3 vertices.");
        return;
    }

    const canvasScale = getGlobalVariable(GLOBAL_VARIABLES.CANVAS_SCALE);

    ctx.beginPath();

    // Apply translation and rotation to each vertex
    const angleInRadians = angle * (Math.PI / 180); // Convert to radians

    // Start at the first transformed vertex
    const firstVertex = transformVertex(vertices[0], pos, angleInRadians, canvasScale);
    ctx.moveTo(firstVertex.x, firstVertex.y);

    // Transform and draw lines to the remaining vertices
    for (let i = 1; i < vertices.length; i++) {
        const vertex = transformVertex(vertices[i], pos, angleInRadians, canvasScale);
        ctx.lineTo(vertex.x, vertex.y);
    }

    ctx.closePath();

    // Fill color
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Stroke color
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * canvasScale;
        ctx.stroke();
    }
}



// MARK: HELPERFUNCTIONS



// MARK: transformVertex
// Helper function to transform each vertex with a position and angle
function transformVertex(vertex, pos, angle, canvasScale) {
    // Rotate the vertex by the given angle
    const rotatedX = vertex.x * Math.cos(angle) - vertex.y * Math.sin(angle);
    const rotatedY = vertex.x * Math.sin(angle) + vertex.y * Math.cos(angle);

    // Apply the position offset and scale
    const finalX = (rotatedX + pos.x) * canvasScale;
    const finalY = (rotatedY + pos.y) * canvasScale;

    return { x: finalX, y: finalY };
}
