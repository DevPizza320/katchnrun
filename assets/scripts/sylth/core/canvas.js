export class Canvas {
    constructor(background) {
        this.canvas = document.createElement("canvas");
        this.fullscreen = true;
        this.z = 10000;

        this.canvas.style.width = "100vw";
        this.canvas.style.height = "100vh";
        this.canvas.style.background = background;
        this.canvas.style.backgroundSize = "cover";
        this.canvas.style.overflow = "hidden";
        this.canvas.style.display = "block";
        this.canvas.style.position = "absolute";
        this.canvas.style.zIndex = `${this.z}`;

        // Bind resize to preserve 'this' context
        this.resize = this.resize.bind(this);
    }

    attach() {
        document.body.appendChild(this.canvas);
        this.resize(); // Set proper canvas resolution after attaching to DOM
    }

    resize() {
        if (!this.canvas) {
            console.warn("Canvas element not found");
            return;
        }
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }
}