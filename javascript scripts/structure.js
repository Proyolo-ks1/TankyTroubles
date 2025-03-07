// JavaScript to resize the game container based on window size
function resizeGameContainer() {
    const gameCanvasContainer = document.getElementById("game-canvas-container");

    // Get the max height (90vh) and max width (100%)
    const maxHeight = window.innerHeight * 0.9; // 90% of the viewport height
    const maxWidth = window.innerWidth; // 100% of the viewport width

    // Calculate the possible height and width based on the 16:9 aspect ratio
    let width = maxWidth;
    let height = width * (9 / 16); // 16:9 aspect ratio

    if (height > maxHeight) {
        // If height exceeds 90vh, adjust based on the max height
        height = maxHeight;
        width = height * (16 / 9); // Adjust width based on the max height
    }

    // Apply the calculated width and height to the gameCanvasContainer
    gameCanvasContainer.style.width = `${width}px`;
    gameCanvasContainer.style.height = `${height}px`;
}

// Call resizeGameContainer whenever the window is resized or loaded
window.addEventListener('resize', resizeGameContainer);
window.addEventListener('load', resizeGameContainer);
