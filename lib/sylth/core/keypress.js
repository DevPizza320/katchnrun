export class KeyPress {
    constructor(key, { toggle = false } = {}) {
        this.key = key;
        this.toggle = toggle;

        this.isDown = false;
        this.isToggled = false;

        this.onpress = null;
        this.onlift = null;

        // bind handlers so removeEventListener works
        this._handleDown = this._handleDown.bind(this);
        this._handleUp = this._handleUp.bind(this);
    }

    listen() {
        if (!this.key) {
            throw new Error("No key was specified in the KeyPress event");
        }

        if (!this.onpress) {
            throw new Error("No onpress callback specified");
        }

        document.addEventListener("keydown", this._handleDown);
        document.addEventListener("keyup", this._handleUp);
    }

    stop() {
        document.removeEventListener("keydown", this._handleDown);
        document.removeEventListener("keyup", this._handleUp);
    }

    _handleDown(e) {
        if (e.key !== this.key) return;

        // prevent key repeat spam
        if (this.isDown) return;
        this.isDown = true;

        if (this.toggle) {
            this.isToggled = !this.isToggled;
            this.onpress(this.isToggled, e);
        } else {
            this.onpress(e);
        }
    }

    _handleUp(e) {
        if (e.key !== this.key) return;

        this.isDown = false;

        if (this.onlift) {
            this.onlift(e);
        }
    }
}