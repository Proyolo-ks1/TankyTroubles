import { getGlobal } from "./global-state.js";

// RunningGameApi
const gameApi = document.getElementById("game-container").runningGameApi;



//      |================================|
//      |      GLOBAL GAME CONTROLS      |
//      |================================|



const keyPressActions = {
    // Number Keys
    '1': () => {
        getGlobal().debugMode = !getGlobal().debugMode;
        console.log(`DB: toggled debugMode: ${getGlobal().debugMode}`);
    },
    '2': () => {
        getGlobal().showStatistics = !getGlobal().showStatistics;
        console.log(`DB: toggled showStatistics: ${getGlobal().showStatistics}`);
    },
    '3': () => {
        getGlobal().showParticles = !getGlobal().showParticles;
        console.log(`DB: toggled showParticles: ${getGlobal().showParticles}`);
    },
    // Game Time
    ' ': () => {
        const gt = getGlobal().gameTime;
        gt.paused = !gt.paused;
        console.log(`Time: paused = ${gt.paused}`);
    },

    ',': () => {
        const gt = getGlobal().gameTime;
        gt.gameSpeed = 1.0;
        console.log(`Time: speed = ${gt.gameSpeed}`);
    },

    '.': () => {
        const gt = getGlobal().gameTime;
        if (gt.paused) {
            gt.stepOnce = true;
            console.log("Time: step once");
        }
    },

    '<': () => {
        const gt = getGlobal().gameTime;
        gt.gameSpeed = Math.max(gt.gameSpeed / 2, 0.03125);
        console.log(`Time: speed = ${gt.gameSpeed}`);
    },

    '>': () => {
        const gt = getGlobal().gameTime;
        gt.gameSpeed = Math.min(gt.gameSpeed * 2, 32);
        console.log(`Time: speed = ${gt.gameSpeed}`);
    },
};

const keyHoldActions = {
    'u': (realDeltaTime) => {
        getGlobal().camera.zoomLevel *= Math.pow(0.5, realDeltaTime);
        console.log(`DB: Decreased Cam.zoomLevel by 1%: ${Math.round(getGlobal().camera.zoomLevel*1000) / 10}%`);
    },
    't': (realDeltaTime) => {
        getGlobal().camera.zoomLevel *= Math.pow(2, realDeltaTime);
        console.log(`DB: Increased Cam.zoomLevel by 1%: ${Math.round(getGlobal().camera.zoomLevel*1000) / 10}%`);
    },
    'g': (realDeltaTime) => {
        getGlobal().camera.position.x -= 1 * realDeltaTime;
        console.log(`DB: Decreased Cam.x by 2: ${getGlobal().camera.position.x.toFixed(2)}`);
    },
    'j': (realDeltaTime) => {
        getGlobal().camera.position.x += 1 * realDeltaTime;
        console.log(`DB: Increased Cam.x by 2: ${getGlobal().camera.position.x.toFixed(2)}`);
    },
    'y': (realDeltaTime) => {
        getGlobal().camera.position.y -= 1 * realDeltaTime;
        console.log(`DB: Decreased Cam.y by 2: ${getGlobal().camera.position.y.toFixed(2)}`);
    },
    'h': (realDeltaTime) => {
        getGlobal().camera.position.y += 1 * realDeltaTime;
        console.log(`DB: Increased Cam.y by 2: ${getGlobal().camera.position.y.toFixed(2)}`);
    },
    // Camera Control
    
};

const keyPressedLastFrame = {};
let previousScrollY = 0;
let smoothedScroll = 0;
const SMOOTHING = 0.9; // more is smoother
export function globalGameControlsStep(realDeltaTime) {
    for (const key in keyPressActions) {
        const isDown = gameApi.globalKeys[key];
        if (isDown && !keyPressedLastFrame[key]) {
            keyPressActions[key]();
        }
        keyPressedLastFrame[key] = isDown;
    }

    for (const key in keyHoldActions) {
        if (gameApi.globalKeys[key]) {
            keyHoldActions[key](realDeltaTime);
        }
    }

    let scrollY = gameApi.globalScroll.deltaY / 180;
    const SCROLL_SENSITIVITY = 0.15;
    const scrollDelta = previousScrollY - scrollY;
    previousScrollY = scrollY;
    smoothedScroll = smoothedScroll * SMOOTHING + scrollDelta * (1 - SMOOTHING);
    if (smoothedScroll < -0.02 || smoothedScroll > 0.02) {
        getGlobal().camera.zoomLevel *= Math.pow(2, smoothedScroll * SCROLL_SENSITIVITY);
    } else{
        smoothedScroll = 0
    }
}
