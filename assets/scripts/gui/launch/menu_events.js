import { DOM } from "../dom.js";
import { config } from "../../../../config/config.js";
import { AssetManager } from "../../../../lib/random_utils/asset_manager.js";
import * as vis from "../../../../lib/random_utils/visibility.js";
import { toggleFullscreen } from "../../../../lib/random_utils/fullscreen.js";
import { handleGameTitleAnimationEnd } from "./game_title_animation_end.js";

function handleControlClick(event) {
    const ctrl = event.currentTarget;
    
    toggleFullscreen();

    config.device.controls = ctrl.id.split("-")[1] ?? "keyboard";

    vis.hide(DOM.id("controls-container"));

    AssetManager.get("dripstone").play();

    vis.show(DOM.id("game-title"));
    DOM.id("game-title").style.animation = "jungle-shimmer 5s ease-in-out";
}

export function bindMenuEvents() {
    const controls = DOM.group("#controls-keyboard, #controls-touch");
    const gameTitle = DOM.id("game-title");

    controls.forEach(ctrl => {
        ctrl.addEventListener("click", handleControlClick);
    });

    gameTitle.addEventListener("animationend", handleGameTitleAnimationEnd);
}