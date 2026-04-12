import { DOM } from "../dom.js";
import { AssetManager } from "../../../../lib/random_utils/asset_manager.js";

export function handleWoodenButtonPress() {
    const woodenButtons = Array.from(DOM.group(".themed-button-wooden"));

    woodenButtons.forEach(btn => {
        btn.addEventListener("click", () => AssetManager.get("button_press").play());
    });
}