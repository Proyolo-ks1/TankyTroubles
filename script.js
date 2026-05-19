const ICON_PATH = '/assets/icons/';
const ICONS = {
    theaterModeEnter: `${ICON_PATH}expand_content_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40.svg`,
    theaterModeExit: `${ICON_PATH}collapse_content_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40.svg`,
    fullscreenEnter: `${ICON_PATH}fullscreen_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40.svg`,
    fullscreenExit: `${ICON_PATH}fullscreen_exit_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40.svg`,
    volumeOn: `${ICON_PATH}volume_up_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40.svg`,
    volumeOff: `${ICON_PATH}volume_off_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40.svg`
};

// Buttons
const fullscreenButton = document.getElementById('toggle-fullscreen');
const theaterModeButton = document.getElementById('toggle-theater-mode');
const audioButton = document.getElementById('toggle-audio');
const fullscreenIcon = document.getElementById('fullscreen-icon');
const theaterModeIcon = document.getElementById('theater-icon');
const audioIcon = document.getElementById('audio-icon');
const shareBtn = document.getElementById("shareBtn");

// Defaults
let currentViewingMode = 'normal';
let theaterModeEnabled = true;
let isMuted = false;

// Button icon updates
function updateButtonIcons() {
    if (currentViewingMode === 'fullscreen') {
        fullscreenIcon.setAttribute('src', ICONS.fullscreenExit);
        theaterModeIcon.setAttribute('src', ICONS.theaterModeEnter);
    } else {
        fullscreenIcon.setAttribute('src', ICONS.fullscreenEnter);
        theaterModeIcon.setAttribute('src', theaterModeEnabled ? ICONS.theaterModeExit : ICONS.theaterModeEnter);
    }

    if (isMuted) {
        audioIcon.setAttribute('src', ICONS.volumeOff);
    } else {
        audioIcon.setAttribute('src', ICONS.volumeOn);
    }
}

// Toggle fullscreen mode
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.getElementById('game-canvas-container').requestFullscreen()
            .catch(err => console.log("Error attempting to enable fullscreen mode: ", err));
        currentViewingMode = 'fullscreen';
    } else {
        document.exitFullscreen()
            .catch(err => console.log("Error attempting to exit fullscreen mode: ", err));
        currentViewingMode = theaterModeEnabled ? 'theater' : 'normal';
    }
    
    console.log(`%cFunction: toggleFullscreen() -> currentViewingMode: ${currentViewingMode}`, "color: aqua; font-weight: bold;");
    updateButtonIcons();
}

// Toggle theater mode
function toggleTheaterMode() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.toggle('theater-mode');

    theaterModeEnabled = gameContainer.classList.contains('theater-mode');
    
    if (gameContainer.classList.contains('theater-mode')) {
        if (document.fullscreenElement) {
            document.exitFullscreen()
            .catch(err => console.log("Error attempting to exit fullscreen mode: ", err));
        }
        currentViewingMode = 'theater';
    } else {
        currentViewingMode = 'normal';
    }

    console.log(`%cFunction: toggleTheaterMode() -> currentViewingMode: ${currentViewingMode}`, "color: aqua; font-weight: bold;");
    updateButtonIcons();
}

// Toggle audio (mute/unmute)
function toggleAudio() {
    isMuted = !isMuted;
    // If you're controlling actual audio (e.g., an audio element), you'd mute/unmute it here
    // For example:
    // document.getElementById('audio-element').muted = isMuted;
    
    console.log(`%cFunction: toggleAudio() -> isMuted: ${isMuted}`, "color: aqua; font-weight: bold;");
    updateButtonIcons();
}


fullscreenButton.addEventListener('click', toggleFullscreen);
theaterModeButton.addEventListener('click', toggleTheaterMode);
audioButton.addEventListener('click', toggleAudio);
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        currentViewingMode = 'normal';
        updateButtonIcons();
    }
});


// Initial icon update on page load
updateButtonIcons();


// Sharing Feature
const urlToShare = "https://proyolo-ks1.github.io/TankyTroubles/";
shareBtn.addEventListener("click", async () => {
    if (navigator.share) {
        // Mobile: open native share dialog
        try {
            await navigator.share({
                title: "Check out TankyTroubles!",
                url: urlToShare
            });
        } catch (err) {
            console.error("Share failed:", err);
        }
    } else {
        // Desktop fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(urlToShare);
            alert("Link copied to clipboard!");
        } catch (err) {
            console.error("Copy failed:", err);
        }
    }
});



//      |=======================|
//      |      GAME CANVAS      |
//      |=======================|


const canvas = document.getElementById("game-canvas");
const gameContainer = document.getElementById("game-container");
const gameUnfocusOverlay = document.getElementById("game-unfocus-overlay");

// Set up the canvas
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#fff";

// The Running Game API, can be used by the currently running game to communicate things between Host (browser window) and Game itself. - or something like that lol.
const gameApi = gameContainer.runningGameApi = {
    isGameFocused: false,
    isGamePaused: false,
    externalDebugging: false,
    canvasCtx: ctx,
    canvasWidth: canvas.clientWidth,
    canvasHeight: canvas.clientHeight,
    globalKeys: {},
    globalScroll: {
        deltaY: 0,
    },
};

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gameApi.canvasWidth = canvas.clientWidth;
    gameApi.canvasHeight = canvas.clientHeight;
}

// EventListeners
const ro = new ResizeObserver(resizeCanvas);
ro.observe(gameContainer);

gameContainer.addEventListener('focus', () => {
    console.log("Game Focused");
    gameApi.isGameFocused = true;
    gameApi.isGamePaused = false;
    gameUnfocusOverlay.style.opacity = "0";
});

gameContainer.addEventListener('blur', () => {
    console.log("Game Unfocused");
    gameApi.isGameFocused = false;
    gameApi.isGamePaused = true;
    gameUnfocusOverlay.style.opacity = "1";

    if (!gameApi.globalKeys) {
        console.log("%c!runningGameApi.globalKeys", "color: red; font-weight: bold;");
        return; // Prevent crash if not yet initialized
    }
    
    // Trigger keyup event for all keys that are currently pressed
    const allKeys = Object.keys(gameApi.globalKeys);
    allKeys.forEach((key) => {
        if (gameApi.globalKeys[key]) { // Only trigger keyup for pressed keys
            const event = new KeyboardEvent('keyup', { key: key });
            window.dispatchEvent(event);
            gameApi.globalKeys[key] = false;
        }
    });
});

// globalKeys
window.addEventListener("keydown", (e) => {
    if (!gameApi.isGameFocused) return;
    
    if (e.key !== "F5" && e.key !== "F12") {
        e.preventDefault();
    }
    gameApi.globalKeys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    if (!gameApi.isGameFocused) return;
    
    if (e.key !== "F5" && e.key !== "F12") {
        e.preventDefault();
    }
    gameApi.globalKeys[e.key] = false;
});

// globalScroll
window.addEventListener("wheel", (e) => {
    if (!gameApi.isGameFocused) return;

    if (e.key !== "F5" && e.key !== "F12") {
        e.preventDefault();
    }
    gameApi.globalScroll.deltaY += e.deltaY;
}, { passive: false });