// feature_class.js
export class Feature {
    constructor() {
        this.template = [];
        this.canSpawnOn = [1];
        this.anchorX = 0;
        this.anchorY = 0;
    }

    // NEW: General method to check if a block can be placed on another
    // This can be overridden by specific features
    isValidFloor(groundBlock, blockIDToPlace) {
        return this.canSpawnOn.includes(groundBlock);
    }

    setBlockInWorld(row, col, id, isAnchorBlock = false) {
        const chunkWidth = 16;
        const chunkIndex = Math.floor(col / chunkWidth);
        const localCol = ((col % chunkWidth) + chunkWidth) % chunkWidth;

        const targetChunk = window._world?.chunks?.[chunkIndex];
        if (targetChunk && targetChunk.blocks) {
            const index = (row * targetChunk.chunkWidth) + localCol;
            const groundIndex = ((row + 1) * targetChunk.chunkWidth) + localCol;

            const isTargetAir = targetChunk.blocks[index] === 0;
            const groundBlock = targetChunk.blocks[groundIndex];

            // LOGIC REFINEMENT:
            // 1. If it's the anchor (base), it MUST be on valid ground (Grass/Dirt).
            // 2. If it's NOT the anchor, it must be on a valid floor (Self/Wood/Dirt).
            // 3. ONLY if the feature explicitly allows 'floating' do we allow Air.

            const canPlace = isAnchorBlock
                ? this.isValidFloor(groundBlock, id)
                : (this.isValidFloor(groundBlock, id) || (this.allowFloating && groundBlock === 0));

            if (isTargetAir && canPlace) {
                targetChunk.blocks[index] = id;
                targetChunk.renderedOnce = false;
            }
        }
    }
}