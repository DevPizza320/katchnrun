import { KeyPress } from "../../../../lib/sylth/core/keypress.js";
import { pool, blockSize, blocksX, _world } from "./global.js";
import { Timer } from "../../../../lib/sylth/time/timer.js";
import { Chunk } from "./chunk.js";
import { ClientTick } from "./tick.js"; // camera needs to update every frame

export class Camera {
    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.vx = 0;
        this.vy = 0;
        this.speed = 0.1;

        this.chunkWidth = 16; // blocks per chunk
        this.chunkPixelWidth = this.chunkWidth * blockSize;

        this.currentChunkIndex = 0;
        this.activeChunks = [];

        // Number of chunks that fit in the viewport horizontally
        this.visibleChunkCount = Math.ceil(blocksX / this.chunkWidth);
        // How many chunks to load on either side of the player in addition to visible area
        this.preloadBuffer = 0;

        // Register camera update with the main tick loop so sliding works smoothly
        ClientTick.addCall("camera_update", this.update.bind(this));
    }

    startSliding() {
        // when sliding begins we give the camera a horizontal velocity
        this.vx = this.speed;
    }

    stopSliding() {
        // stop moving the camera
        this.vx = 0;
    }

    update() {
        if (!_world) return;

        const bSize = blockSize;
        let targetStartX = 0;
        let focusX = 0;

        if (!window.players || window.players.length === 0) {
            // Preview-only mode: slide the world slowly without players.
            this.startX = Math.max(0, this.startX + this.vx);
            focusX = this.startX * bSize;
            targetStartX = this.startX;
        } else if (window.players.length === 1) {
            // --- SINGLE PLAYER LOGIC ---
            const p = window.players[0];
            focusX = p.properties.x;

            // Center the camera on the single player
            targetStartX = (focusX - (window.innerWidth / 2)) / blockSize;

        } else if (window.players.length >= 2) {
            // --- MULTI-PLAYER LOGIC ---
            const p0 = window.players[0];
            const p1 = window.players[1];

            // Midpoint between players
            focusX = (p0.properties.x + p1.properties.x) / 2;
            targetStartX = (focusX - (window.innerWidth / 2)) / blockSize;

            // "No Player Left Behind" logic for 2 players
            const leftmostPlayerX = Math.min(p0.properties.x, p1.properties.x) / blockSize;
            const leftEdgeBuffer = 2;

            if (targetStartX > leftmostPlayerX - leftEdgeBuffer) {
                targetStartX = leftmostPlayerX - leftEdgeBuffer;
            }
        }

        // 1. Prevent camera from moving backwards
        targetStartX = Math.max(this.startX, targetStartX);

        // 2. SMOOTHING (Lerp)
        const lerpFactor = 0.05;
        this.startX += (targetStartX - this.startX) * lerpFactor;

        // 3. Chunk Management
        // Calculate current chunk based on what the camera is focusing on
        const currentChunk = Math.floor(focusX / (this.chunkWidth * blockSize));
        this.currentChunkIndex = currentChunk;

        const minIndex = Math.max(0, currentChunk - 1);
        const maxIndex = currentChunk + this.visibleChunkCount + 1;

        for (let i = minIndex; i <= maxIndex; i++) {
            this.loadChunk(i);
        }
        this.cleanupChunks(minIndex, maxIndex);
    }

    loadChunk(index) {
        // Reference the actual world storage
        const worldChunks = _world.chunks;

        // 1. Ensure this chunk and its immediate neighbors have TERRAIN
        for (let i = index - 1; i <= index + 1; i++) {
            if (!worldChunks[i]) {
                worldChunks[i] = new Chunk(i, 12345, 1.0, "jungle");
                worldChunks[i].generateHeightMap();
                worldChunks[i].generateTerrain();
            }
        }

        // 2. Decorate the target
        const target = worldChunks[index];
        if (!target.isDecorated) {
            target.generateDecorations();
        }

        // 3. Render to pool
        if (!target.isInPool) {
            pool.addEntity(target);
            target.isInPool = true;
            // Keep track of it in activeChunks for cleanup logic
            this.activeChunks.push(target);
        }
    }

    cleanupChunks() {
        // Default behavior: if no args passed, keep a small window around currentChunkIndex
        let minAllowed, maxAllowed;
        if (arguments.length === 2) {
            minAllowed = arguments[0];
            maxAllowed = arguments[1];
        } else {
            minAllowed = Math.max(0, this.currentChunkIndex - 2);
            maxAllowed = this.currentChunkIndex + this.visibleChunkCount + 2;
        }

        this.activeChunks = this.activeChunks.filter(chunk => {
            // Inside cleanupChunks in camera.js
            if (chunk.chunkIndex < minAllowed || chunk.chunkIndex > maxAllowed) {
                pool.removeEntity(chunk); // REMOVE FROM POOL FIRST
                chunk.delete();
                _world.chunks[chunk.chunkIndex] = undefined;
                return false;
            }
            return true;
        });
    }
}