export function show(elements, display = "flex") {
    if (!elements) return;

    if (!Array.isArray(elements)) {
        elements = [elements];
    }

    elements.forEach((el, index) => {
        if (typeof display === "string") {
            el.style.display = display;
        } else if (Array.isArray(display)) {
            el.style.display = display[index] || "flex";
        }
    });
}

export function hide(elements) {
    if (!elements) return;

    if (!Array.isArray(elements)) {
        elements = [elements];
    }

    elements.forEach(el => {
        el.style.display = "none";
    });
}