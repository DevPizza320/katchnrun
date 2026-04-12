import { config } from "../../../../config/config.js";
import { Items } from "./items.js";

export class ItemManager {
    static list = [];
    static gravity = 0.15;

    static spawnTimer = 0;
    static spawnRate = 90; // Approx every 1.5 seconds at 60fps

    static update() {
        // 1. Spawner Logic
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnRate) {
            const keys = Object.keys(Items);
            const randomKey = keys[Math.floor(Math.random() * keys.length)];

            // Use the camera startX to find where the screen currently is in the world
            const blockSize = config.game.blockSize;
            const cameraOffset = (window.camera?.startX ?? 0) * blockSize;
            const p = window.players?.[0];

            let randomX;
            if (p) {
                // Spawn within 200 pixels of the player
                const spread = 200;
                randomX = p.properties.x + (Math.random() * spread * 2 - spread);
                // Ensure it stays within the visible screen
                randomX = Math.max(cameraOffset, Math.min(randomX, cameraOffset + window.innerWidth - 64));
            } else {
                randomX = cameraOffset + (Math.random() * (window.innerWidth - 64));
            }

            this.spawn(randomKey, randomX, -50);
            this.spawnTimer = 0;
        }

        // 2. Physics & Memory Cleanup
        for (let i = this.list.length - 1; i >= 0; i--) {
            const item = this.list[i];

            item.vy += this.gravity;
            item.px += item.vx;
            item.py += item.vy;

            // Cleanup: Remove if fallen way below the screen
            if (item.py > window.innerHeight + 100) {
                this.list.splice(i, 1);
            }
        }
    }

    static draw(ctx) {
        const scale = 2;
        const blockSize = config.game.blockSize;
        const cameraOffsetX = (window.camera?.startX ?? 0) * blockSize;

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        for (const item of this.list) {
            // Calculate screen position: World Position - Camera Offset
            const screenX = item.px - cameraOffsetX;
            const screenY = item.py;

            if (item.sprite) {
                ctx.drawImage(item.sprite, screenX, screenY, 16 * scale, 16 * scale);
            } else {
                ctx.fillStyle = item.type === "hostile" ? "red" : "green";
                ctx.fillRect(screenX, screenY, 16 * scale, 16 * scale);
            }
        }
        ctx.restore();
    }

    static spawn(itemKey, x, y) {
        const template = Items[itemKey];
        if (!template) return;
        // Spread syntax to create a unique instance
        this.list.push({ ...template, px: x, py: y });
    }
}