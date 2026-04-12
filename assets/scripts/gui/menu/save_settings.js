import { loadFromLocalStorage, saveToLocalStorage } from "../../../../lib/random_utils/local_storage.js";
import { config } from "../../../../config/config.js";
import { Click } from "../../../../lib/random_utils/better_listeners.js";
import { DOM } from "../dom.js";

function setInputValuesFromLocalStorage() {
    const storedOptions = loadFromLocalStorage("options");

    if (storedOptions) {
        if (storedOptions.controls?.keyboard?.[0]) {
            Object.assign(config.options.controls.keyboard[0], storedOptions.controls.keyboard[0]);
        }
        if (storedOptions.music) {
            Object.assign(config.options.music, storedOptions.music);
        }
    }

    const keyboardConfig = config.options.controls.keyboard[0];
    DOM.id("left-value").querySelector("span").textContent = keyboardConfig.left;
    DOM.id("right-value").querySelector("span").textContent = keyboardConfig.right;
    DOM.id("jump-value").querySelector("span").textContent = keyboardConfig.jump;

    const musicConfig = config.options.music;
    const setSlider = (inputId, labelId, value) => {
        const input = DOM.id(inputId);
        const label = DOM.id(labelId);

        if (!input || !label) return;

        const percentage = Math.round(value * 100);
        input.value = percentage;
        label.textContent = `${percentage}%`;
    };

    setSlider("master-value", "master-label", musicConfig.master);
    setSlider("music-value", "music-label", musicConfig.music);
    setSlider("sfx-value", "sfx-label", musicConfig.sfx);
}

// Cleaned up handler: 'e' and 'span' are now easily accessible
// Add 'controller' as an argument so we can choose when to stop listening
function handleKeyEntry(e, span, controller) {
    e.preventDefault(); // Prevents Space from "clicking" the button again

    // 1. Block Special Keys
    const forbidden = ["Escape", "Tab", "Meta", "Alt", "Control", "Shift", "F1", "F12"];
    if (forbidden.includes(e.key)) return; 

    const controlName = span.parentElement.id.replace("-value", "");
    const keyboardConfig = config.options.controls.keyboard[0];

    // 2. Prevent Duplicates
    const alreadyBound = Object.keys(keyboardConfig).find(
        action => keyboardConfig[action] === e.key && action !== controlName
    );

    if (alreadyBound) {
        alert(`Key "${e.key === " " ? "Space" : e.key}" is already used for ${alreadyBound}!`);
        return; // Return early WITHOUT aborting, so they can try another key
    }

    // 3. Success: Update UI and Config
    span.textContent = e.key === " " ? "Space" : e.key;
    keyboardConfig[controlName] = e.key;

    controller.abort(); // Only stop listening once a valid, unique key is pressed
}

function setupMusicSliders() {
    const musicSliders = DOM.group("#master-value, #music-value, #sfx-value");

    musicSliders.forEach(slider => {
        slider.addEventListener("input", (e) => {
            const settingName = e.target.name; // "master", "music", or "sfx"
            const value = e.target.value / 100; // Convert 0-100 to 0-1
            config.options.music[settingName] = value;
        });
    });
}

function waitForKey() {
    const keyControls = DOM.group("#left-value, #right-value, #jump-value");

    keyControls.forEach(key => {
        const span = key.querySelector("span");

        // Use your Click utility - passing the function as a reference
        Click(key, () => {
            const originalContent = span.textContent;
            span.textContent = "Key...";

            const controller = new AbortController();

            // Add the listener with the abort signal
            document.addEventListener("keydown", (e) => {
                handleKeyEntry(e, span, controller);
                controller.abort(); // Stops listening after the first key press
            }, { signal: controller.signal });

            // Auto-cancel after 5 seconds
            setTimeout(() => {
                if (span.textContent === "Key...") {
                    span.textContent = originalContent; // Revert if no key pressed
                }
                controller.abort();
            }, 5000);
        });
    });
}

// Ensure we pass the reference 'waitForKey', not 'waitForKey()'
export function saveSettings() {
    setInputValuesFromLocalStorage();
    
    waitForKey();
    setupMusicSliders();
    
    const saveBtn = DOM.id("save-and-exit-btn");
    
    Click(saveBtn, () => {
        saveToLocalStorage("options", config.options);
    });
}