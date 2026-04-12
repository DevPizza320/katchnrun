import { config } from "../../../../config/config.js";
import { Player } from "../../game/player.js";
import { camera } from "../../game/global.js";
import { AnimationEnd } from "../../../../lib/random_utils/better_listeners.js";
import { DOM } from "../dom.js";

export function prepareRun() {
    document.body.style.animation = "fadeOut 5s linear";

    AnimationEnd(document.body, () => {
        // Hides every sibling following the element with id "start"
        document.querySelectorAll('.shaders ~ *').forEach(el => el.style.opacity = '0');

        camera.stopSliding();
        camera.startX = 0;

        document.dispatchEvent(new CustomEvent("run:start"));
    });
}