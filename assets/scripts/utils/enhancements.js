import { AudioHandler } from "../sylth/audio/audio_handler.js";

function lightenDarkenColor(col, amt) {
    let usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    let num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    let b = ((num >> 8) & 0x00FF) + amt;
    let g = (num & 0x0000FF) + amt;

    // Clamp values between 0 and 255
    const clamp = (val) => Math.min(255, Math.max(0, val));
    r = clamp(r); g = clamp(g); b = clamp(b);

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}

function buttonClickHandler(ev) {
    if (this.classList.contains('home_center_music')) return;
    if (ev.target !== this) return; // Only play sound if clicked directly on this element
    AudioHandler.play("./assets/sounds/sfx/button_press.mp3", { volume: 0.9, loop: false, forceRestart: true });
}

export function applyColorVariant(el) {
    if (el.classList && el.classList.contains("themed-button-wooden") && el.getAttribute("color-variant")) {
        let color = el.getAttribute("color-variant");
        let dark = lightenDarkenColor(color, -70);
        el.style.background = color;
        el.style.boxShadow = `0 -.35vw 0 inset ${dark}`;
        el.style.color = dark;
    }
}

export function removeColorVariant(el) {
    if (el.classList && el.classList.contains("themed-button-wooden")) {
        el.style.background = "";
        el.style.boxShadow = "";
        el.style.color = "";
    }
}

function addButtonSoundToElement(el) {
    if (el.classList && (el.classList.contains("themed-button-wooden") || el.classList.contains("button-press"))) {
        el.addEventListener("click", buttonClickHandler);
    }

    applyColorVariant(el);
}

function addToAll(elements) {
    elements.forEach(el => {
        if (el.nodeType === Node.ELEMENT_NODE) {
            addButtonSoundToElement(el);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Add to all existing elements
    addToAll(document.querySelectorAll('*'));

    // Set up observer for future elements
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    addToAll([node].concat(Array.from(node.querySelectorAll('*'))));
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});

// add color variants to themed-button-wooden
