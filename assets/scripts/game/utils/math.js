export class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    // A simple LCG (Linear Congruential Generator)
    // Returns a value between 0 and 1
    next(localSeed = 0) {
        // We mix the global seed with a local coordinate (like globalX)
        let s = this.seed + localSeed;
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    }
}

// A simple 1D Gradient Noise / Perlin-like implementation
export class Noise1D {
    constructor(seed) {
        this.seed = seed;
        // Permutation table (shuffled 0-255)
        this.p = new Uint8Array(512);
        const permutation = new Uint8Array(256).map((_, i) => i);
        
        // Simple shuffle based on seed
        for (let i = 255; i > 0; i--) {
            const r = Math.floor((this.seed % (i + 1)));
            [permutation[i], permutation[r]] = [permutation[r], permutation[i]];
        }

        for (let i = 0; i < 512; i++) {
            this.p[i] = permutation[i & 255];
        }
    }

    // Smootherstep interpolation
    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x) { return (hash & 1) === 0 ? x : -x; }

    get(x) {
        const X = Math.floor(x) & 255;
        x -= Math.floor(x);
        const u = this.fade(x);
        return this.lerp(u, this.grad(this.p[X], x), this.grad(this.p[X + 1], x - 1)) * 2;
    }
}

export function selectRandomItem(iterable, chances = [], useTrueRandom = false) {
    // 1. Ensure we have weights for EVERY item (default to 1 if missing)
    const weights = iterable.map((_, i) => chances[i] ?? 1);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let roll;
    if (useTrueRandom) {
        roll = Math.random() * totalWeight;
    } else {
        const random = new SeededRandom(window.worldSeed ?? 12345);
        roll = random.next(0) * totalWeight;
    }

    // 2. Use the 'weights' array instead of 'chances'
    for (let i = 0; i < iterable.length; i++) {
        if (roll < weights[i]) {
            return iterable[i];
        }
        roll -= weights[i];
    }

    return iterable[iterable.length - 1];
}