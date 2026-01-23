export class EntityPool {
    constructor() {
        this.entities = [];
        this.buffer = 50;
        this.ctx = null;
        this.isRunning = false; // Toggle to start/stop the loop
        this.collisionHandler = null; // Optional collision handler
        this.originalWidth = null;
        this.originalHeight = null;
    }

    addEntity(entity) {
        if (this.entities.length <= this.buffer && typeof entity == 'object') {
            this.entities.push(entity);
        } else throw new Error(`Failed to add entity ${entity.properties.id} to the pool`)
    }

    removeEntity(entity) {
        const index = this.entities.findIndex(item => item.properties.id === entity.properties.id);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }

    clear() {
        this.entities.length = 0;
    }

    setOriginalSize() {
        if (this.ctx) {
            this.originalWidth = this.ctx.canvas.width;
            this.originalHeight = this.ctx.canvas.height;
        }
    }

    /**
     * Resizes all entities based on the change in canvas dimensions
     * Uses k as the scaling factor calculated from original to current canvas size
     */
    resizeAll() {
        if (!this.ctx || !this.originalWidth || !this.originalHeight) return;

        const currentWidth = this.ctx.canvas.width;
        const currentHeight = this.ctx.canvas.height;

        const kx = currentWidth / this.originalWidth;
        const ky = currentHeight / this.originalHeight;

        // Use average scaling factor for uniform scaling
        const k = (kx + ky) / 2;

        this.entities.forEach(entity => {
            entity.properties.width *= k;
            entity.properties.height *= k;
            entity.properties.x *= k;
            entity.properties.y *= k;

            // Update ground level for entities that have it (like Player)
            if (entity.groundY !== undefined) {
                entity.groundY *= k;
            }
        });

        // Update original sizes for next resize
        this.originalWidth = currentWidth;
        this.originalHeight = currentHeight;
    }

    /**
     * The Game Loop
     * Clears canvas, updates physics, and draws every frame
     */
    drawAllEntities = () => {
        if (!this.ctx) {
            console.error("Canvas context not set on EntityPool");
            return;
        }

        // 1. Clear the canvas (prevents "smearing" trails)
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // 2. Logic & Rendering Phase
        this.entities.forEach(entity => {
            if (entity && typeof entity.update === 'function') {
                entity.update(); // Update position based on motion/heading
            }
            if (entity && typeof entity.draw === 'function') {
                entity.draw();   // Render the sprite
            }
        });

        // Check collisions if handler is set
        if (this.collisionHandler) {
            this.collisionHandler.checkCollisions();
        }

        // Remove entities that are completely off-screen
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            if (this.isOffScreen(entity)) {
                this.entities.splice(i, 1);
                if (this.collisionHandler) {
                    this.collisionHandler.removeEntity(entity);
                }
            }
        }

        // 3. Schedule next frame (approx. 60-120 FPS depending on monitor)
        if (this.isRunning) {
            requestAnimationFrame(this.drawAllEntities);
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.drawAllEntities();
        }
    }

    stop() {
        this.isRunning = false;
    }

    isOffScreen(entity) {
        const canvas = this.ctx.canvas;
        return entity.properties.x + entity.properties.width < 0 ||
               entity.properties.x > canvas.width ||
               entity.properties.y + entity.properties.height < 0 ||
               entity.properties.y > canvas.height;
    }
}
