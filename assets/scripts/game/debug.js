import { pool } from "./global.js";
import { ClientTick } from "./tick.js";
import { getFPS } from "./math.js";
import { ElementManager } from "../random_utils/element_manager.js";
import { Registry } from "./blocks/blocks.js";

function getBrowser() {
    const userAgent = navigator.userAgent;
    let browser = null;

    if (userAgent.indexOf("Firefox") > -1) {
        browser = "Mozilla Firefox";
    } else if (userAgent.indexOf("SamsungBrowser") > -1) {
        browser = "Samsung Internet";
    } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
        browser = "Opera";
    } else if (userAgent.indexOf("Trident") > -1) {
        browser = "Internet Explorer";
    } else if (userAgent.indexOf("Edge") > -1 || userAgent.indexOf("Edg") > -1) {
        browser = "Microsoft Edge";
    } else if (userAgent.indexOf("Chrome") > -1) {
        browser = "Google Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
        browser = "Apple Safari";
    } else {
        browser = "Unknown";
    }

    return browser;
}

console.log(performance.memory);
function getMemoryUsage() {
    if (performance.memory) {
        const toMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);
        return `${toMB(performance.memory.usedJSHeapSize)}MB / ${toMB(performance.memory.totalJSHeapSize)}MB`;
    } else {
        return "Memory API not supported in this browser.";
    }
}

ElementManager.getElement("id", "res-w").textContent = window.innerWidth;
ElementManager.getElement("id", "res-h").textContent = window.innerHeight;
ElementManager.getElement("id", "browser-info").textContent = `Browser: ${getBrowser()}`;
ElementManager.getElement("id", "dpr").textContent = window.devicePixelRatio;

function debug() {
    const p = window.players[0];
    ElementManager.getElement("id", "fps-display").textContent = `FPS: ${getFPS()}`;
    ElementManager.getElement("id", "pos-x").textContent = p.worldX.toFixed(2);
    ElementManager.getElement("id", "pos-y").textContent = p.y.toFixed(2);
    ElementManager.getElement("id", "block-x").textContent = window._world.getBlockAt(Math.floor(p.worldX), Math.round(p.y)).name;
    ElementManager.getElement("id", "block-y").textContent = Math.floor(p.properties.y / window.blockSize);
    ElementManager.getElement("id", "direction").textContent = p.direction || "None";

    ElementManager.getElement("id", "entity-count").textContent = `${pool.entities.length} / ${pool.buffer}`;
    ElementManager.getElement("id", "mem-usage").textContent = getMemoryUsage();
}

// Add a keybind to toggle debug visibility
window.addEventListener("keydown", (e) => {
    if (e.key === "q") {
        const debugElement = ElementManager.getElement("id", "debug-info");
        debugElement.style.display = debugElement.style.display === "none" ? "block" : "none";
    }
});

ClientTick.addCall("debug", debug);