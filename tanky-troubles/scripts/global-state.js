// Define a state object to hold all global variables
const globalState = {
    debugMode: false,
    canvasScale: 1,
    tileSize: 192,
    tanks: [],
    bullets: [],
    particles: [],
};



//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// Function to update a global variable dynamically
export function setGlobalVariable(variableName, value) {
    if (globalState.hasOwnProperty(variableName)) {
        globalState[variableName] = value;
        // Global Value Update Logging
        // if (Array.isArray(value)) {
        //     console.log(`Variable '${variableName}' has been updated. New length: ${value.length}`);
        // } else {
        //     console.log(`Variable '${variableName}' has been updated to: ${value}`);
        // }
    } else {
        console.error(`Unknown variable: ${variableName}`);
    }
}

// Function to get a global variable dynamically
export function getGlobalVariable(variableName) {
    if (globalState.hasOwnProperty(variableName)) {
        return globalState[variableName];
    } else {
        console.error(`Unknown variable: ${variableName}`);
        return null;
    }
}

// Function to get all global state variables (optional, for debugging)
export function getAllState() {
    return { ...globalState };
}