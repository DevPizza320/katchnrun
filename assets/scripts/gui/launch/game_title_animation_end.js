import { DOM } from "../dom.js";
import { AssetManager } from "../../../../lib/random_utils/asset_manager.js";
import * as vis from "../../../../lib/random_utils/visibility.js";

export function handleGameTitleAnimationEnd() {
    DOM.id("launch").remove();

    document.dispatchEvent(new CustomEvent("game:menu"));

    document.body.style.animation = "fadeIn 3s ease-in";
    vis.show(DOM.id("world"), "block");
    vis.show(DOM.id("sky"), "block");
    vis.show(DOM.id("darkness"), "block");
    vis.show(DOM.id("game-title"), "block");
    DOM.id("game-title").classList.add("game-title-menu");
    DOM.id("game-title").style.animation = "jungle-float-shimmer 6s ease-in-out infinite";
    AssetManager.get("menu").play();
    AssetManager.get("menu").loop = true;

    document.body.addEventListener("animationend", () => {vis.show(DOM.get(".app"), "grid")}, { once: true });
}