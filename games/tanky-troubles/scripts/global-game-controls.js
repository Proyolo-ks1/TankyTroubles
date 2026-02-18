import { getGlobal } from "./global-state.js";

// RunningGameApi
const gameApi = document.getElementById("game-container").runningGameApi;



//      |================================|
//      |      GLOBAL GAME CONTROLS      |
//      |================================|



const numberKeyPressActions = {
    '1': () => {
        getGlobal().debugMode = !getGlobal().debugMode;
        console.log(`DB: toggled debugMode: ${getGlobal().debugMode}`);
    },
    '2': () => {
        getGlobal().showStatistics = !getGlobal().showStatistics;
        console.log(`DB: toggled showStatistics: ${getGlobal().showStatistics}`);
    },
};

const numberKeyHoldActions = {
    '3': (realDeltaTime) => {
        getGlobal().entities.tanks.forEach(tank => {
            tank.scale *= Math.pow(0.5, realDeltaTime);
        });
        console.log("DB: Decreased tank scale 1%");
    },
    '4': (realDeltaTime) => {
        getGlobal().entities.tanks.forEach(tank => {
            tank.scale *= Math.pow(2, realDeltaTime);
        });
        console.log("DB: Inscreased tank scale 1%");
    },
    '5': (realDeltaTime) => {
        getGlobal().zoomLevel *= Math.pow(0.5, realDeltaTime);
        console.log(`DB: Decreased zoomLevel by 1%: ${Math.round(getGlobal().zoomLevel*1000) / 10}%`);
    },
    '6': (realDeltaTime) => {
        getGlobal().zoomLevel *= Math.pow(2, realDeltaTime);
        console.log(`DB: Increased zoomLevel by 1%: ${Math.round(getGlobal().zoomLevel*1000) / 10}%`);
    },
};

const timeKeyPressActions = {
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

const keyPressedLastFrame = {};
let previousScrollY = 0;
let smoothedScroll = 0;
const SMOOTHING = 0.9; // more is smoother
export function globalGameControlsStep(realDeltaTime) {
    for (const key in numberKeyPressActions) {
        const isDown = gameApi.globalKeys[key];
        if (isDown && !keyPressedLastFrame[key]) {
            numberKeyPressActions[key]();
        }
        keyPressedLastFrame[key] = isDown;
    }

    for (const key in timeKeyPressActions) {
        const isDown = gameApi.globalKeys[key];
        if (isDown && !keyPressedLastFrame[key]) {
            timeKeyPressActions[key]();
        }
        keyPressedLastFrame[key] = isDown;
    }

    for (const key in numberKeyHoldActions) {
        if (gameApi.globalKeys[key]) {
            numberKeyHoldActions[key](realDeltaTime);
        }
    }

    let scrollY = gameApi.globalScroll.deltaY / 180;
    const SCROLL_SENSITIVITY = 0.15;
    const scrollDelta = previousScrollY - scrollY;
    previousScrollY = scrollY;
    smoothedScroll = smoothedScroll * SMOOTHING + scrollDelta * (1 - SMOOTHING);
    if (smoothedScroll < -0.02 || smoothedScroll > 0.02) {
        getGlobal().zoomLevel *= Math.pow(2, smoothedScroll * SCROLL_SENSITIVITY);
    } else{
        smoothedScroll = 0
    }
}
