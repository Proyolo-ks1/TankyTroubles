import { getGlobal } from "./global-state.js";
import { camera } from './classes/camera.js';

// RunningGameApi
const gameApi = document.getElementById("game-container").runningGameApi;



//      |================================|
//      |      GLOBAL GAME CONTROLS      |
//      |================================|



const keyPressActions = {
    // Number Keys
    '1': () => {
        getGlobal().debugOverlays.show = !getGlobal().debugOverlays.show;
        console.log(`DB: toggled ShowDebugOverlays: ${getGlobal().debugOverlays.show}
        (EntityPhysics: ${getGlobal().debugOverlays.entityPhysics},
        EntityDetails: ${getGlobal().debugOverlays.entityDetails},
        Hitboxes: ${getGlobal().debugOverlays.hitboxes},
        Camera: ${getGlobal().debugOverlays.camera})`);
    },
    '2': () => {
        getGlobal().debugOverlays.showStatistics = !getGlobal().debugOverlays.showStatistics;
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
    // Camera Control
    'u': (realDeltaTime) => {
        camera.zoomLevel *= Math.pow(0.5, realDeltaTime);
        console.log(`DB: Decreased Cam.zoomLevel by 1%: ${Math.round(camera.zoomLevel*1000) / 10}%`);
    },
    't': (realDeltaTime) => {
        camera.zoomLevel *= Math.pow(2, realDeltaTime);
        console.log(`DB: Increased Cam.zoomLevel by 1%: ${Math.round(camera.zoomLevel*1000) / 10}%`);
    },
    'g': (realDeltaTime) => {
        camera.pos.x -= 1 / camera.zoomLevel * realDeltaTime;
        console.log(`DB: Decreased Cam.x by 2: ${camera.pos.x.toFixed(2)}`);
    },
    'j': (realDeltaTime) => {
        camera.pos.x += 1 / camera.zoomLevel * realDeltaTime;
        console.log(`DB: Increased Cam.x by 2: ${camera.pos.x.toFixed(2)}`);
    },
    'h': (realDeltaTime) => {
        camera.pos.y -= 1 / camera.zoomLevel * realDeltaTime;
        console.log(`DB: Decreased Cam.y by 2: ${camera.pos.y.toFixed(2)}`);
    },
    'y': (realDeltaTime) => {
        camera.pos.y += 1 / camera.zoomLevel * realDeltaTime;
        console.log(`DB: Increased Cam.y by 2: ${camera.pos.y.toFixed(2)}`);
    },
    'b': (realDeltaTime) => {
        camera.angle -= 2 * realDeltaTime;
        console.log(`DB: Decreased Cam.angle by 2: ${camera.angle.toFixed(2)}`);
    },
    'n': (realDeltaTime) => {
        camera.angle += 2 * realDeltaTime;
        console.log(`DB: Increased Cam.angle by 2: ${camera.angle.toFixed(2)}`);
    },
    
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
        camera.zoomLevel *= Math.pow(2, smoothedScroll * SCROLL_SENSITIVITY);
    } else{
        smoothedScroll = 0
    }
}
