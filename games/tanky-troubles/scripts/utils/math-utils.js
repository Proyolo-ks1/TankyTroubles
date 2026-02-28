export function signedSquare(x) {
    return Math.sign(x) * x * x;
}

export function posMod(x, n) {
    return ((x % n) + n) % n;
}

export function signedPower(x, power) {
    return Math.sign(x) * Math.abs(x) ** power;
}

// Deterministic pseudo-random number in range [0, 1)
export function randomSeeded(seed) {
    // Mulberry32 – fast, stable, perfect for debug visuals
    let t = seed + 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

export function randomRangeSeeded(seed, min, max) {
    return min + randomSeeded(seed) * (max - min);
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    const r = Math.round(255 * f(0));
    const g = Math.round(255 * f(8));
    const b = Math.round(255 * f(4));

    return (
        "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0")
    );
}

export function hexToRGB(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const bigint = parseInt(hex, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

export function randomColorHSLSeeded(
    seed,
    saturation = 70,
    lightness = 50
) {
    const hue = randomSeeded(seed) * 360;
    return hslToHex(hue, saturation, lightness);
}

export function randomColorHSLRangedSeeded(
    seed,
    satMin = 60,
    satMax = 90,
    lightMin = 40,
    lightMax = 65
) {
    const hue = randomSeeded(seed + 0) * 360;
    const sat = satMin + randomSeeded(seed + 1) * (satMax - satMin);
    const light = lightMin + randomSeeded(seed + 2) * (lightMax - lightMin);

    return hslToHex(hue, sat, light);
}

export function randomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    return (
        "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0")
    );
}

export function randomColorSeeded(seed) {
    const r = Math.floor(randomSeeded(seed + 0) * 256);
    const g = Math.floor(randomSeeded(seed + 1) * 256);
    const b = Math.floor(randomSeeded(seed + 2) * 256);

    return (
        "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0")
    );
}

export function randomColorRangedSeeded(seed, min = 40, max = 215) {
    const range = max - min;

    const r = min + Math.floor(randomSeeded(seed + 0) * range);
    const g = min + Math.floor(randomSeeded(seed + 1) * range);
    const b = min + Math.floor(randomSeeded(seed + 2) * range);

    return (
        "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0")
    );
}

export function randomColorRanged(min = 40, max = 215) {
    const range = max - min;

    const r = min + Math.floor(Math.random() * range);
    const g = min + Math.floor(Math.random() * range);
    const b = min + Math.floor(Math.random() * range);

    return (
        "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0")
    );
}