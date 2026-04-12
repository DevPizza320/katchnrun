export class Block {
    constructor(config = {}) {
        // 1. Ensure config exists to avoid "cannot read property of undefined"
        this.name = config.name || "Unknown";
        this.type = config.type;
        this.textureName = config.texture || null;

        this.imageLoaded = false;
        this.image = new Image();

        // 2. Only load if a texture name was actually provided
        if (this.textureName && this.textureName !== "air") {
            this.applyTexture(this.textureName);
        } else {
            // Air or invisible blocks are "loaded" by default since there's no file
            this.imageLoaded = true;
        }
    }

    applyTexture(name) {
        // DOUBLE CHECK YOUR PATH HERE: 
        // Is it ./assets/textures/ or ../assets/textures/?
        this.image.src = `./assets/textures/block/${name}.png`;

        this.image.onload = () => {
            this.imageLoaded = true;
        };

        this.image.onerror = () => {
            console.error(`Failed to load texture: ${name} at ${this.image.src}`);
        };
    }
}