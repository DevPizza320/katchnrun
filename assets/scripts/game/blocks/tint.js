import { context } from "../global.js";

export class Tint {
    /**
     * Apply a tint to any block image.
     * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
     * @param {HTMLImageElement} image - The image to tint.
     * @param {string} tintColor - The tint color (CSS color string).
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @param {number} w - The width.
     * @param {number} h - The height.
     */
    static apply(ctx, image, tintColor, x, y, w, h) {
        ctx.save();
        ctx.drawImage(image, x, y, w + 1, h + 1); // +1 to prevent gaps between blocks
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = tintColor;
        ctx.fillRect(x, y, w, h);
        ctx.globalCompositeOperation = "source-over";
        ctx.restore();
    }
}