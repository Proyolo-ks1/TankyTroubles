// Define file paths for the icons at the top
const ICON_PATH = 'assets/icons/';
const ICONS = {
    theaterModeEnter: `${ICON_PATH}expand_content_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40.svg`,
    theaterModeExit: `${ICON_PATH}collapse_content_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40.svg`,
    fullscreenEnter: `${ICON_PATH}fullscreen_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40.svg`,
    fullscreenExit: `${ICON_PATH}fullscreen_exit_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40.svg`,
    volumeOn: `${ICON_PATH}volume_up_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40.svg`,
    volumeOff: `${ICON_PATH}volume_off_40dp_E3E3E3_FILL1_wght400_GRAD0_opsz40.svg`
};

// Get the buttons and their icons id's
const fullscreenButton = document.getElementById('toggle-fullscreen');
const theaterModeButton = document.getElementById('toggle-theater-mode');
const audioButton = document.getElementById('toggle-audio');
const fullscreenIcon = document.getElementById('fullscreen-icon');
const theaterModeIcon = document.getElementById('theater-icon');
const audioIcon = document.getElementById('audio-icon');

 // defaults
let currentViewingMode = 'normal';
let theaterModeEnabled = false;
let isMuted = false;

// Function to update the button icons
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

// Function to toggle fullscreen mode
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.getElementById('game-container').requestFullscreen()
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

// Function to toggle theater mode
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

// Function to toggle audio (mute/unmute)
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



//      |=======================|
//      |      GAME CANVAS      |
//      |=======================|



// Define the global variable here
window.isGameFocused = false;
window.isGamePaused = false;

const canvas = document.getElementById("game-canvas");
const gameContainer = document.getElementById("game-container");
const gameUnfocusOverlay = document.getElementById("game-unfocus-overlay");

function focusOnGame() {
    console.log("focusOnGame()");
    window.isGameFocused = true;
    gameUnfocusOverlay.style.opacity = "0";
    window.isGamePaused = false;
}

function unfocusOnGame() {
    console.log("unfocusOnGame()");
    window.isGameFocused = false;
    gameUnfocusOverlay.style.opacity = "1";
    window.isGamePaused = true;

    if (!window.globalKeys) {
        console.log("%cweer dat rare gebeuren met !window.globalKeys", "color: red; font-weight: bold;");
        return; // Prevent crash if not yet initialized
    }
    
    // Trigger keyup event for all keys that are currently pressed
    const allKeys = Object.keys(window.globalKeys);
    allKeys.forEach((key) => {
        if (window.globalKeys[key]) { // Only trigger keyup for pressed keys
            const event = new KeyboardEvent('keyup', { key: key });
            window.dispatchEvent(event);
            window.globalKeys[key] = false;
        }
    });
}

gameContainer.addEventListener('focus', () => {
    console.log("Event: gameContainer focus");
    focusOnGame();
});

gameContainer.addEventListener('blur', () => {
    console.log("Event: gameContainer blur");
    unfocusOnGame();
});