import { getGlobal } from "./global-state.js";

// RunningGameApi
const gameApi = document.getElementById("game-container").runningGameApi;







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
            tank.size.length *= Math.pow(0.5, realDeltaTime);
            tank.size.width  *= Math.pow(0.5, realDeltaTime);
        });
        console.log("DB: Decreased tank size 1%");
    },
    '4': (realDeltaTime) => {
        getGlobal().entities.tanks.forEach(tank => {
            tank.size.length *= Math.pow(2, realDeltaTime);
            tank.size.width  *= Math.pow(2, realDeltaTime);
        });
        console.log("DB: Inscreased tank size 1%");
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
        gt.gameSpeed = Math.min(gt.gameSpeed * 2, 16);
        console.log(`Time: speed = ${gt.gameSpeed}`);
    },
};

const keyPressedLastFrame = {};
const MAX_SCROLL_DELTA = 0.1; // clamp per frame

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

    const scrollDelta = gameApi.globalScroll.deltaY;
    if (scrollDelta !== 0) {
        // Clamp to avoid huge zoom jumps
        const clampedDelta = Math.max(-MAX_SCROLL_DELTA, Math.min(MAX_SCROLL_DELTA, scrollDelta));
        getGlobal().zoomLevel *= Math.pow(2, -clampedDelta);
        console.log(`DB: Zoom factor applied: ${Math.pow(2, clampedDelta).toFixed(3)}`);

        // Reset accumulated delta
        gameApi.globalScroll.deltaY = 0;
    }
}

const SCROLL_SENSITIVITY = 0.0;

document.addEventListener("wheel", (e) => {
    if (!gameApi.isGameFocused) return;
    e.preventDefault();

    // Accumulate scroll delta
    gameApi.globalScroll.deltaY += e.deltaY * SCROLL_SENSITIVITY;
}, { passive: false });