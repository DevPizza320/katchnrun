import { config } from "../../../config/config.js";
import { DOM } from "./../gui/dom.js";
import { EntityPool } from "../../../lib/sylth/core/entity_pool.js";
import { Camera } from "../game/camera.js";
import { World } from "../game/world.js";

// ? Here we will create the game environment for both the preview and the run.

const world = DOM.id("world");
const sky = DOM.id("sky");
const shaders = DOM.get(".shaders");
const effects = DOM.get(".screen_effects");

world.width = config.device.width;
world.height = config.device.height;
sky.width = config.device.width;
sky.height = config.device.height;

const blockSize = config.game.blockSize;
const blocksX = config.game.blocksX;
const blocksY = config.game.blocksY;

const _world = new World();
window._world = _world;
const context = world.getContext("2d");
const dpr = config.device.dpr;
context.scale(dpr, dpr); 
const pool = new EntityPool();
const camera = new Camera();

export { world, sky, shaders, effects, blockSize, blocksX, blocksY, _world, context, pool, camera };