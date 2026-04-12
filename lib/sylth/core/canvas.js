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

        this.dpr = window.devicePixelRatio || 1;
        this.ctx = null;

        // Bind resize to preserve 'this' context
        this.resize = this.resize.bind(this);
    }

    attach() {
        document.body.appendChild(this.canvas);
        this.resize(); // Set proper canvas resolution after attaching to DOM

        // Keep canvas sized on window resizes
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this.resize);
        }
    }

    resize() {
        if (!this.canvas) {
            console.warn("Canvas element not found");
            return;
        }
        const dpr = window.devicePixelRatio || 1;
        this.dpr = dpr;

        // Keep CSS size in CSS pixels, backing store in device pixels
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;

        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;

        // Configure context for DPR so drawing can use CSS pixel units
        const ctx = this.canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Disable smoothing for crisp pixel-art (optional)
        if (typeof ctx.imageSmoothingEnabled !== 'undefined') {
            ctx.imageSmoothingEnabled = false;
        }
        this.ctx = ctx;
    }

    get width() {
        return Math.floor(this.canvas.width / (this.dpr || 1));
    }

    get height() {
        return Math.floor(this.canvas.height / (this.dpr || 1));
    }
}