import { getVariable } from './global-state.js';






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// Function to draw a rectangle with optional rounded corners, applying canvas scaling
export function drawRect(ctx, x, y, width, height, fillColor, strokeColor = null, strokeWidth = 1, borderRadius = 0) {
    const canvasScale = getVariable("canvasScale");
    
    // Scale values
    const scaledX = x * canvasScale;
    const scaledY = y * canvasScale;
    const scaledWidth = width * canvasScale;
    const scaledHeight = height * canvasScale;
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

// Function to draw a circle with optional outline, applying canvas scaling
export function drawCircle(ctx, x, y, radius, fillColor, strokeColor = null, strokeWidth = 1) {
    const canvasScale = getVariable("canvasScale");

    const scaledX = x * canvasScale;
    const scaledY = y * canvasScale;
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

// Function to draw a regular polygon with one flat side facing the bottom
export function drawRegPolygon(ctx, x, y, n, radius, fillColor, strokeColor = null, strokeWidth = 1) {
    const canvasScale = getVariable("canvasScale");
    const angleStep = (Math.PI * 2) / n;  // Angle between each vertex
    const rotationOffset = angleStep / 2;

    ctx.beginPath();

    // Start at the rotated position
    for (let i = 0; i < n; i++) {
        // Calculate the angle for each vertex, considering the rotation offset
        const angle = rotationOffset + angleStep * i;

        // Calculate the x and y position using polar coordinates
        const vx = x + radius * Math.cos(angle);
        const vy = y + radius * Math.sin(angle);

        // Move to the first vertex or draw a line to the next vertex
        if (i === 0) {
            ctx.moveTo(vx * canvasScale, vy * canvasScale);
        } else {
            ctx.lineTo(vx * canvasScale, vy * canvasScale);
        }
    }

    ctx.closePath();

    ctx.fillStyle = fillColor;
    ctx.fill();

    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * canvasScale;
        ctx.stroke();
    }
}


