export function getDeviceType() {
    // Multiple checks to make sure the correct type is returned
    if (window.matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0) {
        return "touch";
    } else {
        return "keyboard";
    }
}