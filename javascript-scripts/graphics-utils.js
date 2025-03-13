// Function to draw a circle with optional outline, applying canvas scaling
function drawCircle(ctx, x, y, radius, fillColor, strokeColor = null, strokeWidth = 1) {
    const scaledX = canvasOffsetX + x * canvasScale;
    const scaledY = canvasOffsetY + y * canvasScale;
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

// Function to draw a rectangle with optional outline, applying canvas scaling
function drawRect(ctx, x, y, width, height, fillColor, strokeColor = null, strokeWidth = 1) {
    const scaledX = canvasOffsetX + x * canvasScale;
    const scaledY = canvasOffsetY + y * canvasScale;
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
