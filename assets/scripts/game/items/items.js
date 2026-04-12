import { Item } from "./item_class.js";
import { items } from "../../assets.js";

const Items = {};

for (const key of Object.keys(items.items)) {
    const data = items.items[key];

    // Create unique instance and store it in the Items object
    Items[key] = new Item({
        type: data.type,
        vx: 0,
        vy: 0,
        health: data.health_gain,
        speedMult: data.speed_mult,
        score: data.score_gain
    });
}

export { Items };