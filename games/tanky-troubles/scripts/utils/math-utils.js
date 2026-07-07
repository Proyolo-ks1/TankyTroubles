// MARK: Functions

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

export function lerp(object, target, t) {
    return object + (target - object) * t;
}

export function lerp2(object, target, t) {
    return {
        x: lerp(object.x, target.x, t),
        y: lerp(object.y, target.y, t),
    };
}

// Shortest-angle interpolation
export function lerpAngle(a, b, t) {
    let diff = (b - a + Math.PI) % (Math.PI * 2) - Math.PI;
    return a + diff * t;
}

export function normalizeAngle(a) {
    return (a + Math.PI) % (Math.PI * 2) - Math.PI;
}



// MARK: Classes
export class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static fromAngle(angle, length = 1) {
        return new Vec2(Math.cos(angle), Math.sin(angle)).scale(length);
    }

    static distanceBetween(v1, v2) {
        return Math.hypot(v1.x - v2.x, v1.y - v2.y);
    }

    toString() {
        return `Vec2(${this.x.toFixed(3)}, ${this.y.toFixed(3)})`;
    }

    // Geometry

    clone() {
        return new Vec2(this.x, this.y);
    }

    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    scale(s) {
        return new Vec2(this.x * s, this.y * s);
    }

    length() {
        return Math.hypot(this.x, this.y);
    }

    distanceTowards(v) {
        return Math.hypot(this.x - v.x, this.y - v.y);
    }

    normalize() {
        const len = this.length() || 1;
        return new Vec2(this.x / len, this.y / len);
    }

    // State Mutation

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    zero() {
        this.x = 0;
        this.y = 0;
        return this;
    }

    addMut(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    subMut(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    scaleMut(s = 1) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    addMutScaled(v, t) {
        this.x += v.x * t;
        this.y += v.y * t;
        return this;
    }

    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;

        this.x = x;
        this.y = y;
        return this;
    }

    lerp(target, t) {
        this.x += (target.x - this.x) * t;
        this.y += (target.y - this.y) * t;
        return this;
    }
}

export class Size2 extends Vec2 {
    get w() { return this.x; }
    set w(v) { this.x = v; }

    get h() { return this.y; }
    set h(v) { this.y = v; }
}