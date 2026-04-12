export class AssetManager {
    static assets = new Map();
    static toLoad = 0;
    static loaded = 0;

    /**
     * Loads a manifest of images and audio.
     * @param {Object} manifest { images: { name: path }, audios: { name: path } }
     */
    static async loadAll(manifest) {
        const images = Object.entries(manifest.images || {});
        const audios = Object.entries(manifest.audios || manifest.sounds || {});

        this.toLoad = images.length + audios.length;
        this.loaded = 0;

        const promises = [
            ...images.map(([name, src]) => this._loadImage(name, src)),
            ...audios.map(([name, src]) => this._loadAudio(name, src))
        ];

        return Promise.all(promises);
    }

    static _loadImage(name, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                this.assets.set(name, img);
                this.loaded++;
                resolve(img);
            };
            img.onerror = () => reject(`Failed to load image: ${src}`);
        });
    }

    static _loadAudio(name, src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.src = src;
            // 'oncanplaythrough' is safer for audio to ensure it's buffered
            audio.oncanplaythrough = () => {
                this.assets.set(name, audio);
                this.loaded++;
                resolve(audio);
            };
            audio.onerror = () => reject(`Failed to load audio: ${src}`);
        });
    }

    /** Retrieves a loaded asset by name */
    static get(name) {
        return this.assets.get(name);
    }

    /** Returns loading progress as a float between 0 and 1 */
    static progress() {
        return this.toLoad === 0 ? 1 : this.loaded / this.toLoad;
    }
}