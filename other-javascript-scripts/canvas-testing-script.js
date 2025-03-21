// Set up the canvas
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Resize the canvas to match its CSS size
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    draw();  // Redraw after resizing
}

// Call resize function initially and on resize
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Draw grid
function drawGrid() {
    const gridSize = 50; // 50px grid cells
    const rows = Math.ceil(canvas.height / gridSize);
    const cols = Math.ceil(canvas.width / gridSize);

    ctx.strokeStyle = "#ddd";  // Grid line color
    ctx.lineWidth = 1;

    for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
    }

    for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

// Draw corner markers
function drawCorners() {
    const cornerSize = 10;
    ctx.fillStyle = "#ff0000"; // Red

    ctx.fillRect(0, 0, cornerSize, cornerSize);
    ctx.fillRect(canvas.width - cornerSize, 0, cornerSize, cornerSize);
    ctx.fillRect(0, canvas.height - cornerSize, cornerSize, cornerSize);
    ctx.fillRect(canvas.width - cornerSize, canvas.height - cornerSize, cornerSize, cornerSize);
}

// Draw the game scene
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear
    drawGrid();
    drawCorners();
}

// Initial draw
draw();
