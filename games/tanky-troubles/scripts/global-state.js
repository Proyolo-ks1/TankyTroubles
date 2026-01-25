export const GLOBAL_COLOR_KEYS = Object.freeze({
    CHECKERBOARD_1: "#E6E6E6", 
    CHECKERBOARD_2: "#D6D6D6",
    VECTOR_ARROW: "#00f",
});

export const GAME_STATE_KEYS = Object.freeze({
    MAIN_MENU: "MAIN_MENU",
    RUNNING: "RUNNING",
    WINDOW_DEBUGGING: "WINDOW_DEBUGGING", 
});

export const OVERLAY_STATE_KEYS = Object.freeze({
    NONE: "NONE",
    PAUSE_MENU: "PAUSE_MENU",
    SETTINGS: "SETTINGS",
    HELP: "HELP",
    PAUSED: "PAUSED",
    GAME_OVER: "GAME_OVER",
});


/**
 * @typedef {Object} EntityType
 * @property {Tank[]} tanks
 * @property {Bullet[]} bullets
 * @property {Particle[]} particles
 */

/**
 * @typedef {Object} DebugRingBuffersType
 * @property {number[]} calculateTime
 * @property {number[]} renderTime
 * @property {number[]} fps
 */

/**
 * @typedef {Object} GlobalVariablesType
 * @property {boolean} debugMode
 * @property {boolean} showStatistics
 * @property {number} canvasScale
 * @property {number} zoomLevel
 * @property {number} renderScale
 * @property {EntityType} entities
 * @property {DebugRingBuffersType} debugRingBuffers
 * @property {string} gameState
 * @property {string} overlayState
 */

/** @type {GlobalVariablesType} */
const GlobalVariables = {
    debugMode: true,
    showStatistics: true,
    canvasScale: 1280,
    zoomLevel: 0.1,
    renderScale: 128,
    entities: {
        tanks: [],
        bullets: [],
        particles: [],
    },
    debugRingBuffers: {
        calculateTime: [],
        renderTime: [],
        fps: [],
    },
    gameState: GAME_STATE_KEYS.MAIN_MENU,
    overlayState: OVERLAY_STATE_KEYS.NONE,
};






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



/** @returns {GlobalVariablesType} */
export function getGlobal() {
    return GlobalVariables;
}