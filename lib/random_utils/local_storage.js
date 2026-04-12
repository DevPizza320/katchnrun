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