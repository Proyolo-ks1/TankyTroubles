// This will hold the current canvas scale
let canvasScale = 1;
let tileSize = 0;






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// Function to update a global variable dynamically
export function setVariable(variableName, value) {
    // Check which variable needs to be updated and set it
    if (variableName === "canvasScale") {
        canvasScale = value;
    } else if (variableName === "tileSize") {
        tileSize = value;
    } else {
        console.error(`Unknown variable: ${variableName}`);
    }
}

// Function to get a global variable dynamically
export function getVariable(variableName) {
    // Check which variable needs to be returned
    if (variableName === "canvasScale") {
        return canvasScale;
    } else if (variableName === "tileSize") {
        return tileSize;
    } else {
        console.error(`Unknown variable: ${variableName}`);
        return null;
    }
}