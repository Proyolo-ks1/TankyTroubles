import { getCanvasScale } from './global-state.js';






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// Function to draw a rectangle with optional outline, applying canvas scaling
export function drawRect(ctx, x, y, width, height, fillColor, strokeColor = null, strokeWidth = 1) {
    const canvasScale = getCanvasScale();

    const scaledX = x * canvasScale;
    const scaledY = y * canvasScale;
    const scaledWidth = width * canvasScale;
    const scaledHeight = height * canvasScale;

    ctx.fillStyle = fillColor;
    ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
    
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * canvasScale;
        ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
    }
}

// Function to draw a circle with optional outline, applying canvas scaling
export function drawCircle(ctx, x, y, radius, fillColor, strokeColor = null, strokeWidth = 1) {
    const canvasScale = getCanvasScale();

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

// Function to draw a regular polygon (e.g., triangle, square, hexagon, etc.)
export function drawRegPolygon(ctx, x, y, n, radius, fillColor, strokeColor = null, strokeWidth = 1) {
    const canvasScale = getCanvasScale();

    const angleStep = (Math.PI * 2) / n;  // Angle between each vertex
    ctx.beginPath();
    
    for (let i = 0; i < n; i++) {
        // Calculate x and y coordinates of each vertex using polar coordinates
        const angle = i * angleStep;
        const vx = x + radius * Math.cos(angle);
        const vy = y + radius * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(vx * canvasScale, vy * canvasScale); // Move to the first vertex
        } else {
            ctx.lineTo(vx * canvasScale, vy * canvasScale); // Draw line to the next vertex
        }
    }
    
    // Close the polygon (connect back to the first vertex)
    ctx.closePath();
    
    ctx.fillStyle = fillColor;
    ctx.fill();
    
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * canvasScale;
        ctx.stroke();
    }
}
