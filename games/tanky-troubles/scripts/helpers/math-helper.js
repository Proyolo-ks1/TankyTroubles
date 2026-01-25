export function signedSquare(x) {
    return Math.sign(x) * x * x;
}

export function posMod(x, n) {
    return ((x % n) + n) % n;
}