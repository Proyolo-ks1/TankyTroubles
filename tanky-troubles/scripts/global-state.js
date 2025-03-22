// Define a state object to hold all global variables
const state = {
    canvasScale: 1,
    tileSize: 0,
    debugMode: true,
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