import { Registry } from "./blocks/blocks.js"; // Import Registry instead of just instances
import { context, blockSize } from "./global.js";
import { SeededRandom, Noise1D } from "./utils/math.js";
import { JungleTree, Grass, Bamboo } from "./features/features.js";
import { BiomeGen } from "./biomes/biome_gen.js";

const activeFeatures = [new JungleTree(), new Grass(), new Bamboo()];

export class Chunk {
    constructor(chunkIndex = 0, seed = window.worldSeed ?? 12345, amp = 1.0, biome) {
        this.chunkHeight = 10;
        this.chunkWidth = 16;
        this.chunkIndex = chunkIndex;
        this.seed = seed;
        this.amp = amp;
        this.biome = biome;

        this.noiseGen = new Noise1D(seed);

        this.heightMap = [];
        this.blocks = null;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;
        this.ctx.imageSmoothingEnabled = false;

        this.renderedOnce = false;
        this.isTerrainGenerated = false;
        this.isDecorated = false;

        this.properties = {
            id: `chunk:${this.chunkIndex}`,
            width: this.chunkWidth * blockSize,
            height: this.chunkHeight * blockSize,
            x: this.chunkIndex * (this.chunkWidth * blockSize),
            y: 0,
            zIndex: 0
        };

        this.isInPool = false;
    }

    generateHeightMap() {
        this.heightMap = [];
        const globalStart = this.chunkIndex * this.chunkWidth;
        const blendRange = 4; // How many neighbors to check for smoothing

        for (let x = 0; x < this.chunkWidth; x++) {
            const globalX = globalStart + x;

            let totalHeight = 0;
            let totalWeight = 0;

            // Blending Loop: Look at neighbors to calculate a smooth average height
            for (let offset = -blendRange; offset <= blendRange; offset++) {
                const sampleX = globalX + offset;
                const biome = BiomeGen.getBiomeAt(sampleX);

                // Get noise using the biome's specific scale
                const noiseValue = this.noiseGen.get(sampleX * biome.scale);

                // Calculate what height WOULD be in this biome
                const sampleHeight = biome.heightOffset + (noiseValue * biome.amplitude);

                // Weight based on distance (closer = stronger)
                const weight = 1 - Math.abs(offset) / (blendRange + 1);

                totalHeight += sampleHeight * weight;
                totalWeight += weight;
            }

            const finalHeight = Math.floor(totalHeight / totalWeight);
            this.heightMap.push(Math.max(1, finalHeight));
        }
    }


    generateTerrain() {
        if (this.isTerrainGenerated) return;
        const size = this.chunkWidth * this.chunkHeight;
        this.blocks = new Uint8Array(size);
        const globalStart = this.chunkIndex * this.chunkWidth;

        const seaLevel = 7;

        for (let x = 0; x < this.chunkWidth; x++) {
            const globalX = globalStart + x;
            const biome = BiomeGen.getBiomeAt(globalX);
            // Ensure surfaceY is consistent with heightMap
            const surfaceY = this.chunkHeight - this.heightMap[x];

            for (let y = 0; y < this.chunkHeight; y++) {
                const index = (y * this.chunkWidth) + x;

                if (y > surfaceY) {
                    // 1. UNDERGROUND
                    this.blocks[index] = biome.subBlock;
                }
                else if (y === surfaceY) {
                    // 2. THE GROUND SURFACE
                    // FIX: Only override if it's actually "submerged" or near water, 
                    // otherwise use the biome's specific surface block.
                    if (y > seaLevel) {
                        this.blocks[index] = 2; // Shoreline/Beach
                    } else {
                        this.blocks[index] = biome.surfaceBlock; // Use the 7 for Bamboo Jungle
                    }
                }
                else {
                    // 3. ABOVE GROUND
                    if (y >= seaLevel) {
                        this.blocks[index] = 9; // Water
                    } else {
                        this.blocks[index] = 0; // Sky
                    }
                }
            }
        }
        this.isTerrainGenerated = true;
    }


    generateDecorations() {
        if (this.isDecorated || !this.isTerrainGenerated) return;

        for (let x = 0; x < this.chunkWidth; x++) {
            const globalX = (this.chunkIndex * this.chunkWidth) + x;
            const surfaceY = this.chunkHeight - this.heightMap[x];

            // Safety: Don't process if the surface is outside chunk bounds
            if (surfaceY < 0 || surfaceY >= this.chunkHeight) continue;

            const checkIndex = (surfaceY * this.chunkWidth) + x;
            const groundBlock = this.blocks[checkIndex];

            activeFeatures.forEach(feature => {
                const rng = new SeededRandom(this.seed + globalX);
                const rngValue = rng.next();

                // 1. Get Template Safely
                let variantTemplate = [];
                if (feature.getVariant) {
                    variantTemplate = feature.getVariant(rngValue);
                } else if (feature.variants && feature.variants["generic"]) {
                    variantTemplate = feature.variants["generic"].data;
                } else {
                    variantTemplate = feature.template || [0];
                }

                // 2. Submerged Check (with boundary safety)
                let isSubmerged = false;
                if (surfaceY > 0) {
                    const aboveIndex = ((surfaceY - 1) * this.chunkWidth) + x;
                    isSubmerged = this.blocks[aboveIndex] === 9;
                }

                // 3. Spacing Check (ensure window._world exists)
                if (!window._world) window._world = {};
                const minSpace = feature.minSpacing || 3;
                const lastX = window._world.lastFeatureX ?? -999;
                const isFarEnough = (globalX - lastX) >= minSpace;

                // 4. Can Spawn Check
                const canSpawnOnGround = feature.canSpawnOn.includes(groundBlock);
                const hasRoomAbove = surfaceY >= variantTemplate.length;

                if (canSpawnOnGround && hasRoomAbove && !isSubmerged && isFarEnough) {
                    if (rngValue < feature.spawnChance) {
                        // Place the feature!
                        feature.generate(globalX, surfaceY, variantTemplate);
                        window._world.lastFeatureX = globalX;

                        // Force a re-render of the chunk since we added blocks
                        this.renderedOnce = false;
                    }
                }
            });
        }
        this.isDecorated = true;
    }

    update() {
        const bSize = blockSize;
        this.properties.width = this.chunkWidth * bSize;
        this.properties.height = this.chunkHeight * bSize;
        this.properties.x = this.chunkIndex * (this.chunkWidth * bSize);
    }

    draw() {
        const bSize = Math.floor(blockSize);
        const cWidth = this.chunkWidth * bSize;
        const cHeight = this.chunkHeight * bSize;
        const dpr = window.devicePixelRatio || 1;
        this.dpr = dpr;

        // 1. Ensure the internal buffer is the correct physical size for DPR
        const bufferWidth = Math.floor(cWidth * dpr);
        const bufferHeight = Math.floor(cHeight * dpr);

        if (this.canvas.width !== bufferWidth || this.canvas.height !== bufferHeight) {
            this.canvas.width = bufferWidth;
            this.canvas.height = bufferHeight;
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.imageSmoothingEnabled = false;
            this.renderedOnce = false;
        }

        // 2. Calculate X with the camera offset
        const camX = window.camera?.startX ?? 0;
        const screenX = (this.properties.x - (camX * bSize));

        // 3. FIX: Anchor to the top (0) instead of calculating from canvas.height
        // Since blocksY = 10 and blockSize = height/10, screenY should always be 0.
        const screenY = 1;

        // Frustum culling: Only draw if on screen
        if (screenX + cWidth > 0 && screenX < context.canvas.width) {
            if (!this.renderedOnce) {
                this.drawToBuffer();
            }

            context.imageSmoothingEnabled = false;
            context.drawImage(
                this.canvas,
                screenX,
                screenY,
                cWidth,
                cHeight
            );
        }
    }

    drawToBuffer() {
        const dpr = this.dpr || window.devicePixelRatio || 1;
        const bSize = Math.floor(blockSize) * dpr;
        if (!this.blocks) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let allImagesLoaded = true;

        for (let i = 0; i < this.blocks.length; i++) {
            const id = this.blocks[i];
            if (id === 0) continue;

            const x = i % this.chunkWidth;
            const y = Math.floor(i / this.chunkWidth);

            // Using the new Registry pattern
            const block = Registry.get(id);

            if (block && block.imageLoaded) {
                let drawX = Math.floor(x * bSize);
                let drawY = Math.floor(y * bSize);
                let drawWidth = Math.floor(bSize) + 1;
                let drawHeight = Math.floor(bSize) + 1;

                // Make surface fluids shorter (like Minecraft)
                if (block.type === "fluid") {
                    // Check if block above is not fluid (surface fluid)
                    const aboveY = y - 1;
                    const aboveIndex = (aboveY * this.chunkWidth) + x;
                    const aboveBlock = aboveY >= 0 ? Registry.get(this.blocks[aboveIndex]) : null;
                    const isSurface = !aboveBlock || aboveBlock.type !== "fluid";

                    if (isSurface) {
                        drawY += Math.floor(bSize / 16); // Offset down by 1/16
                        drawHeight = Math.floor(bSize * 15 / 16) + 1; // 15/16 height +1 to prevent gaps
                    }
                }

                this.ctx.drawImage(block.image, drawX, drawY, drawWidth, drawHeight);

                // If it's water, apply biome-specific tint
                if (block.type === "fluid") {
                    // Apply biome blend for water, to visually differentiate biomes

                    const biome = BiomeGen.getBiomeAt((this.chunkIndex * this.chunkWidth) + x);
                    this.ctx.fillStyle = biome.waterColor;
                    this.ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
                }
            } else {
                // Better data-driven fallback colors
                const fallbacks = { 1: "#4caf50", 2: "#795548", 3: "#5d4037", 4: "#5d4037", 5: "#2e7d32", 6: "#2e7d32" };
                this.ctx.fillStyle = fallbacks[id] || "magenta";
                this.ctx.fillRect(x * bSize, y * bSize, bSize, bSize);
                allImagesLoaded = false;
            }
        }

        if (allImagesLoaded) {
            this.renderedOnce = true;
        }
    }

    delete() {
        this.canvas.width = 0;
        this.canvas.height = 0;
    }
}