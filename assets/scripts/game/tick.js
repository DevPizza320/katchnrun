export class ClientTick {
    static calls = new Map();
    static isRunning = false;

    static addCall(name, call) {
        this.calls.set(name, call);
        
        // Auto-start if we just added the first call
        if (!this.isRunning) {
            this.isRunning = true;
            requestAnimationFrame((t) => this.executeAll(t));
        }
    }

    static removeCall(name) {
        this.calls.delete(name);
    }

    static executeAll(timestamp) {
        // 1. If no calls left, stop the loop
        if (this.calls.size === 0) {
            this.isRunning = false;
            return;
        }

        // 2. Run every function in the map
        this.calls.forEach(fn => fn(timestamp));

        // 3. Request the next frame (recursive call)
        requestAnimationFrame((t) => this.executeAll(t));
    }
}