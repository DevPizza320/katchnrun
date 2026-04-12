export function Click(el, fn) {
    if (typeof fn === 'function') {
        el.addEventListener("click", fn);
    }
}

export function Remove(el, fn) {
    if (typeof fn === 'function') {
        el.removeEventListener("click", fn);
    }
}

export function AnimationEnd(el, fn) {
    if (typeof fn === 'function') {
        el.addEventListener("animationend", fn);
    }
}