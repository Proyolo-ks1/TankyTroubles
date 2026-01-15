export const GLOBAL_COLOR_KEYS = Object.freeze({
    CHECKERBOARD_1: "#E6E6E6", 
    CHECKERBOARD_2: "#D6D6D6",
    VECTOR_ARROW: "#00f",
});

export const GAME_STATE_KEYS = Object.freeze({
    MAIN_MENU: "MAIN_MENU",
    RUNNING: "RUNNING",
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
 * @typedef {Object} GameObjectsType
 * @property {Tank[]} tanks
 * @property {Bullet[]} bullets
 * @property {Particle[]} particles
 */

/**
 * @typedef {Object} GlobalVariablesType
 * @property {boolean} debugMode
 * @property {boolean} showStatistics
 * @property {number} canvasScale
 * @property {number} tileSize
 * @property {GameObjectsType} gameObjects
 * @property {string} gameState
 * @property {string} overlayState
 */

/** @type {GlobalVariablesType} */
const GlobalVariables = {
    debugMode: true,
    showStatistics: true,
    canvasScale: 0.5,
    tileSize: 100,
    gameObjects: {
        tanks: [],
        bullets: [],
        particles: [],
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