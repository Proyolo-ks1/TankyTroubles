const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Pas de grootte aan
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Hier teken je straks de tanks en kogels
    
    requestAnimationFrame(gameLoop);
}

gameLoop();
