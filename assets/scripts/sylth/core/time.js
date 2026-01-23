export class Timer {
    constructor(durationMs, stepMs = 1000, { autoStart = false, loop = false } = {}) {
        this.durationMs = durationMs;
        this.stepMs = stepMs;
        this.remainingMs = durationMs;

        this.intervalId = null;
        this.isPaused = false;
        this.isFinished = false;
        this.isReversed = false;
        this.loop = loop;

        // Callbacks
        this.tickCallbacks = [];
        this.pauseCallbacks = [];
        this.resumeCallbacks = [];
        this.endCallbacks = [];

        // Promise-based end
        this.endedPromise = new Promise((resolve) => {
            this.resolveEnded = resolve;
        });

        if (autoStart) this.begin();
    }

    // 🔹 Core control
    begin() {
        this.stop(); // clear any previous run
        this.remainingMs = this.isReversed ? 0 : this.durationMs;
        this.isPaused = false;
        this.isFinished = false;

        this.intervalId = setInterval(() => {
            if (!this.isPaused) {
                if (this.isReversed) {
                    this.remainingMs += this.stepMs;
                    if (this.remainingMs >= this.durationMs) this._finish();
                } else {
                    this.remainingMs -= this.stepMs;
                    if (this.remainingMs <= 0) this._finish();
                }

                this._triggerTick();
            }
        }, this.stepMs);
    }

    pause() {
        if (!this.isPaused && this.intervalId) {
            this.isPaused = true;
            this._triggerPause();
        }
    }

    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this._triggerResume();
        }
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    reset() {
        this.stop();
        this.remainingMs = this.durationMs;
        this.isPaused = false;
        this.isFinished = false;
    }

    restart() {
        this.reset();
        this.begin();
    }

    reverse() {
        this.isReversed = !this.isReversed;
        console.log(`Timer is now counting ${this.isReversed ? "up" : "down"}`);
    }

    // 🔹 Getters
    getCurrentTime() {
        return Math.max(0, Math.round(this.remainingMs));
    }

    getProgress() {
        return this.isReversed
            ? this.remainingMs / this.durationMs
            : (this.durationMs - this.remainingMs) / this.durationMs;
    }

    getProgressPercent() {
        return Math.round(this.getProgress() * 100);
    }

    getTimeString() {
        const totalSeconds = Math.floor(this.remainingMs / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `${minutes}:${seconds}`;
    }

    isRunning() {
        return !!this.intervalId && !this.isPaused && !this.isFinished;
    }

    hasFinished() {
        return this.isFinished;
    }

    // 🔹 Event registration
    onTick(callback) {
        this.tickCallbacks.push(callback);
    }

    onPause(callback) {
        this.pauseCallbacks.push(callback);
    }

    onResume(callback) {
        this.resumeCallbacks.push(callback);
    }

    onEnded(callback) {
        this.endCallbacks.push(callback);
    }

    // 🔹 Internal helpers
    _triggerTick() {
        this.tickCallbacks.forEach((cb) => cb(this.remainingMs, this.getProgress()));
    }

    _triggerPause() {
        this.pauseCallbacks.forEach((cb) => cb(this.remainingMs));
    }

    _triggerResume() {
        this.resumeCallbacks.forEach((cb) => cb(this.remainingMs));
    }

    _finish() {
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.isFinished = true;

        if (this.loop) {
            this.restart();
        } else {
            this.remainingMs = this.isReversed ? this.durationMs : 0;
            this.endCallbacks.forEach((cb) => cb());
            if (this.resolveEnded) {
                this.resolveEnded();
                this.resolveEnded = null;
            }
        }
    }

    // 🔹 Utility
    toJSON() {
        return JSON.stringify({
            durationMs: this.durationMs,
            remainingMs: this.remainingMs,
            stepMs: this.stepMs,
            isPaused: this.isPaused,
            isReversed: this.isReversed,
            isFinished: this.isFinished,
            loop: this.loop
        });
    }

    static fromJSON(jsonString) {
        const data = JSON.parse(jsonString);
        const timer = new Timer(data.durationMs, data.stepMs, { loop: data.loop });
        timer.remainingMs = data.remainingMs;
        timer.isPaused = data.isPaused;
        timer.isReversed = data.isReversed;
        timer.isFinished = data.isFinished;
        return timer;
    }
}