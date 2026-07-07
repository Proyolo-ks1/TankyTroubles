import { getGlobal } from "./global-state.js";
import { camera } from './classes/camera.js';
import { Vec2 } from "./utils/math-utils.js";

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

const cameraSpeed = 1;
const keyHoldActions = {
    // Camera Control
    'u': (realDeltaTime) => {
        // Zoom in
        camera.zoomLevel *= Math.pow(0.5, realDeltaTime);
        console.log(`DB: Decreased Cam.zoomLevel by 1%: ${Math.round(camera.zoomLevel*1000) / 10}%`);
    },
    't': (realDeltaTime) => {
        // Zoom out
        camera.zoomLevel *= Math.pow(2, realDeltaTime);
        console.log(`DB: Increased Cam.zoomLevel by 1%: ${Math.round(camera.zoomLevel*1000) / 10}%`);
    },
    'g': (realDeltaTime) => {
        // Move left
        const move = Vec2.fromAngle(camera.angle + Math.PI, cameraSpeed / camera.zoomLevel * realDeltaTime);
        camera.pos.addMut(move);
        console.log(`DB: Increased Cam.pos changed by ${move} -> ${camera.pos}`);
    },
    'j': (realDeltaTime) => {
        // Move right
        const move = Vec2.fromAngle(camera.angle, cameraSpeed / camera.zoomLevel * realDeltaTime);
        camera.pos.addMut(move);
        console.log(`DB: Increased Cam.pos changed by ${move} -> ${camera.pos}`);
    },
    'h': (realDeltaTime) => {
        // Move down
        const move = Vec2.fromAngle(camera.angle + 1.5*Math.PI, cameraSpeed / camera.zoomLevel * realDeltaTime);
        camera.pos.addMut(move);
        console.log(`DB: Increased Cam.pos changed by ${move} -> ${camera.pos}`);
    },
    'y': (realDeltaTime) => {
        // Move up
        const move = Vec2.fromAngle(camera.angle + 0.5*Math.PI, cameraSpeed / camera.zoomLevel * realDeltaTime);
        camera.pos.addMut(move);
        console.log(`DB: Increased Cam.pos changed by ${move} -> ${camera.pos}`);
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
