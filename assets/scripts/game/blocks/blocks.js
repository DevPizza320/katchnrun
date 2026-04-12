import { Block } from "./block_class.js";

export const BLOCK_TYPES = {
    SOLID: "solid",
    TRANSPARENT: "transparent",
    BILLBOARD: "billboard",
    FLUID: "fluid"
};


const BLOCK_DEFINITIONS = {
    0: { name: "air", type: BLOCK_TYPES.TRANSPARENT, texture: "air" },
    1: { name: "jungle_grass", type: BLOCK_TYPES.SOLID, texture: "grass_jungle" },
    2: { name: "dirt", type: BLOCK_TYPES.SOLID, texture: "dirt" },
    3: { name: "log", type: BLOCK_TYPES.SOLID, texture: "jungle_log" },
    4: { name: "ghost_log", isSolid: false, texture: "jungle_log" },
    5: { name: "leaves", isSolid: true, texture: "jungle_leaves" },
    6: { name: "ghost_leaves", isSolid: false, texture: "jungle_leaves" },
    7: { name: "bamboo_grass", type: BLOCK_TYPES.SOLID, texture: "grass_bamboo_jungle" },
    8: { name: "short_grass", type: BLOCK_TYPES.BILLBOARD, texture: "short_grass" },
    9: { name: "water", type: BLOCK_TYPES.FLUID, texture: "water" },
    10: { name: "bamboo_stalk", type: BLOCK_TYPES.BILLBOARD, texture: "bamboo_stalk" },
    11: { name: "bamboo_leaves", type: BLOCK_TYPES.BILLBOARD, texture: "bamboo_leaves" },
    12: { name: "toxic_grass", type: BLOCK_TYPES.BILLBOARD, texture: "toxic_grass" }
};

// For O(1) lookup time
const BLOCKS_BY_NAME = Object.fromEntries(
    Object.entries(BLOCK_DEFINITIONS).map(([id, data]) => [data.name, { ...data, id: Number(id) }])
);

export const blockInstances = {};

// Initialize the registry
for (const id in BLOCK_DEFINITIONS) {
    blockInstances[id] = new Block(BLOCK_DEFINITIONS[id]);
}

/**
 * Minecraft-style Registry helper
 */
export const Registry = {
    get: (id) => blockInstances[id] || blockInstances[0],
    getByName: (name) => BLOCKS_BY_NAME[name]
};