// Define a state object to hold all global variables
const state = {
    debugMode: false,
    canvasScale: 1,
    tileSize: 0,
    tanks: [],
    bullets: [],
};



//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// Function to update a global variable dynamically
export function setGlobalVariable(variableName, value) {
    if (state.hasOwnProperty(variableName)) {
        state[variableName] = value;
        if (Array.isArray(value)) {
            console.log(`Variable '${variableName}' has been updated. New length: ${value.length}`);
        } else {
            console.log(`Variable '${variableName}' has been updated to: ${value}`);
        }
    } else {
        console.error(`Unknown variable: ${variableName}`);
    }
}

// Function to get a global variable dynamically
export function getGlobalVariable(variableName) {
    if (state.hasOwnProperty(variableName)) {
        return state[variableName];
    } else {
        console.error(`Unknown variable: ${variableName}`);
        return null;
    }
}

// Function to get all global state variables (optional, for debugging)
export function getAllState() {
    return { ...state };
}