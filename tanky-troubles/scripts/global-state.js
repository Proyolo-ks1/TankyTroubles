export const GAME_STATES = Object.freeze({
    MAIN_MENU: "MAIN_MENU",
    RUNNING: "RUNNING",
});

export const OVERLAY_STATES = Object.freeze({
    NONE: "NONE",
    PAUSE_MENU: "PAUSE_MENU",
    SETTINGS: "SETTINGS",
    HELP: "HELP",
    PAUSED: "PAUSED",
    GAME_OVER: "GAME_OVER"
});

export const GLOBAL_VARIABLES = Object.freeze({
    DEBUG_MODE: "debugMode",
    SHOW_STATISTICS: "showStatistics",
    CANVAS_SCALE: "canvasScale",
    TILE_SIZE: "tileSize",
    GAME_OBJECTS: "gameObjects",
    TANKS: "tanks",
    BULLETS: "bullets",
    PARTICLES: "particles",
    GAME_STATE: "currentGameState",
    OVERLAY_STATE: "overlayState",
});


const GlobalVariables = {
    debugMode: true,
    showStatistics: true,
    canvasScale: 0.5,
    tileSize: 192,
    gameObjects: [],
    tanks: [],
    bullets: [],
    particles: [],
    currentGameState: GAME_STATES.MAIN_MENU,
    overlayState: OVERLAY_STATES.NONE,
};






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// Function to get a global variable dynamically
export function getGlobalVariable(variableName) {
    if (GlobalVariables.hasOwnProperty(variableName)) {
        return GlobalVariables[variableName];
    } else {
        console.error(`Unknown variable: ${variableName}`);
        return null;
    }
}

// Function to update a global variable dynamically
export function setGlobalVariable(variableName, value) {
    if (GlobalVariables.hasOwnProperty(variableName)) {
        GlobalVariables[variableName] = value;
        // Global Value Update Logging
        if (Array.isArray(value)) {
            console.log(`Variable '${variableName}' has been updated. New length: ${value.length}`);
        } else {
            console.log(`Variable '${variableName}' has been updated to: ${value}`);
        }
    } else {
        console.error(`Unknown variable: ${variableName}`);
    }
}

// Function to get all global state variables (optional, for debugging)
export function getAllState() {
    return { ...GlobalVariables };
}