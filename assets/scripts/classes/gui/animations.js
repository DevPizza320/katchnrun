/**
 * JSAnimation
 * Fully JavaScript-driven CSS animations
 */

let animationStyleSheet = null;
let animationIdCounter = 0;

function getStyleSheet() {
    if (!animationStyleSheet) {
        const style = document.createElement("style");
        style.setAttribute("data-js-animations", "true");
        document.head.appendChild(style);
        animationStyleSheet = style.sheet;
    }
    return animationStyleSheet;
}

export class JSAnimation {
    constructor(element) {
        if (!(element instanceof HTMLElement)) {
            throw new Error("JSAnimation requires a DOM element");
        }

        this.el = element;
        this.currentAnimation = null;
    }

    /* =============================
       KEYFRAME CREATION
    ============================= */

    static createKeyframes(frames) {
        const name = `js_anim_${animationIdCounter++}`;
        const sheet = getStyleSheet();

        let rule = `@keyframes ${name} {`;

        for (const step in frames) {
            rule += `${step} {`;
            const styles = frames[step];

            for (const prop in styles) {
                rule += `${prop}: ${styles[prop]};`;
            }

            rule += `}`;
        }

        rule += `}`;

        sheet.insertRule(rule, sheet.cssRules.length);
        return name;
    }

    /* =============================
       PLAY ANIMATION
    ============================= */

    play({
        keyframes,
        duration = 300,
        timing = "ease",
        delay = 0,
        iterations = 1,
        direction = "normal",
        fill = "forwards",
        cleanup = false
    }) {
        return new Promise((resolve) => {
            const name = JSAnimation.createKeyframes(keyframes);

            // Reset animation
            this.el.style.animation = "none";
            void this.el.offsetWidth;

            this.el.style.animation = `
                ${name}
                ${duration}ms
                ${timing}
                ${delay}ms
                ${iterations}
                ${direction}
                ${fill}
            `;

            const onEnd = () => {
                this.el.removeEventListener("animationend", onEnd);

                if (cleanup) {
                    this.el.style.animation = "";
                }

                resolve();
            };

            this.el.addEventListener("animationend", onEnd, { once: true });
        });
    }

    /* =============================
       TRANSITION (JS-ONLY)
    ============================= */

    transition({
        styles = {},
        duration = 300,
        timing = "ease",
        delay = 0
    }) {
        return new Promise((resolve) => {
            this.el.style.transition =
                `all ${duration}ms ${timing} ${delay}ms`;

            requestAnimationFrame(() => {
                Object.assign(this.el.style, styles);
            });

            const onEnd = () => {
                this.el.removeEventListener("transitionend", onEnd);
                resolve();
            };

            this.el.addEventListener("transitionend", onEnd, { once: true });
        });
    }

    /* =============================
       PRESETS (OPTIONAL)
    ============================= */

    fadeIn(duration = 300) {
        this.el.style.opacity = 0;
        return this.transition({
            styles: { opacity: 1 },
            duration
        });
    }

    fadeOut(duration = 300) {
        return this.transition({
            styles: { opacity: 0 },
            duration
        });
    }

    scalePop(duration = 400) {
        return this.play({
            duration,
            timing: "cubic-bezier(.2,.8,.2,1)",
            keyframes: {
                "0%": { transform: "scale(0.85)", opacity: 0 },
                "60%": { transform: "scale(1.05)", opacity: 1 },
                "100%": { transform: "scale(1)" }
            }
        });
    }

    slideUp(distance = 20, duration = 300) {
        return this.play({
            duration,
            keyframes: {
                "0%": { transform: `translateY(${distance}px)`, opacity: 0 },
                "100%": { transform: "translateY(0)", opacity: 1 }
            }
        });
    }

    /* =============================
       CLEANUP
    ============================= */

    clear() {
        this.el.style.animation = "";
        this.el.style.transition = "";
    }
}