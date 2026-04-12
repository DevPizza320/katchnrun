import { ClientTick } from "./game/tick.js";
import { blockSize, blocksX, blocksY, _world, context, pool, camera } from "./game/global.js";
import { config } from "../../config/config.js";
import { Player } from "./game/player.js";
import { ItemManager } from "./game/items/item_manager.js";
import { Items } from "./game/items/items.js";

// Use a terrain-only preview: no players, just a slowly sliding world.
window.players = [];
window._world = _world;
window.camera = camera;

camera.speed = config.game.cameraSpeed;
camera.startX = 0;
camera.startSliding();

pool.ctx = context;
pool.setOriginalSize();
pool.start();


// Initialize immediately so terrain appears before the first animation frame.
camera.update();

document.addEventListener("run:start", () => {
    window.players[0] = new Player(0, config.options.controls.keyboard[0]);
    window.players[0].ctx = context;
    pool.addEntity(window.players[0]);

    // Add nametag for player 0
    window.players[0].nametag.ctx = context;
    window.players[0].nametag.setFollowing(window.players[0]);
    pool.addEntity(window.players[0].nametag);
});

document.addEventListener("run:end", () => {
    document.querySelectorAll('.shaders ~ *').forEach(el => el.style.opacity = '1');

    camera.startX = 0;
    camera.startSliding();

    window.players.length = 0;
    pool.entities.length = 0;
});