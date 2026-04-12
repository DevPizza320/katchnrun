import { Sprite } from "../../../lib/sylth/core/sprite.js";
import { camera, blockSize } from "../game/global.js";

export class Nametag extends Sprite {
    constructor(name = "Player") {
        super();
        this.name = name;
        this.isFollowing = null; // should be set to a Sprite instance
        this.followOffsetX = null;
        this.followOffsetY = null;

        // visual defaults
        this.properties.x = 0;
        this.properties.y = 0;
        this.properties.fallbackFill = "rgba(0,0,0,.6)";
        this.textColor = "#ffffff";
        this.font = `${Math.floor(window.innerWidth / 100 + window.innerHeight / 100)}px Pixel`;
        this.padding = 6;
        this.radius = 4;

        // size will be computed from the text
        this.properties.width = 0;
        this.properties.height = 0;
        this.properties.zIndex = 101; 
        this.removeOnOffScreen = false;
    }

    /**
     * Set the sprite this nametag should follow.
     * @param {Sprite} target
     * @param {Object} options
     * @param {number|null} options.offsetX - explicit X offset (overrides centering)
     * @param {number|null} options.offsetY - explicit Y offset (overrides default above-head offset)
     */
    setFollowing(target, { offsetX = null, offsetY = null } = {}) {
        this.isFollowing = target;
        this.followOffsetX = offsetX;
        this.followOffsetY = offsetY;
    }

    /**
     * Measure the text and update width/height so positioning can be accurate.
     */
    measure() {
        if (!this.ctx) return;
        this.ctx.save();
        this.ctx.font = this.font;
        const metrics = this.ctx.measureText(this.name || "");
        const textWidth = metrics.width || 0;
        const match = this.font.match(/(\d+)px/);
        const textHeight = match ? parseInt(match[1], 10) : 12;

        this.properties.width = Math.ceil(textWidth + this.padding * 2);
        this.properties.height = Math.ceil(textHeight + this.padding);
        this.ctx.restore();
    }

    update() {
        // ensure we have accurate size before positioning
        this.measure();

        if (this.isFollowing && this.isFollowing.properties) {
            const t = this.isFollowing.properties;

            const defaultOffsetX = (t.width - this.properties.width) / 2;
            const defaultOffsetY = -this.properties.height - 6; // sit a bit above the sprite

            const ox = this.followOffsetX !== null ? this.followOffsetX : defaultOffsetX;
            const oy = this.followOffsetY !== null ? this.followOffsetY : defaultOffsetY;

            this.properties.x = t.x + ox;
            this.properties.y = t.y + oy;

            // copy motion for smoother relative movement (optional)
            if (this.isFollowing.properties.motion) {
                this.properties.motion.vx = this.isFollowing.properties.motion.vx;
                this.properties.motion.vy = this.isFollowing.properties.motion.vy;
            } else {
                this.properties.motion.vx = 0;
                this.properties.motion.vy = 0;
            }
        } else {
            // default behavior (falls back to Sprite update which applies motion)
            super.update();
        }
    }

    draw() {
        if (!this.ctx) {
            throw new Error(`Failed to draw nametag ${this.name}: No context was found`);
        }

        // ensure size is up-to-date before drawing
        this.measure();

        const cameraOffsetX = (camera?.startX ?? 0) * blockSize;

        // Calculate screen position
        const screenX = this.properties.x - cameraOffsetX;
        const screenY = this.properties.y * .96;

        const { width, height, fallbackFill } = this.properties;

        this.ctx.save();

        // background rounded rectangle
        this.ctx.fillStyle = fallbackFill;
        this._roundRect(this.ctx, screenX, screenY, width, height, this.radius);
        this.ctx.fill();

        // text
        this.ctx.fillStyle = this.textColor;
        this.ctx.font = this.font;
        this.ctx.textBaseline = "top";
        this.ctx.fillText(this.name, screenX + this.padding, screenY + (this.padding / 2));

        this.ctx.restore();
    }

    _roundRect(ctx, x, y, w, h, r) {
        if (r < 0) r = 0;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
}