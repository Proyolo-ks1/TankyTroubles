const powerUpImages = {};
const projectileImages = {};
let globalScale = 1; // Track the game scale

// Function to preload images
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
}

// Preload and store all images
async function preloadImages() {
    // Power-ups - Offensive
    powerUpImages["unknown-gray"] = await loadImage("../assets/images/power-ups/unknown-gray.png");
    powerUpImages["booby-trap"] = await loadImage("../assets/images/power-ups/booby-trap.png");
    powerUpImages["chaingun"] = await loadImage("../assets/images/power-ups/chaingun.png");
    powerUpImages["cryo-bomb"] = await loadImage("../assets/images/power-ups/cryo-bomb.png");
    powerUpImages["double-barrel"] = await loadImage("../assets/images/power-ups/double-barrel.png");
    powerUpImages["drill"] = await loadImage("../assets/images/power-ups/drill.png");

    // Power-ups - Defensive
    powerUpImages["unknown-blue"] = await loadImage("../assets/images/power-ups/unknown-blue.png");
    powerUpImages["healing"] = await loadImage("../assets/images/power-ups/healing.png");
    powerUpImages["shield-hp"] = await loadImage("../assets/images/power-ups/shield-hp.png");
    powerUpImages["shield-time"] = await loadImage("../assets/images/power-ups/shield-time.png");

    // Power-ups - Boosts
    powerUpImages["unknown-yellow"] = await loadImage("../assets/images/power-ups/unknown-yellow.png");
    powerUpImages["boost-bullet-damage"] = await loadImage("../assets/images/power-ups/boost-bullet-damage.png");
    powerUpImages["boost-bullet-speed"] = await loadImage("../assets/images/power-ups/boost-bullet-speed.png");
    powerUpImages["boost-movement-speed"] = await loadImage("../assets/images/power-ups/boost-movement-speed.png");

    // Projectiles
    projectileImages["booby-trap"] = await loadImage("../assets/images/projectiles/booby-trap.png");
    projectileImages["missile"] = await loadImage("../assets/images/projectiles/missile.png");
}

// Rescale all images when needed
function rescaleImages(scale) {
    globalScale = scale;
    
    // Function to create a scaled version of an image
    function scaleImage(image, scale) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas;
    }

    // Rescale images
    for (let key in powerUpImages) {
        powerUpImages[key] = scaleImage(powerUpImages[key], scale);
    }
    for (let key in projectileImages) {
        projectileImages[key] = scaleImage(projectileImages[key], scale);
    }
}

// Function to get an image
function getImage(category, name) {
    if (category === "powerup") return powerUpImages[name];
    if (category === "projectile") return projectileImages[name];
    console.error(`Image not found: ${category}/${name}`);
    return null;
}

export { preloadImages, rescaleImages, getImage };
