export function signedSquare(x) {
    return Math.sign(x) * x * x;
}

export function posMod(x, n) {
    return ((x % n) + n) % n;
}

export function signedPower(x, power) {
    return Math.sign(x) * Math.abs(x) ** power;
}