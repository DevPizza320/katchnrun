import { Sprite } from "../../sylth/core/sprite.js";
import { KeyPress } from "../../sylth/core/keypress.js";

export class Player extends Sprite {
    constructor(keys = {}) {
        super();

        // Player-specific data
        this.profile = {
            texture: "./assets/textures/gui/placeholder.png",
            name: "Player"
        };

        // Apply default texture
        this.setTexture(this.profile.texture);
        this.properties.fallbackFill = "yellow";
        this.properties.id = "player";

        // Movement properties
        this.gravity = 0.5;
        this.jumpStrength = 12;
        this.groundY = 0;
        this.onGround = true;

        // ---- KEY CONFIGURATION ----
        const {
            left = "ArrowLeft",
            right = "ArrowRight",
            jump = " "
        } = keys;

        this.keyLeft = new KeyPress(left);
        this.keyRight = new KeyPress(right);
        this.keyJump = new KeyPress(jump);

        // Left movement
        this.keyLeft.onpress = () => {
            this.properties.motion.vx = -this.properties.speed;
        };
        this.keyLeft.onlift = () => {
            if (!this.keyRight.isDown) {
                this.properties.motion.vx = 0;
            }
        };

        // Right movement
        this.keyRight.onpress = () => {
            this.properties.motion.vx = this.properties.speed;
        };
        this.keyRight.onlift = () => {
            if (!this.keyLeft.isDown) {
                this.properties.motion.vx = 0;
            }
        };

        // Jump
        this.keyJump.onpress = () => {
            if (this.onGround) {
                this.properties.motion.vy = -this.jumpStrength;
                this.onGround = false;
            }
        };

        // Start listening
        this.keyLeft.listen();
        this.keyRight.listen();
        this.keyJump.listen();
    }

    /**
     * Updates the player each frame, handling gravity and ground collision
     */
    update() {
        // Gravity
        this.properties.motion.vy += this.gravity;

        super.update();

        const canvas = this.ctx.canvas;

        // Horizontal jail (bounce)
        if (this.properties.x < 0) {
            this.properties.x = 0;
            this.properties.motion.vx = 0;
        }

        if (this.properties.x + this.properties.width > canvas.width) {
            this.properties.x = canvas.width - this.properties.width;
            this.properties.motion.vx = 0;
        }

        // Ground
        if (this.properties.y + this.properties.height >= canvas.height) {
            this.properties.y = canvas.height - this.properties.height;
            this.properties.motion.vy = 0;
            this.onGround = true;
        }
    }

    setGround(y) {
        this.groundY = y;
    }
}