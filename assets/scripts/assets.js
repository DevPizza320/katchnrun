import { fetchJSON } from "./../../lib/random_utils/json.js"
import { AssetManager } from "./../../lib/random_utils/asset_manager.js"

const manifest = await fetchJSON("./json/manifest.json") ?? {};
export const themes = await fetchJSON("./json/launch_themes.json") ?? {};
export const items = await fetchJSON("./json/item_data.json") ?? {};

await AssetManager.loadAll(manifest);
window.assetsLoaded = true;
document.dispatchEvent(new CustomEvent("assets:loaded"));

// ! === Prepare the global variables
window.blocksY = 10;
window.blockSize = (window.innerHeight * (window.devicePixelRatio ?? 1)) / window.blocksY;
window.blocksX = Math.ceil((window.innerWidth * (window.devicePixelRatio ?? 1)) / window.blockSize);