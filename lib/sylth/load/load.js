const EXTENSION_TYPE_MAP = {
    ".png": "image",
    ".gif": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".mp3": "audio",
    ".wav": "audio",
    ".ogg": "audio",
    ".mp4": "video",
    ".webm": "video",
};

export class LoadingScreen {
    constructor({
        tips = [],
        backgroundImage = null,
        minDisplayTime = 800,
        startSound = null,
        classNames = {}
    } = {}) {
        /* ===== config ===== */
        this.tips = tips;
        this.backgroundImage = backgroundImage;
        this.minDisplayTime = minDisplayTime;
        this.startSound = startSound;

        this.classNames = {
            container: classNames.container || "loading-screen",
            text: classNames.text || "loader-text",
            bar: classNames.bar || "loader-bar",
            fill: classNames.fill || "loader-fill",
            tip: classNames.tip || "loader-tip"
        };

        /* ===== state ===== */
        this.assets = [];
        this.failedAssets = [];
        this.loaded = 0;
        this.startTime = performance.now();

        /* ===== init ===== */
        this._buildDOM();
        this._applyBackground();
        this._setRandomTip();
        this._playStartSound();
    }

    /* ================= DOM ================= */

    _buildDOM() {
        this.container = document.createElement("div");
        this.container.className = this.classNames.container;

        this.text = document.createElement("div");
        this.text.className = this.classNames.text;
        this.text.textContent = "Loading... 0%";

        this.bar = document.createElement("div");
        this.bar.className = this.classNames.bar;

        this.fill = document.createElement("div");
        this.fill.className = this.classNames.fill;
        this.fill.style.width = "5%";

        this.tip = document.createElement("div");
        this.tip.className = this.classNames.tip;

        this.bar.appendChild(this.fill);
        this.container.append(this.text, this.bar, this.tip);
        document.body.appendChild(this.container);
    }

    _applyBackground() {
        if (this.backgroundImage) {
            this.container.style.background =
                `url(${this.backgroundImage}) center / cover no-repeat`;
        }
    }

    _setRandomTip() {
        if (!this.tips.length) return;
        this.tip.textContent =
            "Tip: " + this.tips[Math.floor(Math.random() * this.tips.length)];
    }

    _playStartSound() {
        if (!this.startSound) return;
        const audio = new Audio(this.startSound);
        audio.volume = 0.6;
        audio.play().catch(() => {});
    }

    /* ================= LOADING ================= */

    async loadAssetsFromJSON(jsonPath, delayMs = 80) {
        const res = await fetch(jsonPath);
        const json = await res.json();

        this.assets = LoadingScreen.extractTypedAssets(json);
        const total = this.assets.length;

        for (const asset of this.assets) {
            await new Promise(r => setTimeout(r, delayMs));
            await this._loadSingleAsset(asset);

            this.loaded++;
            this._updateProgress(this.loaded, total);
        }

        return this.failedAssets;
    }

    _loadSingleAsset({ src, type }) {
        return new Promise((resolve) => {
            let el;

            const done = () => resolve();
            const fail = () => {
                console.error("Failed asset:", src);
                this.failedAssets.push({ src, type });
                resolve();
            };

            if (type === "image") {
                el = new Image();
                el.onload = done;
                el.onerror = fail;
                el.src = src;
            } else if (type === "audio") {
                el = new Audio();
                el.oncanplaythrough = done;
                el.onerror = fail;
                el.src = src;
            } else {
                resolve();
            }
        });
    }

    _updateProgress(loaded, total) {
        const percent = Math.round((loaded / total) * 100);

        this.text.textContent = `Loading... ${percent}%`;
        this.fill.style.width = `${percent}%`;
    }

    /* ================= FINISH ================= */

    async finish(onFinish) {
        const elapsed = performance.now() - this.startTime;
        const remaining = Math.max(this.minDisplayTime - elapsed, 0);

        setTimeout(() => {
            this.text.textContent = "Loading complete";
            this.fill.style.width = "100%";

            setTimeout(() => {
                onFinish?.();
            }, 600);
        }, remaining);
    }

    destroy() {
        this.container.remove();
    }

    /* ================= STATIC ================= */

    static extractTypedAssets(mediaObj) {
        const result = [];

        function recurse(obj) {
            for (const key in obj) {
                const val = obj[key];

                if (typeof val === "string") {
                    for (const ext in EXTENSION_TYPE_MAP) {
                        if (val.endsWith(ext)) {
                            result.push({ src: val, type: EXTENSION_TYPE_MAP[ext] });
                            break;
                        }
                    }
                } else if (typeof val === "object") {
                    recurse(val);
                }
            }
        }

        recurse(mediaObj);
        return result;
    }
}