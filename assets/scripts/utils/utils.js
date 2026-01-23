import { LoadingScreen } from "../sylth/load/load.js";

export function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

export function toggleFullscreen(el = document.documentElement) {
    if (!document.fullscreenElement) {
        el.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

export async function loadAssetsFromJSON(url) {
    const res = await fetch(url);
    const json = await res.json();

    // Uses the static helper we built
    return LoadingScreen.extractAssets(json);
}

export async function fetchJSON(url) {
    const res = await fetch(url);
    return res.json();
}

export function saveToLocalStorage(key, value) {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
    } catch (err) {
        console.error("Could not save to localStorage:", err);
    }
}

export function loadFromLocalStorage(key) {
    try {
        const serialized = localStorage.getItem(key);
        if (serialized === null) return null;
        return JSON.parse(serialized);
    } catch (err) {
        console.error("Could not load from localStorage:", err);
        return null;
    }
}