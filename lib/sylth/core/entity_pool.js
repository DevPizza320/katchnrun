export class EntityPool {
    constructor() {
        this.entities = [];
        this.buffer = 500;
        this.ctx = null;
        this.isRunning = false; // Toggle to start/stop the loop
        this.collisionHandler = null; // Optional collision handler
        this.originalWidth = null;
        this.originalHeight = null;
        this.updateCallbacks = [];
        this.drawCallbacks = [];
    }

    addEntity(entity) {
        if (this.entities.length <= this.buffer && typeof entity == 'object') {
            this.entities.push(entity);
        } else throw new Error(`Failed to add entity ${entity.properties.id} to the pool`)
    }

    // Inside entity_pool.js
    removeEntity(entity) {
        // indexOf checks if the EXACT object is the same in memory
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }

    getEntity(id) {
        return this.entities.find(entity => entity.properties.id === id);
    }

    clear() {
        this.entities.length = 0;
    }

    setOriginalSize() {
        if (this.ctx) {
            const canvas = this.ctx.canvas;
            const dpr = window.devicePixelRatio || 1;
            this.originalWidth = (canvas.width / dpr);
            this.originalHeight = (canvas.height / dpr);
        }
    }

    /**
     * Resizes all entities based on the change in canvas dimensions
     * Uses k as the scaling factor calculated from original to current canvas size
     */
    resizeAll() {
        if (!this.ctx || !this.originalWidth || !this.originalHeight) return;

        const canvas = this.ctx.canvas;
        const dpr = window.devicePixelRatio || 1;

        const currentWidth = (canvas.width / dpr);
        const currentHeight = (canvas.height / dpr);

        const kx = currentWidth / this.originalWidth;
        const ky = currentHeight / this.originalHeight;

        this.entities.forEach(entity => {
            // Scale width and height based on previous ratio
            entity.properties.width *= kx;
            entity.properties.height *= ky;
            // Scale position to adapt to new canvas size
            entity.properties.x *= kx;
            entity.properties.y *= ky;

            // Update ground level for entities that have it (like Player)
            if (entity.groundY !== undefined) {
                entity.groundY *= ky;
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

        const canvas = this.ctx.canvas;
        const dpr = canvas.width / (canvas.clientWidth || canvas.width) || 1;
        this.ctx.clearRect(0, 0, Math.floor(canvas.width / dpr), Math.floor(canvas.height / dpr));

        this.updateCallbacks.forEach(callback => {
            if (typeof callback === 'function') callback();
        });

        // --- GENERAL FIX START ---
        // Sort entities based on zIndex. 
        // If zIndex is undefined, we default it to 0.
        this.entities.sort((a, b) => {
            const zA = a.properties?.zIndex || 0;
            const zB = b.properties?.zIndex || 0;
            return zA - zB;
        });
        // --- GENERAL FIX END ---

        this.entities.forEach(entity => {
            if (entity && typeof entity.update === 'function') {
                entity.update();
            }
            if (entity && typeof entity.draw === 'function') {
                entity.draw();
            }
        });

        this.drawCallbacks.forEach(callback => {
            if (typeof callback === 'function') callback();
        });

        // Check collisions if handler is set
        if (this.collisionHandler) {
            this.collisionHandler.checkCollisions();
        }

        // Remove or notify entities that are completely off-screen
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            const off = this.isOffScreen(entity);

            if (off && entity.removeOnOffScreen) {
                this.entities.splice(i, 1);
                if (this.collisionHandler) {
                    this.collisionHandler.removeEntity(entity);
                }
                continue;
            }

            // If the entity is off-screen but should not be removed, call its callback once
            if (off && !entity.removeOnOffScreen) {
                if (typeof entity.onOffScreen === "function" && !entity._offscreenTriggered) {
                    try {
                        entity.onOffScreen(entity);
                    } catch (err) {
                        console.error('Error in onOffScreen callback for', entity, err);
                    }
                    entity._offscreenTriggered = true;
                }
            } else if (!off && entity._offscreenTriggered) {
                // Reset trigger when entity comes back on-screen
                entity._offscreenTriggered = false;
            }
        }

        // 3. Schedule next frame (approx. 60-120 FPS depending on monitor)
        if (this.isRunning) {
            requestAnimationFrame(this.drawAllEntities);
        }
    }

    addUpdateCallback(callback) {
        if (typeof callback === 'function') this.updateCallbacks.push(callback);
    }

    addDrawCallback(callback) {
        if (typeof callback === 'function') this.drawCallbacks.push(callback);
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
        const dpr = canvas.width / (canvas.clientWidth || canvas.width) || 1;
        const cssWidth = Math.floor(canvas.width / dpr);
        const cssHeight = Math.floor(canvas.height / dpr);
        const edge = entity.edgeCheck ? 0 : entity.properties.width;
        // Consider entity off-screen if any part of it lies outside the visible CSS canvas
        return (
            entity.properties.x < 0 ||
            entity.properties.x + edge > cssWidth ||
            entity.properties.y < 0 ||
            entity.properties.y + entity.properties.height > cssHeight
        );
    }
}
