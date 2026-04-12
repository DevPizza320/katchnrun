import { Feature } from "./feature_class.js";

export class JungleTree extends Feature {
    constructor() {
        super();
        this.spawnChance = 0.15;
        this.canSpawnOn = [1, 7];
        this.minSpacing = 5;
        this.allowFloating = true;

        this.variants = {
            "generic": {
                anchorX: 2,
                data: [
                    [0, 5, 5, 5, 0], // Row 0 (Top)
                    [5, 5, 5, 5, 5], // Row 1
                    [0, 0, 4, 0, 0], // Row 2
                    [0, 0, 4, 0, 0], // Row 3
                    [0, 0, 4, 0, 0], // Row 4
                    [0, 0, 4, 0, 0], // Row 5
                    [0, 0, 4, 0, 0]  // Row 6 (Bottom)
                ]
            }
        };
    }

    isValidFloor(groundBlock) {
        // A tree can sit on soil, wood (4), or leaves (5)
        return this.canSpawnOn.includes(groundBlock) || [4, 5].includes(groundBlock);
    }

    generate(startX, startY, template) {
        const selection = this.variants["generic"];
        const data = template || selection.data;
        const anchorX = selection.anchorX;
        const anchorY = data.length - 1;

        // CRITICAL FIX: Loop BACKWARDS (from bottom row to top row)
        // This ensures the trunk is placed before the leaves above it
        for (let row = data.length - 1; row >= 0; row--) {
            for (let col = 0; col < data[row].length; col++) {
                const blockID = data[row][col];
                if (blockID === 0) continue;

                const worldCol = startX + (col - anchorX);
                // Position relative to the surface
                const worldRow = (startY - 1) - (anchorY - row);

                this.setBlockInWorld(worldRow, worldCol, blockID);
            }
        }
    }
}

export class Grass extends Feature {
    constructor() {
        super();
        this.spawnChance = 0.4;
        this.canSpawnOn = [1];
        this.minSpacing = 3;
        this.template = [8];
    }

    generate(startX, startY) {
        const patchSize = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < patchSize; i++) {
            const offsetX = i - Math.floor(patchSize / 2);
            const targetX = startX + offsetX;

            const targetChunkIndex = Math.floor(targetX / 16);
            const targetChunk = window._world?.chunks?.[targetChunkIndex];

            if (targetChunk && targetChunk.heightMap) {
                const localX = ((targetX % 16) + 16) % 16;
                const actualSurfaceY = targetChunk.chunkHeight - targetChunk.heightMap[localX];
                this.setBlockInWorld(actualSurfaceY - 1, targetX, 8);
            }
        }
    }
}

export class Bamboo extends Feature {
    constructor() {
        super();
        this.maxAge = 5;
        this.canSpawnOn = [7];
        this.spawnChance = 0.5;
        this.minSpacing = 4;
        this.template = [10];
        this.allowFloating = false;
    }

    // Allows bamboo to grow on soil or other bamboo pieces
    isValidFloor(groundBlock) {
        return this.canSpawnOn.includes(groundBlock) || [10, 11].includes(groundBlock);
    }

    generate(startX, startY) {
        const patchSize = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < patchSize; i++) {
            const offsetX = i - Math.floor(patchSize / 2);
            const targetX = startX + offsetX;

            const targetChunkIndex = Math.floor(targetX / 16);
            const targetChunk = window._world?.chunks?.[targetChunkIndex];

            if (targetChunk && targetChunk.heightMap) {
                const localX = ((targetX % 16) + 16) % 16;
                const actualSurfaceY = targetChunk.chunkHeight - targetChunk.heightMap[localX];

                let randomHeight = Math.ceil(Math.random() * this.maxAge) + 1;
                for (let age = 0; age < randomHeight; age++) {
                    let blockID = (age === randomHeight - 1) ? 11 : 10;
                    this.setBlockInWorld(actualSurfaceY - 1 - age, targetX, blockID);
                }
            }
        }
    }
}

export class ToxicGrass extends Feature {
    constructor() {
        super();
        this.spawnChance = 0.3;
        this.canSpawnOn = [1];
        this.minSpacing = 3;
        this.template = [8];
    }

    generate(startX, startY) {
        const patchSize = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < patchSize; i++) {
            const offsetX = i - Math.floor(patchSize / 2);
            const targetX = startX + offsetX;

            const targetChunkIndex = Math.floor(targetX / 16);
            const targetChunk = window._world?.chunks?.[targetChunkIndex];

            if (targetChunk && targetChunk.heightMap) {
                const localX = ((targetX % 16) + 16) % 16;
                const actualSurfaceY = targetChunk.chunkHeight - targetChunk.heightMap[localX];
                this.setBlockInWorld(actualSurfaceY - 1, targetX, 8);
            }
        }
    }
}