// Enum Definitions 

export const GLOBAL_COLOR_KEYS = Object.freeze({
    CHECKERBOARD_1: "#E6E6E6", 
    CHECKERBOARD_2: "#D6D6D6",
    VECTOR_ARROW: "#00f",
    ATOMIC_YELLOW: "#F1CE41",
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

export const ENTITY_TYPES = Object.freeze({
    STATIC_ENTITY: "STATIC_ENTITY",
    PHYSICS: "PHYSICS",
});

export const HITBOX_TYPES = Object.freeze({
    CIRCLE: "CIRCLE",
    RECTANGLE: "RECTANGLE",
    OTHER_HITBOX: "OTHER_HITBOX",
});



// Objects Definitions

/**
 * @typedef {Object} Vector2d
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} EntityType
 * @property {Tank[]} tanks
 * @property {Bullet[]} bullets
 * @property {Particle[]} particles
 * @property {Utility[]} utilities
 */

/**
 * @typedef {Object} StatsRingBuffersType
 * @property {Float32Array} calculationDurations
 * @property {Float32Array} renderingDurations
 * @property {Float32Array} fps
 * @property {number} index
 * @property {number} count
 */

/**
 * @typedef {Object} GameTimeType
 * @property {number} gameSpeed
 * @property {boolean} paused
 * @property {boolean} stepOnce
 * @property {number} maxDelta
 */

/**
 * @typedef {Object} GlobalVariablesType
 * @property {boolean} debugMode
 * @property {boolean} showStatistics
 * @property {boolean} showParticles
 * @property {number} canvasScale
 * @property {number} zoomLevel
 * @property {number} renderScale
 * @property {string} gameState
 * @property {string} overlayState
 * @property {EntityType} entities
 * @property {StatsRingBuffersType} statsRingBuffers
 * @property {GameTimeType} gameTime
 */

const DEBUG_HISTORY_SIZE = 100;

/** @type {GlobalVariablesType} */
const GlobalVariables = {
    debugMode: true,
    showStatistics: true,
    showParticles: true,
    canvasScale: 1280,  // dynamically scales with canvas width - canvas width in pixel
    renderScale: 128,  // is always calculated in updateGlobalVariables() every ExecuteGameLoop() - pixels per tile
    gameState: GAME_STATE_KEYS.MAIN_MENU,
    overlayState: OVERLAY_STATE_KEYS.NONE,
    entities: {
        tanks: [],
        bullets: [],
        particles: [],
        utilities: [],
    },
    statsRingBuffers: {
        calculationDurations: new Float32Array(DEBUG_HISTORY_SIZE),
        renderingDurations: new Float32Array(DEBUG_HISTORY_SIZE),
        fps: new Float32Array(DEBUG_HISTORY_SIZE),
        index: 0, // current write position
        count: 0, // how many valid samples we have
    },
    gameTime: {
        gameSpeed: 1.0,    // 1.0 = normal, 0.5 = half speed, 0 = paused
        paused: false,
        stepOnce: false,   // single-frame advance
        maxDelta: 1 / 60,  // safety clamp
    },
};






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



/** @returns {GlobalVariablesType} */
export function getGlobal() {
    return GlobalVariables;
}

export function recordDebugFrame(calcTime, renderTime, fps) {
    const dbg = getGlobal().statsRingBuffers;

    dbg.calculationDurations[dbg.index] = calcTime;
    dbg.renderingDurations[dbg.index] = renderTime;
    dbg.fps[dbg.index] = fps;

    dbg.index = (dbg.index + 1) % DEBUG_HISTORY_SIZE;
    dbg.count = Math.min(dbg.count + 1, DEBUG_HISTORY_SIZE);
}