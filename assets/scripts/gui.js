import * as utils from "./utils/utils.js";
import { AudioHandler } from "./sylth/audio/audio_handler.js";
import { applyColorVariant, removeColorVariant } from "./utils/enhancements.js";

const levels = await utils.fetchJSON("./json/levels.json");

// ze gui
const homeLevelInfo = document.querySelector(".home_level_info");
const homeLevelImg = homeLevelInfo.querySelector("img");
const homeLevelSpan = homeLevelInfo.querySelector("span");
const leftArrow = document.querySelector(".home_level_left-arrow");
const rightArrow = document.querySelector(".home_level_right-arrow");

const levelSettings = utils.loadFromLocalStorage("levelSettings") || {
    name: levels[0].name,
    img: levels[0].img,
    difficulty: "easy",
    duration: levels[0].duration
};

// Set initial UI based on loaded/saved level
let i = levels.findIndex(l => l.name === levelSettings.name);
if (i === -1) i = 0; // Fallback if saved level not found
homeLevelImg.src = `./assets/textures/background/${levelSettings.img}`;
homeLevelSpan.textContent = levelSettings.name;

utils.saveToLocalStorage("levelSettings", levelSettings);

if (levels.length == 1) {
    leftArrow.classList.add("no-access");
    rightArrow.classList.add("no-access");
} else {
    if (i === 0) leftArrow.classList.add("no-access");
    if (i === levels.length - 1) rightArrow.classList.add("no-access");
}

leftArrow.addEventListener("click", () => {
    if (i > 0) {
        i--;
        levelSettings.name = levels[i].name;
        levelSettings.img = levels[i].img;
        levelSettings.duration = levels[i].duration;
        utils.saveToLocalStorage("levelSettings", levelSettings);
        if (rightArrow.classList.contains("no-access")) rightArrow.classList.remove("no-access");
        homeLevelImg.src = `./assets/textures/background/${levels[i].img}`;
        homeLevelSpan.textContent = levels[i].name;
        if (i === 0) {
            leftArrow.classList.add("no-access");
        }
    }
});

rightArrow.addEventListener("click", () => {
    if (i < levels.length - 1) {
        i++;
        levelSettings.name = levels[i].name;
        levelSettings.img = levels[i].img;
        levelSettings.duration = levels[i].duration;
        utils.saveToLocalStorage("levelSettings", levelSettings);
        if (leftArrow.classList.contains("no-access")) leftArrow.classList.remove("no-access");
        homeLevelImg.src = `./assets/textures/background/${levels[i].img}`;
        homeLevelSpan.textContent = levels[i].name;
        if (i === levels.length - 1) {
            rightArrow.classList.add("no-access");
        }
    }
});

const difficultyButtons = Array.from(document.querySelector(".home_level_difficulty").querySelectorAll("button"));
difficultyButtons.forEach(button => {
    button.addEventListener("click", () => {
        if (button.getAttribute("color-variant")) {
            // If this button is already green, turn it off
            button.removeAttribute("color-variant");
            removeColorVariant(button);
            // Reset to default difficulty when no button is selected
            levelSettings.difficulty = "easy";
            utils.saveToLocalStorage("levelSettings", levelSettings);
        } else {
            // Turn off all other buttons first
            difficultyButtons.forEach(otherButton => {
                if (otherButton !== button && otherButton.getAttribute("color-variant")) {
                    otherButton.removeAttribute("color-variant");
                    removeColorVariant(otherButton);
                }
            });
            // Then turn this button on and set the difficulty
            button.setAttribute("color-variant", "#008000");
            applyColorVariant(button);
            levelSettings.difficulty = button.querySelector("span").textContent;
            utils.saveToLocalStorage("levelSettings", levelSettings);
        }
    });
});