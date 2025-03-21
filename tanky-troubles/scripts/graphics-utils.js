import { getVariable } from './global-state.js';






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// Function to draw a rectangle with optional rounded corners, applying canvas scaling
export function drawRect(ctx, pos, size, fillColor, strokeColor = null, strokeWidth = 1, borderRadius = 0) {
    const canvasScale = getVariable("canvasScale");

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

// Function to draw a circle with optional outline, applying canvas scaling
export function drawCircle(ctx, posCenter, radius, fillColor, strokeColor = null, strokeWidth = 1) {
    const canvasScale = getVariable("canvasScale");

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

// Function to draw a regular polygon with one flat side facing the bottom
export function drawRegPolygon(ctx, posCenter, radius, n, fillColor, strokeColor = null, strokeWidth = 1) {
    const canvasScale = getVariable("canvasScale");
    const angleStep = (Math.PI * 2) / n;  // Angle between each vertex
    const rotationOffset = angleStep / 2;

    // Scale the center position and radius early
    const scaledX = posCenter.x * canvasScale;
    const scaledY = posCenter.y * canvasScale;
    const scaledRadius = radius * canvasScale;

    ctx.beginPath();

    // Start at the rotated position
    for (let i = 0; i < n; i++) {
        // Calculate the angle for each vertex, considering the rotation offset
        const angle = rotationOffset + angleStep * i;

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

// Function to draw an arrow (velocity vector) on the canvas, using pos and canvas scaling
export function drawArrow(ctx, pos, velocity, arrowSize = 5, color = "blue") {
    const canvasScale = getVariable("canvasScale");

    // Scale the position
    const scaledX = pos.x * canvasScale;
    const scaledY = pos.y * canvasScale;

    // Calculate the arrow tip position (scaled)
    const arrowTipX = scaledX + velocity.vx * canvasScale;
    const arrowTipY = scaledY + velocity.vy * canvasScale;

    // Draw the velocity vector as a line (scaled)
    ctx.beginPath();
    ctx.moveTo(scaledX, scaledY);  // Start at the bullet's position
    ctx.lineTo(arrowTipX, arrowTipY);  // End at the arrow tip
    ctx.strokeStyle = color;  // Set arrow color
    ctx.lineWidth = 2;  // Set line width
    ctx.stroke();

    // Draw the arrowhead at the tip of the vector (scaled)
    const angle = Math.atan2(velocity.vy, velocity.vx);  // Angle of the velocity vector

    // Calculate the positions of the two arrowhead lines (scaled)
    const leftX = arrowTipX - arrowSize * Math.cos(angle - Math.PI / 6) * canvasScale;
    const leftY = arrowTipY - arrowSize * Math.sin(angle - Math.PI / 6) * canvasScale;
    const rightX = arrowTipX - arrowSize * Math.cos(angle + Math.PI / 6) * canvasScale;
    const rightY = arrowTipY - arrowSize * Math.sin(angle + Math.PI / 6) * canvasScale;

    // Draw the arrowhead in one path (scaled)
    ctx.moveTo(arrowTipX, arrowTipY);  // Start at the tip of the vector
    ctx.lineTo(leftX, leftY);  // Left side of the arrowhead
    ctx.moveTo(arrowTipX, arrowTipY);  // Move back to the tip of the arrow
    ctx.lineTo(rightX, rightY);  // Right side of the arrowhead
    ctx.stroke();
}


