const DEFAULT_USER_DATA = {
    version: 1,

    userSettings: {
        audioVolume: 0.7,
        musicOn: true,
        sensitivity: 1.2,
        language: "en",
        showFPS: true
    },

    gamePresets: {
        "Balanced": {
            tankSpeed: 100,
            reloadSpeed: 1.5,
            bulletLifeSpan: 10
        },
        "Chaos Mode": {
            tankSpeed: 300,
            reloadSpeed: 0.3,
            bulletLifeSpan: 3
        }
    },
    currentGameSettings: {
        tankSpeed: 100,
        reloadSpeed: 1.5,
        bulletLifeSpan: 10
    },

    lastUsedPreset: "Balanced"
};


const DefaultPresets = {
    "Default Settings": {
        volume: 0.8,
        mazeSize: "medium",
    },
    "preset2": {
        volume: 0.8,
        mazeSize: "medium",
    },
    "Preset three": {
        volume: 0.5,
        mazeSize: "high",
    },
};

let UserData = {};
let CustomPresets = {};
let CurrentSettings = {};



//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



let userData = {};

function loadUserData() {
    const saved = localStorage.getItem("userData");
    if (saved) {
        const parsed = JSON.parse(saved);
        userData = migrateUserData(parsed);
    } else {
        userData = structuredClone(DEFAULT_USER_DATA);
        saveUserData();
    }
}



function saveCurrentSettings() {
    localStorage.setItem("currentSettings", JSON.stringify(CurrentSettings));
}

function loadCurrentSettings() {
    const savedSettings = localStorage.getItem("currentSettings");
    if (savedSettings) Object.assign(CurrentSettings, JSON.parse(savedSettings));
    else applyPreset(DefaultPresets["Default Settings"]); // fallback
}

function loadLocalPresets() {
    const saved = localStorage.getItem("customPresets");
    if (saved) CustomPresets = JSON.parse(saved);
}

function loadLocalPresets() {
    localStorage.setItem("customPresets", JSON.stringify(CustomPresets));
}

function applyPreset(presetData) {
    Object.assign(CurrentSettings, presetData);
    saveCurrentSettings();
}

function createCustomPreset(name) {
    CustomPresets[name] = { ...CurrentSettings };
    savePresets();
}
