import { Registry } from "./blocks/blocks.js";

export class World {
    constructor() {
        window.worldSeed = 271000 + 9999999 + 6942031;
        this.seed = window.worldSeed;

        this.chunks = {}; 
        this.worldWidth = Infinity; 
        this.worldHeight = 10;
        
        // Global state for generation
        this.lastFeatureX = -999; 

        // Environment
        this.worldTime = 0;
        this.timeRate = 1; // How fast time moves
        
        this.terrainAmp = 1.5;
        this.biomes = [];

        // Helper for entities to find out where they are
        Object.defineProperty(this, "width", {
            get: () => (window.blocksX || 100000) * (window.blockSize || 1),
        });

        // Terrain Generation
    }

    /**
     * The most important "Minecrafty" function: 
     * Converts global block coordinates to an actual Block object.
     */
    getBlockAt(globalX, globalY) {
        const chunkWidth = 16;
        const chunkIndex = Math.floor(globalX / chunkWidth);
        const localX = Math.floor(globalX % chunkWidth);
        const localY = Math.floor(globalY);

        const chunk = this.chunks[chunkIndex];
        if (!chunk || !chunk.blocks) return null;

        // Ensure Y is within world bounds
        if (localY < 0 || localY >= chunk.chunkHeight) return null;

        const blockID = chunk.blocks[(localY * chunk.chunkWidth) + localX];
        return Registry.get(blockID); 
    }

    update() {
        // Handle time cycle
        this.worldTime = (this.worldTime + this.timeRate) % 24000;
    }
}