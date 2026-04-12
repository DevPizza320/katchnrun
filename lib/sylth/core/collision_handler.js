export class CollisionHandler {
    constructor() {
        this.collisionsToCheck = [];
    }

    addEntity(entity) {
        if (this.collisionsToCheck.length < 50 && entity.properties.canCollideWith) {
            this.collisionsToCheck.push(entity);
        } else throw new Error(`Failed to add entity ${entity.properties.id} to the CollisionHandler`);
    }

    removeEntity(entity) {
        const index = this.collisionsToCheck.findIndex(item => item.properties.id === entity.properties.id);
        if (index !== -1) {
            this.collisionsToCheck.splice(index, 1);
        }
    }

    clear() {
        this.collisionsToCheck.length = 0;
    }

    checkCollisions() {
        for (let i = 0; i < this.collisionsToCheck.length; i++) {
            for (let j = i + 1; j < this.collisionsToCheck.length; j++) {
                const entityA = this.collisionsToCheck[i];
                const entityB = this.collisionsToCheck[j];

                // Check if they can collide
                const canACollideWithB = Array.isArray(entityA.properties.canCollideWith) && entityA.properties.canCollideWith.some(id => typeof id === 'string' && entityB.properties.id.includes(id));
                const canBCollideWithA = Array.isArray(entityB.properties.canCollideWith) && entityB.properties.canCollideWith.some(id => typeof id === 'string' && entityA.properties.id.includes(id));

                if (canACollideWithB || canBCollideWithA) {
                    // Check bounding box collision
                    if (this.isColliding(entityA, entityB)) {
                        // Execute callbacks
                        if (typeof entityA.onCollision === 'function') {
                            entityA.onCollision(entityB);
                        }
                        if (typeof entityB.onCollision === 'function') {
                            entityB.onCollision(entityA);
                        }
                    }
                }
            }
        }
    }

    isColliding(entityA, entityB) {
        return entityA.properties.x < entityB.properties.x + entityB.properties.width &&
               entityA.properties.x + entityA.properties.width > entityB.properties.x &&
               entityA.properties.y < entityB.properties.y + entityB.properties.height &&
               entityA.properties.y + entityA.properties.height > entityB.properties.y;
    }
}