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

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // gray
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
            case g: h = ((b - r) / d + 2); break;
            case b: h = ((r - g) / d + 4); break;
        }

        h *= 60;
    }

    return { h, s: s * 100, l: l * 100 };
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



export function darkenHex(hex, amount = 20) {
    const { r, g, b } = hexToRGB(hex);
    let { h, s, l } = rgbToHsl(r, g, b);

    l = Math.max(0, l - amount); // reduce lightness

    return hslToHex(h, s, l);
}