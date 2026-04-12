import { Sprite } from "../../../lib/sylth/core/sprite.js";
import { KeyPress } from "../../../lib/sylth/core/keypress.js";
import * as math from "./math.js";
import { Nametag } from "./nametag.js";
import { AssetManager } from "../../../lib/random_utils/asset_manager.js";
import { Registry } from "./blocks/blocks.js";
import { context, camera, blockSize, shaders } from "./global.js";
import { config } from "../../../config/config.js";
import { ItemManager } from "./items/item_manager.js";

export class Player extends Sprite {
    constructor(playerIndex, keybinds) {
        super();

        // === Identity ===
        this.playerIndex = playerIndex;
        this.name = playerIndex === 0 ? "GUNTHER___" : "SquiglySamuel";
        this.profile = playerIndex === 0 ? "./assets/textures/item/frog.png" : "./assets/textures/item/goblin.png";
        this.properties.id = `player_${this.playerIndex}`;

        // === Player Data and GUI ===
        this.data = {
            dead: false,
            health: 5,
            maxHealth: 5,
            score: 0,
            distanceRan: 0
        }

        this.gui = {
            healthBarLocation: "top"
        }

        this.nametag = new Nametag(this.name);

        // === Physics ===
        this.gravity = 0.1;
        this.jumpStrength = 5;
        this.isMoving = false;
        this.canMove = true;
        this.onGround = true;

        // === Movement State ===
        this.calculatedBase = 3; 
        this.movement = {
            base: this.calculatedBase,
            backup: this.calculatedBase,
            multipliers: {
                water: .75
            }
        }

        // === Collisions ===
        this.isCollidingWith = null;
        this.isInWater = false;
        this.hasEnteredWater = false;
        this.hasExitedWater = false;

        // === Debug ===
        this.direction = null;

        // === Size ===
        this.offsetY = 0.1;

        this.properties.width = blockSize * (1 - this.offsetY);
        this.properties.height = blockSize * (1 - this.offsetY);

        // --- SPAWN LOGIC ---
        this.properties.x = blockSize * (2 + this.playerIndex * 2);
        const spawnCol = Math.floor(this.properties.x / blockSize);

        this.properties.y = (math.getFirstSolidBlockAtCol(spawnCol) - 3) * blockSize + this.properties.height;
        this.properties.zIndex = 100;

        // === World coordinates ===
        this.coordinatePercision = 0;

        this.worldX = this.properties.x / blockSize;
        this.x = this.worldX;

        this.screenX = this.worldX - (camera?.startX ?? 0);
        this.y = this.properties.y / blockSize;

        this.setProfile();

        // === Input ===
        this.removeOnOffScreen = false;

        this.moveLeft = new KeyPress(keybinds.left);
        this.moveRight = new KeyPress(keybinds.right);
        this.jump = new KeyPress(keybinds.jump);

        this.moveLeft.onpress = () => { this.direction = "West"; };
        this.moveRight.onpress = () => { this.direction = "East"; };
        this.jump.onpress = () => { };

        this.moveLeft.listen();
        this.moveRight.listen();
        this.jump.listen();
    }

    setProfile() {
        if (this.profile) this.setTexture(this.profile);
    }

    getBlock() {
        return window._world.getBlockAt(Math.floor(this.worldX), Math.round(this.y)) ?? {};
    }

    getBlockAtFeet() {
        const blockSize = config.game.blockSize;
        const feetY = Math.floor((this.properties.y + this.properties.height) / blockSize);
        return window._world.getBlockAt(Math.floor(this.worldX), feetY) ?? {};
    }

    draw() {
        if (!this.ctx || !this.imageLoaded) return;

        const blockSize = config.game.blockSize;
        const cameraOffsetX = (camera?.startX ?? 0) * blockSize;

        // Calculate where the player should appear on the monitor
        const screenX = this.properties.x - cameraOffsetX;
        const screenY = this.properties.y; // Usually y doesn't scroll in your current setup

        // Save the context to handle rotation/translation safely
        this.ctx.save();

        const drawW = Math.round(this.properties.width);
        const drawH = Math.round(this.properties.height);

        // Translate to the player's center ON SCREEN
        const centerX = screenX + drawW / 2;
        const centerY = screenY + drawH / 2;

        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.properties.angle);
        this.ctx.translate(-drawW / 2, -drawH / 2);

        // Draw the image!
        this.ctx.drawImage(this.image, 0, 0, drawW, drawH);

        if (!this.data.dead) {
            const heartSize = blockSize / 3; // Slightly smaller hearts look better above the head
            const spacing = heartSize * 0.76; // Spacing between hearts
            const totalWidth = (this.data.maxHealth - 1) * spacing + heartSize;

            // Calculate starting X so hearts are centered over the player
            // '0' is currently the left edge of the player due to the translate logic above
            const startX = (drawW / 2) - (totalWidth / 2);
            const startY = -heartSize * .76;

            for (let i = 0; i < this.data.maxHealth; i++) {
                const img = i < this.data.health ? AssetManager.get("heart") : AssetManager.get("heart_black");

                this.ctx.drawImage(
                    img,
                    startX + (i * spacing),
                    startY,
                    heartSize,
                    heartSize
                );
            }
        }

        this.ctx.restore();
    }

    update() {
        const block = this.getBlock();
        const blockSize = config.game.blockSize;
        const pCenterX = this.properties.x + (this.properties.width / 2);
        const pCenterY = this.properties.y + (this.properties.height / 2);

        const gridX = Math.floor(pCenterX / blockSize);
        const gridY = Math.floor(pCenterY / blockSize);

        // 2. INPUT HANDLING
        if (this.moveLeft.isDown && this.moveRight.isDown) {
            this.properties.motion.vx = 0;
        } else if (this.moveLeft.isDown) {
            this.properties.motion.vx = -this.movement.base;
        } else if (this.moveRight.isDown) {
            this.properties.motion.vx = this.movement.base;
        } else {
            this.properties.motion.vx = 0;
        }

        // 3. PHYSICS CALCULATIONS
        const feetBlock = this.getBlockAtFeet();
        if (feetBlock.name === "water") {
            // If we weren't in water before, we just entered
            if (!this.isInWater) {
                this.hasEnteredWater = true;
                this.hasExitedWater = false;
                this.movement.base = this.movement.backup * this.movement.multipliers.water; // Apply water movement penalty
            } else {
                // We are already swimming; reset the "just entered" trigger
                this.hasEnteredWater = false;
            }
            this.isInWater = true;

        } else {
            // If we were in water before, we just exited
            if (this.isInWater) {
                this.hasExitedWater = true;
                this.hasEnteredWater = false;
                this.movement.base = this.movement.backup; // Remove water movement penalty
            } else {
                // We are already dry; reset the "just exited" trigger
                this.hasExitedWater = false;
            }
            this.isInWater = false;
        }

        if (this.getBlock() === "toxic_grass") {
            this.data.health -= 1;
            if (this.data.health <= 0) {
                alert("You lost!");
                document.dispatchEvent(new CustomEvent("run:end"));
            }
        }

        if (this.isInWater) {
            shaders.classList.add("water-active");
            if (this.hasEnteredWater) {
                AssetManager.get("water_enter").play();
            }
        } else {
            shaders.classList.remove("water-active");
            if (this.hasExitedWater) {
                AssetManager.get("water_enter").play();
            }
        }

        if (this.isInWater) {
            this.onGround = false;

            // Apply Water Drag
            this.properties.motion.vx *= 0.8;

            if (this.jump.isDown) {
                // Check if at surface (block above head is not water)
                const surfaceBlock = this.getBlockAtFeet();
                if (surfaceBlock && surfaceBlock.name !== "water") {
                    // At surface, allow normal jump to climb out
                    this.properties.motion.vy = -this.jumpStrength;
                } else {
                    // Underwater swimming
                    this.properties.motion.vy -= 0.15;

                    // Clamp upward swim speed
                    if (this.properties.motion.vy < -2) this.properties.motion.vy = -2;
                }
            } else {
                // Reduced gravity while underwater
                this.properties.motion.vy += (this.gravity * 0.2);
                this.properties.motion.vy *= 0.8;
            }

            if (Math.abs(this.properties.motion.vx) < 0.01) this.properties.motion.vx = 0;
        } else {
            if (this.jump.isDown && this.onGround) {
                this.properties.motion.vy = -this.jumpStrength;
                this.onGround = false;
            }

            this.properties.motion.vy += this.gravity;
        }

        // 4. MOVEMENT & COLLISION
        const camLeftEdge = (camera?.startX ?? 0) * blockSize;
        const camRightEdge = camLeftEdge + window.innerWidth;

        // Horizontal Movement
        let nextX = this.properties.x + this.properties.motion.vx;
        nextX = Math.max(camLeftEdge, Math.min(nextX, camRightEdge - this.properties.width));
        this.properties.x = nextX;
        this.resolveHorizontalCollision();

        // Vertical Movement
        this.properties.y += this.properties.motion.vy;
        this.resolveVerticalCollision();

        // 5. COORDINATE SYNC
        this.worldX = this.properties.x / blockSize;
        this.x = this.worldX;
        this.y = this.properties.y / blockSize;
        this.screenX = this.properties.x - camLeftEdge;
    }

    resolveHorizontalCollision() {
        const blockSize = config.game.blockSize;
        const left = this.properties.x;
        const right = this.properties.x + this.properties.width;
        const top = this.properties.y;
        const bottom = this.properties.y + this.properties.height;

        const topRow = Math.floor(top / blockSize);
        const bottomRow = Math.floor((bottom - 1) / blockSize);

        // Moving Right
        if (this.properties.motion.vx > 0) {
            // Use absolute world coordinate directly
            const worldCol = Math.floor(right / blockSize);

            for (let row = topRow; row <= bottomRow; row++) {
                const blockID = math.getBlockAtWorld(row, worldCol);
                if (blockID > 0 && blockID !== 9) {
                    this.properties.x = worldCol * blockSize - this.properties.width;
                    this.properties.motion.vx = 0;
                    break;
                }
            }
        }

        // Moving Left
        if (this.properties.motion.vx < 0) {
            // Use absolute world coordinate directly
            const worldCol = Math.floor(left / blockSize);

            for (let row = topRow; row <= bottomRow; row++) {
                const blockID = math.getBlockAtWorld(row, worldCol);
                if (math.getBlockAtWorld(row, worldCol) > 0) {
                    this.properties.x = (worldCol + 1) * blockSize;
                    this.properties.motion.vx = 0;
                    break;
                }
            }
        }
    }

    resolveVerticalCollision() {
        const blockSize = config.game.blockSize;

        const left = this.properties.x;
        const right = this.properties.x + this.properties.width;
        const top = this.properties.y;
        const bottom = this.properties.y + this.properties.height;

        const inset = 4;

        const leftCol = Math.floor((left + inset) / blockSize);
        const rightCol = Math.floor(
            (right - inset - 1) / blockSize
        );

        // Falling
        if (this.properties.motion.vy > 0) {
            const row = Math.floor((bottom - 1) / blockSize);

            for (let col = leftCol; col <= rightCol; col++) {
                const blockID = math.getBlockAtWorld(row, col);
                if (blockID > 0 && blockID !== 9) {
                    this.properties.y =
                        row * blockSize - this.properties.height;
                    this.properties.motion.vy = 0;
                    this.onGround = true;
                    return;
                }
            }

            this.onGround = false;
        }

        // Jumping Up
        if (this.properties.motion.vy < 0) {
            const row = Math.floor(top / blockSize);

            for (let col = leftCol; col <= rightCol; col++) {
                const blockID = math.getBlockAtWorld(row, col)
                if (blockID > 0 && blockID !== 9) {
                    this.properties.y =
                        (row + 1) * blockSize;
                    this.properties.motion.vy = 0;
                    return;
                }
            }
        }
    }
}