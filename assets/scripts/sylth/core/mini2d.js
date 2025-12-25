const ImageCache = new Map();

function loadImage(src) {
    if (ImageCache.has(src)) return ImageCache.get(src);

    const img = new Image();
    img.src = src;
    ImageCache.set(src, img);
    return img;
}

export class Mini2D {
    constructor({
        background = null,
        maxParticles = 50,
        particleColor = "rgba(255,255,255,0.4)"
    } = {}) {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        Object.assign(this.canvas.style, {
            position: "absolute",
            inset: "0",
            margin: "auto",
            pointerEvents: "none"
        });

        document.body.appendChild(this.canvas);

        this.resize();
        window.addEventListener("resize", () => this.resize());

        this.background = background;
        this.sprites = [];
        this.collisions = [];
        this.lastTime = performance.now();

        requestAnimationFrame(t => this.loop(t));
    }

    resize() {
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
    }

    add(sprite) {
        sprite.engine = this;
        this.sprites.push(sprite);
        return sprite;
    }

    onCollision(typeA, typeB, callback) {
        this.collisions.push({ typeA, typeB, callback });
    }

    checkCollisions() {
        for (let i = 0; i < this.sprites.length; i++) {
            for (let j = i + 1; j < this.sprites.length; j++) {
                const a = this.sprites[i];
                const b = this.sprites[j];

                if (!a.solid || !b.solid) continue;

                if (
                    a.x < b.x + b.w &&
                    a.x + a.w > b.x &&
                    a.y < b.y + b.h &&
                    a.y + a.h > b.y
                ) {
                    for (const rule of this.collisions) {
                        if (
                            (a.type === rule.typeA && b.type === rule.typeB) ||
                            (a.type === rule.typeB && b.type === rule.typeA)
                        ) {
                            rule.callback(a, b);
                        }
                    }
                }
            }
        }
    }

    loop(time) {
        const dt = (time - this.lastTime) / 16.666;
        this.lastTime = time;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.background) {
            this.ctx.fillStyle = this.background;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        for (const s of this.sprites) {
            s.update(dt);
            s.draw(this.ctx);
        }

        this.checkCollisions();
        requestAnimationFrame(t => this.loop(t));
    }
}

export class Sprite {
    constructor({
        image,
        type = "generic",
        x = 0.5,
        y = 0.5,
        size = 0.06,
        speed = 0.004,
        angle = 0,
        direction = 0,
        solid = true
    }) {
        this.img = loadImage(image);
        this.type = type;

        this.rx = x;
        this.ry = y;
        this.size = size;

        this.speed = speed;
        this.angle = angle;
        this.direction = direction;

        this.solid = solid;
    }

    update(dt) {
        const c = this.engine.canvas;

        this.w = c.width * this.size;
        this.h = this.w;

        this.rx += Math.cos(this.angle) * this.speed * this.direction * dt;
        this.ry += Math.sin(this.angle) * this.speed * this.direction * dt;

        this.x = c.width * this.rx;
        this.y = c.height * this.ry;
    }

    draw(ctx) {
        if (this.img.complete) {
            ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        }
    }
}

export class Player extends Sprite {
    constructor({
        image,
        lives = 3,
        controls = { left: "a", right: "d", jump: "w" },
        gravity = 0.001,
        jumpStrength = 0.018
    }) {
        super({ image, type: "player" });

        this.lives = lives;
        this.controls = controls;

        this.vy = 0;
        this.gravity = gravity;
        this.jumpStrength = jumpStrength;
        this.onGround = false;

        this.keys = {};
        addEventListener("keydown", e => this.keys[e.key] = true);
        addEventListener("keyup", e => this.keys[e.key] = false);
    }

    update(dt) {
        if (this.keys[this.controls.left]) this.rx -= this.speed * dt;
        if (this.keys[this.controls.right]) this.rx += this.speed * dt;

        this.vy += this.gravity * dt;
        this.ry += this.vy * dt;

        if (this.ry >= 0.8) {
            this.ry = 0.8;
            this.vy = 0;
            this.onGround = true;
        }

        super.update(0);
    }

    jump() {
        if (this.onGround) {
            this.vy = -this.jumpStrength;
            this.onGround = false;
        }
    }

    damage(amount = 1) {
        this.lives -= amount;
        console.log("Lives:", this.lives);
    }
}