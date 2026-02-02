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