export class Item {
    constructor({ name = "item", type = null, vx = 0, vy = 0, px = 1, py = 1, health = 0, speedMult = 1, score = 0 } = {}) {
        this.name = name;
        this.type = type;
        this.vx = vx;      // Horizontal movement
        this.vy = vy;      // Falling speed
        this.px = px;      // Starting X (Randomized in-game)
        this.py = py;      // Starting Y (Top of screen)
        this.health = health;
        this.speedMult = speedMult;
        this.score = score;
    }
}