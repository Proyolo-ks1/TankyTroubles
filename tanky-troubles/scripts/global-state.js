export const GameState = {
    MAIN_MENU: "MAIN_MENU",
    RUNNING: "RUNNING",
};

export const OverlayState = {
    NONE: "NONE",
    PAUSE_MENU: "PAUSE_MENU",
    SETTINGS: "SETTINGS",
    HELP: "HELP",
    PAUSED: "PAUSED",
    GAME_OVER: "GAME_OVER"
};

// Define a state object to hold all global variables
const globalState = {
    debugMode: true,
    statistics: false,
    canvasScale: 0.5,
    tileSize: 192,
    tanks: [],
    bullets: [],
    particles: [],
    currentGameState: GameState.MAIN_MENU,
    overlayState: OverlayState.NONE,
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