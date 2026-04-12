export class Sprite {
    constructor() {
        this.properties = {
            id: `Sprite_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            texture: null,
            fallbackFill: "pink",
            x: 100,
            y: 100,
            scale: null,
            width: 100,
            height: 100,
            motion: { vx: 0, vy: 0 },
            angle: 0,       // Heading in radians
            speed: 2,       // Base movement speed
            direction: 1,    // 1 for forward, -1 for backward
            canCollideWith: [], // IDs of entities this can collide with
            onCollide: null
        };

        this.onOffScreen = null;
        this.removeOnOffScreen = true;
        this.edgeCheck = true;
        this._offscreenTriggered = false;

        this.ctx = null;
        this.imageLoaded = false;
        if (this.properties.texture) {
            this.image = new Image();
            this.image.src = this.properties.texture;
            this.image.onload = () => {
                this.imageLoaded = true;
            };
        }

        // animation stuff: this may cause you testicular cancer
        this.animation = {};
        this.animation.loop = false;

        this.circle = {
            enabled: false,
            color: 'rgba(255,255,255,0.5)',
            radius: this.properties.width,
            gradient: false,
            pulse: false
        };
    }

    setTexture(path) {
        this.properties.texture = path;
        this.imageLoaded = false;

        this.image = new Image();
        this.image.src = path;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.image.onerror = () => {
            console.error("Failed to load image:", path);
        };
    }

    /**
     * Updates the heading angle and recalculates velocity
     * @param {number} angle - Angle in radians
     * @param {number} direction - 1 for forward, -1 for backward
     */
    setHeading(angle, direction = 1) {
        this.properties.angle = angle;
        this.properties.direction = direction;

        // Calculate velocity components based on angle and direction
        // vx = cos(theta) * speed * direction
        // vy = sin(theta) * speed * direction
        this.properties.motion.vx = Math.cos(angle) * this.properties.speed * direction;
        this.properties.motion.vy = Math.sin(angle) * this.properties.speed * direction;
    }

    move(distance, time, speed) {
        // s = d/t
        let d = distance;
        let t = time;
        let s = speed;

        if (!d) {
            d = s * t;
        } else if (!t) {
            t = s / d;
        } else if (!s) {
            s = d / t;
        }

        // Calculate the velocity based on the resolved values
        const vx = Math.cos(this.properties.angle) * (d / t) * this.properties.direction;
        const vy = Math.sin(this.properties.angle) * (d / t) * this.properties.direction;

        // Apply the movement to the sprite's position
        this.properties.x += vx;
        this.properties.y += vy;
    }

    moveTo(x, y) {
        this.properties.x = x;
        this.properties.y = y;
        this.properties.motion.vx = 0;
        this.properties.motion.vy = 0;
    }

    /**
     * Applies the current velocity to the position
     */
    updatePosition() {
        this.properties.x += this.properties.motion.vx;
        this.properties.y += this.properties.motion.vy;
    }

    /**
     * Called each frame to update the sprite
     */
    update() {
        this.updatePosition();
    }

    /**
     * Sets up a circle to be drawn behind the sprite
     * @param {Object} options - Configuration options
     * @param {string} options.color - Color of the circle (hex or rgb)
     * @param {number} options.opacity - Opacity (0-1)
     * @param {number} options.radius - Radius of the circle (default: sprite width)
     * @param {boolean} options.gradient - Whether to use radial gradient
     * @param {boolean} options.pulse - Whether to animate with pulse effect
     */
    enableCircle(options = {}) {
        this.circle.enabled = true;
        this.circle.color = options.color || 'rgba(255,255,255,0.5)';
        this.circle.opacity = options.opacity !== undefined ? options.opacity : 1;
        this.circle.radius = options.radius || this.properties.width / 2;
        this.circle.gradient = options.gradient || false;
        this.circle.pulse = options.pulse || false;

        // Apply opacity to color
        this.applyOpacityToColor();

        if (this.circle.pulse) {
            this.startPulse();
        }
    }

    /**
     * Applies opacity to the circle color
     */
    applyOpacityToColor() {
        const color = this.circle.color;
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            this.circle.color = `rgba(${r},${g},${b},${this.circle.opacity})`;
        } else if (color.startsWith('rgb(') && !color.includes('rgba')) {
            this.circle.color = color.replace('rgb', 'rgba').replace(')', `,${this.circle.opacity})`);
        } else if (color.startsWith('rgba')) {
            // Already rgba, update alpha
            const parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
            if (parts) {
                this.circle.color = `rgba(${parts[1]},${parts[2]},${parts[3]},${this.circle.opacity})`;
            }
        }
    }

    /**
     * Starts the pulse animation for the circle
     */
    startPulse() {
        const originalRadius = this.circle.radius;
        const maxRadius = originalRadius * 1.2;
        const duration = 5000; // 1 second cycle
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = (elapsed % duration) / duration;
            const scale = 1 + 0.2 * Math.sin(progress * 2 * Math.PI);
            this.circle.radius = originalRadius * scale;
            requestAnimationFrame(animate);
        };

        animate();
    }

    draw() {
        if (!this.ctx) {
            throw new Error(`Failed to draw entity ${this.properties.id}: No context was found`);
        }

        // Save the current canvas state
        this.ctx.save();

        // Draw circle behind the sprite if enabled
        if (this.circle.enabled) {
            this.drawCircle();
        }

        const drawX = Math.round(this.properties.x);
        const drawY = Math.round(this.properties.y);
        const drawW = Math.round(this.properties.width);
        const drawH = Math.round(this.properties.height);

        // Translate to the sprite's center, apply rotation, then translate back
        const centerX = drawX + drawW / 2;
        const centerY = drawY + drawH / 2;

        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.properties.angle);
        this.ctx.translate(-drawW / 2, -drawH / 2);

        if (!this.properties.texture || !this.imageLoaded) {
            this.ctx.fillStyle = this.properties.fallbackFill;
            this.ctx.fillRect(0, 0, drawW, drawH);
        } else {
            this.ctx.drawImage(this.image, 0, 0, drawW, drawH);
        }

        // Restore the canvas state
        this.ctx.restore();
    }

    /**
     * Draws the circle behind the sprite
     */
    drawCircle() {
        const centerX = this.properties.x + this.properties.width / 2;
        const centerY = this.properties.y + this.properties.height / 2;

        if (this.circle.gradient) {
            const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.circle.radius);
            gradient.addColorStop(0, this.circle.color);
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            this.ctx.fillStyle = gradient;
        } else {
            this.ctx.fillStyle = this.circle.color;
        }

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.circle.radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    animate(stages) {
        // Handle each animation stage sequentially
        let totalDelay = 0;

        stages.forEach(stage => {
            const { action, duration, iterations = 1, ...params } = stage;

            setTimeout(() => {
                for (let i = 0; i < iterations; i++) {
                    switch (action) {
                        case "translate":
                            // { action: "translate", duration: 1000, amount: 50 }
                            this.animateTranslate(params.amount, duration);
                            break;
                        case "rotate":
                            // { action: "rotate", duration: 1000, angle: Math.PI / 2 }
                            this.animateRotate(params.angle, duration);
                            break;
                        case "changeImage":
                            // { action: "changeImage", duration: 500, texture: "path/to/image.png" }
                            this.animateChangeImage(params.texture, duration);
                            break;
                        default:
                            console.warn(`Unknown animation action: ${action}`);
                    }
                }
            }, totalDelay);

            totalDelay += duration * iterations;
        });
    }

    /**
     * Animates sprite translation (movement)
     * @param {number} amount - Distance to move
     * @param {number} duration - Duration in milliseconds
     */
    animateTranslate(amount, duration) {
        const startTime = Date.now();
        const startX = this.properties.x;
        const startY = this.properties.y;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Move sprite based on current angle and direction
            const vx = Math.cos(this.properties.angle) * amount * progress * this.properties.direction;
            const vy = Math.sin(this.properties.angle) * amount * progress * this.properties.direction;

            this.properties.x = startX + vx;
            this.properties.y = startY + vy;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Animates sprite rotation
     * @param {number} angle - Target angle in radians
     * @param {number} duration - Duration in milliseconds
     */
    animateRotate(angle, duration) {
        const startTime = Date.now();
        const startAngle = this.properties.angle;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            this.properties.angle = startAngle + (angle * progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Animates sprite image change
     * @param {string} texture - Path to the new image texture
     * @param {number} duration - Duration in milliseconds
     */
    animateChangeImage(texture, duration) {
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress >= 1) {
                // Apply the new texture after the duration
                this.properties.texture = texture;
                if (texture) {
                    this.image = new Image();
                    this.image.src = texture;
                }
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }
}