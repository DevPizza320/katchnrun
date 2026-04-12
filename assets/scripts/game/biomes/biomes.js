export const BIOME_DEFINITIONS = {
    "jungle": {
        // Biome matching (used with your 1D "biome noise")
        temperature: 1.0, 
        moisture: 1.0,
        
        // Terrain shape
        heightOffset: 3,    // Base height (Y-level)
        amplitude: 2,       // Max height of hills in blocks
        scale: 0.05,         // Roughness (higher = more jagged)
        
        // Block Registry IDs
        surfaceBlock: 1,     // e.g., Jungle Grass
        subBlock: 2,         // e.g., Dirt
        
        // Decorations
        treeChance: 0.15,    // 15% chance per surface block
        bushChance: 0.3,      // 30% chance for small plants

        // Color map
        waterColor: "rgba(23, 96, 124, .8)"
    },
    "bamboo_jungle": {
        temperature: 1.0,
        moisture: 0.8,
        heightOffset: 3,
        amplitude: 2,        // Very flat
        scale: 0.05,         // Smooth dunes
        surfaceBlock: 7,     // Sand
        subBlock: 2,         // Sandstone
        treeChance: 0.02,    // Rare cacti
        waterColor: "rgba(20, 84, 107, 0.8)" // Bamboo Jungle water color
    }
}
