import { blockInstances, BLOCK_TYPES } from "./blocks/blocks.js";

export function getFirstSolidBlockAtCol(col) {
    const blocksPerChunk = 16;
    const chunkIndex = Math.floor(col / blocksPerChunk);
    let localCol = ((col % blocksPerChunk) + blocksPerChunk) % blocksPerChunk;

    if (!window._world.chunks[chunkIndex]) {
        if (window.camera) window.camera.loadChunk(chunkIndex);
    }

    const chunk = window._world.chunks[chunkIndex];
    if (!chunk || !chunk.blocks) return -1;

    const height = chunk.chunkHeight;
    for (let y = 0; y < height; y++) {
        const flatIndex = (y * blocksPerChunk) + localCol;
        const blockID = chunk.blocks[flatIndex];

        // NEW: Check the instance's solidity instead of just > 0
        const block = blockInstances[blockID];
        if (block && block.type === BLOCK_TYPES.SOLID) {
            return y - 1;
        }
    }
    return -1;
}

export function getBlockAtWorld(row, col) {
    const chunkWidth = 16;
    const chunkHeight = 10;
    const chunkIndex = Math.floor(col / chunkWidth);
    const localCol = ((col % chunkWidth) + chunkWidth) % chunkWidth;

    const chunk = window._world.chunks[chunkIndex];
    if (!chunk || !chunk.blocks || row < 0 || row >= chunkHeight) return 0;

    const flatIndex = (row * chunkWidth) + localCol;
    const blockID = chunk.blocks[flatIndex];

    // NEW: Return 0 (Air) for any block that isn't solid
    const block = blockInstances[blockID];
    if (block && block.type === BLOCK_TYPES.SOLID) {
        return blockID;
    }

    return 0; // Physics engine now ignores non-solid blocks
}

export function getCol(x) {
    // convert a world‑pixel x coordinate into a block column index. previously
    // this used `Math.abs`, which meant negative positions mapped to the same
    // column as their positive counterparts; that causes problems when the
    // player walks left of the origin. signed values are more useful in a
    // chunked world as the chunk math already handles negatives correctly.
    return Math.floor(x / window.blockSize);
}

let _frameCount = 0;
let _lastTime = performance.now();
let _fps = 0;

export function getFPS() {
    const now = performance.now();
    _frameCount++;

    if (now - _lastTime >= 1000) {
        _fps = _frameCount;
        _frameCount = 0;
        _lastTime = now;
    }

    return _fps.toFixed(0);
}