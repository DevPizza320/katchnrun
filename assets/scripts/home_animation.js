/* ──────────────────────────────────────────────
   Canvas Setup
────────────────────────────────────────────── */
const canvas = document.createElement("canvas");
canvas.classList.add("home_animation");
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.pointerEvents = "none";
canvas.style.zIndex = "0";
document.body.appendChild(canvas);
canvas.style.display = "none";
const ctx = canvas.getContext("2d");

document.addEventListener("mainShown", () => { canvas.style.display = "flex" });
// Update canvas size on window resize
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ──────────────────────────────────────────────
   Floating Particles
────────────────────────────────────────────── */
const particles = [];
const PARTICLE_COUNT = 80;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * (canvas.width * 0.0002);
        this.vy = (Math.random() - 0.5) * (canvas.height * 0.0002);
        this.radius = Math.random() * (canvas.width * 0.003) + (canvas.width * 0.001);
        this.alpha = Math.random() * 0.5 + 0.2;
        this.alphaSpeed = (Math.random() - 0.5) * 0.002;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Flicker alpha
        this.alpha += this.alphaSpeed;
        if (this.alpha <= 0.1 || this.alpha >= 0.8) this.alphaSpeed *= -1;
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = "rgba(255, 255, 153, 1)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
}

/* ──────────────────────────────────────────────
   Falling Objects
────────────────────────────────────────────── */
const fallingObjects = [];
const objectImages = {
    leaf: new Image(),
    banana: new Image(),
    coconut: new Image()
};

objectImages.leaf.src = "./assets/textures/entity/leaf.png";
objectImages.banana.src = "./assets/textures/entity/banana.png";
objectImages.coconut.src = "./assets/textures/entity/coconut.png";

class FallingObject {
    constructor(type) {
        this.type = type;
        this.x = Math.random() * canvas.width;
        this.y = -canvas.height * 0.1;
        this.width = canvas.width * (0.02 + Math.random() * 0.03);
        this.height = this.width;
        this.vy = canvas.height * (0.0001 + Math.random() * 0.00005);
        this.rotation = Math.random() * Math.PI;
        this.rotationSpeed = (Math.random() - 0.5) * 0.003;
        this.alpha = 0.7;
        this.alphaSpeed = (Math.random() - 0.5) * 0.004;
        this.image = objectImages[type];
    }

    update() {
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        // Flicker alpha
        this.alpha += this.alphaSpeed;
        if (this.alpha <= 0.4 || this.alpha >= 1) this.alphaSpeed *= -1;
    }

    draw() {
        if (!this.image.complete) return;

        // Don't draw if partially off-screen on the sides
        const halfWidth = this.width / 2;
        if (this.x - halfWidth < 0 || this.x + halfWidth > canvas.width) {
            return;
        }

        ctx.globalAlpha = this.alpha;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(
            this.image,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        ctx.restore();
    }

    isOffScreen() {
        return this.y > canvas.height;
    }
}

/* ──────────────────────────────────────────────
   Spawn Falling Objects
────────────────────────────────────────────── */
function spawnObject(type) {
    fallingObjects.push(new FallingObject(type));
}

function scheduleSpawn(type, ms) {
    setInterval(() => {
        try {
            if (typeof document === 'undefined' || !document.hidden) spawnObject(type);
        } catch (e) {
            // fallback: spawn if visibility API not available or error
            try { spawnObject(type); } catch (err) { /* ignore */ }
        }
    }, ms);
}
scheduleSpawn("leaf", 10000);
scheduleSpawn("banana", 10000);
scheduleSpawn("coconut", 10000);

/* ──────────────────────────────────────────────
   Render Loop
────────────────────────────────────────────── */
function animate() {
    // Clear canvas
    ctx.globalAlpha = 1;
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Update and draw falling objects
    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        const obj = fallingObjects[i];
        obj.update();
        obj.draw();

        if (obj.isOffScreen()) {
            fallingObjects.splice(i, 1);
        }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
}

animate()