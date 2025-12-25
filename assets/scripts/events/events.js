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
    const audioPath = "../assets/sounds/ambient/home_0.mp3";

    if (musicPaused) {
        AudioHandler.play(audioPath, { volume: 1, loop: true, forceRestart: false });
        musicPaused = false;
    } else {
        AudioHandler.pause(audioPath);
        musicPaused = true;
    }
};

document.querySelector(".home_center_play").addEventListener("click", () => {
    window.location.href.replace("../../../Christmas/index.html");
});

document.querySelector(".home_center_play").addEventListener("click", () => {
    window.location.href = "../../Christmas/index.html";
});