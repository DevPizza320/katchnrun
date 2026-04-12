import { bindMenuEvents } from "./gui/launch/menu_events.js";
import { handleWoodenButtonPress } from "./gui/launch/button_press.js";
import { saveSettings } from "./gui/menu/save_settings.js";
import { Click } from "../../lib/random_utils/better_listeners.js";
import { DOM } from "./gui/dom.js";
import { hide, show } from "../../lib/random_utils/visibility.js";
import { prepareRun } from "./gui/menu/prepare_run.js";

// Make sure all assets are loaded before accessing AssetManager
if (window.assetsLoaded) {
    handleWoodenButtonPress();
} else {
    document.addEventListener("assets:loaded", handleWoodenButtonPress);
}

bindMenuEvents();

Click(DOM.id("settings"), () => {
    show(DOM.get(".settings"), "grid");
});
saveSettings();

DOM.group("#back-btn, #save-and-exit-btn").forEach(btn => {
    Click(btn, () => {
        hide(DOM.get(".settings"));
    });
});

Click(DOM.id("lone-runner"), prepareRun);