import { AudioHandler } from "../sylth/audio/audio_handler.js";

const els = document.querySelectorAll('*');
const elements = Array.from(els);

document.addEventListener("DOMContentLoaded", () => {
    elements.forEach(e => {
        // NO translate
        e.setAttribute("translate", "no");
        if (e.classList.contains("themed-button-wooden")) {
            // play a short SFX for button presses, avoid triggering ambient music
            e.addEventListener("click", (ev) => {
                // don't play SFX for the music toggle itself
                if (e.classList.contains('home_center_music')) return;
                AudioHandler.play("../../assets/sounds/sfx/button_press.mp3", { volume: 0.9, loop: false, forceRestart: true });
            });
        }
    });
});