import { Noise1D } from "../utils/math.js";
import { BIOME_DEFINITIONS } from "./biomes.js";

export class BiomeGen {
    // Big seed difference to ensure different noise mapping
    static temperatureNoise = new Noise1D(12345);
    static moistureNoise = new Noise1D(67890);

    // How long a biome should last: smaller = bigger biomes
    static biomeScale = 0.02;

    static getBiomeAt(globalX) {
        // 1. Sample Temperature and Moisture (normalize -1..1 to 0..1)
        const t = (this.temperatureNoise.get(globalX * this.biomeScale) + 1) / 2;
        const m = (this.moistureNoise.get(globalX * this.biomeScale) + 1) / 2;

        let closestBiome = null;
        let minDistance = Infinity;

        // 2. Find the biome with the closest matching stats
        for (const [name, config] of Object.entries(BIOME_DEFINITIONS)) {
            const dT = t - config.temperature;
            const dM = m - config.moisture;
            const distance = Math.sqrt(dT * dT + dM * dM); // Euclidean distance

            if (distance < minDistance) {
                minDistance = distance;
                closestBiome = { name, ...config };
            }
        }

        return closestBiome;
    }
}