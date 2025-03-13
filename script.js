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
const fullscreenButton = document.getElementById('fullscreen');
const theaterModeButton = document.getElementById('theater-mode');
const audioButton = document.getElementById('toggle-audio');
const fullscreenIcon = document.getElementById('fullscreen-icon');
const theaterModeIcon = document.getElementById('theater-icon');
const audioIcon = document.getElementById('audio-icon');

let currentViewingMode = 'normal'; // default mode
let isMuted = false;

// Function to update the button icons
function updateButtonIcons() {
    if (currentViewingMode === 'fullscreen') {
        fullscreenIcon.setAttribute('src', ICONS.fullscreenExit);
        theaterModeIcon.setAttribute('src', ICONS.theaterModeEnter);
    } else if (currentViewingMode === 'theater') {
        fullscreenIcon.setAttribute('src', ICONS.fullscreenEnter);
        theaterModeIcon.setAttribute('src', ICONS.theaterModeExit);
    } else if (currentViewingMode === 'normal') {
        fullscreenIcon.setAttribute('src', ICONS.fullscreenEnter);
        theaterModeIcon.setAttribute('src', ICONS.theaterModeEnter);
    }

    if (isMuted) {
        audioIcon.setAttribute('src', ICONS.volumeOff);
    } else {
        audioIcon.setAttribute('src', ICONS.volumeOn);
    }
}

// Function to toggle fullscreen mode
function toggleFullscreen() {
    console.log(`%cFunction -> toggleFullscreen()`, "color: lime; font-weight: bold;");
    if (!document.fullscreenElement) {
        document.getElementById('game-container').requestFullscreen()
            .catch(err => console.log("Error attempting to enable fullscreen mode: ", err));
        currentViewingMode = 'fullscreen';
    } else {
        document.exitFullscreen()
            .catch(err => console.log("Error attempting to exit fullscreen mode: ", err));
        currentViewingMode = 'normal';
    }
    
    console.log(`toggleFullscreen() -> ${currentViewingMode}`);
    updateButtonIcons();
}

// Function to toggle theater mode
function toggleTheaterMode() {
    console.log(`%cFunction -> toggleTheaterMode()`, "color: lime; font-weight: bold;");
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.toggle('theater-mode');
    
    if (gameContainer.classList.contains('theater-mode')) {
        currentViewingMode = 'theater';
    } else {
        currentViewingMode = 'normal';
    }

    console.log(`toggleTheaterMode() -> currentViewingMode: ${currentViewingMode}`);
    updateButtonIcons();
}

// Function to toggle audio (mute/unmute)
function toggleAudio() {
    console.log(`%cFunction -> toggleAudio()`, "color: lime; font-weight: bold;");
    isMuted = !isMuted;
    // If you're controlling actual audio (e.g., an audio element), you'd mute/unmute it here
    // For example:
    // document.getElementById('audio-element').muted = isMuted;
    
    
    console.log(`toggleAudio() -> isMuted: ${isMuted}`);
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
