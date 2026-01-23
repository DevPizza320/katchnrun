import { AudioHandler } from "../sylth/audio/audio_handler.js";
import * as utils from "../utils/utils.js";

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        AudioHandler.stopAll();
    } else {
        AudioHandler.resumeAll();
    }
});

document.querySelector(".home_top_fullscreen").addEventListener("click", () => {
    utils.toggleFullscreen();
});

let musicPaused = false;
document.querySelector(".home_center_music").onclick = () => {
    const audioPath = "assets/sounds/ambient/home_0.mp3";

    if (musicPaused) {
        AudioHandler.play(audioPath, { volume: 1, loop: true, forceRestart: false });
        musicPaused = false;
    } else {
        AudioHandler.pause(audioPath);
        musicPaused = true;
    }
};

// blur windows dissappear when clicked
Array.from(document.querySelectorAll(".themed-window-blurry")).forEach(w => {
    w.addEventListener("click", (e) => { e.stopPropagation(); if (e.target === w && w.classList.contains("close-on-click")) w.style.display = "none" });
});