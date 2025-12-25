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

export async function JSON(url) {
    const res = await fetch(url);
    return res.json();
}