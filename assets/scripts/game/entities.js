import { Sprite } from "../../../lib/sylth/core/sprite";

class Entity extends Sprite {
    constructor() {
        this.properties = {
            stats: { score: 0, lives: 0 },
            multipliers: { score: 1, lives: 1 }
        }
    }
}

class Monkey extends Entity {
    constructor() {
        super();
        this.properties = {
            stats: { score: 0, lives: 0 },
            multipliers: { score: -1000, lives: -1 }
        }
    }
}

class Coconut extends Entity {
    constructor() {
        super();
        this.properties = {
            stats: { score: 0, lives: 0 },
            multipliers: { score: 0, lives: -1 }
        }
    }
}

class Banana extends Entity {
    constructor() {
        super();
        this.properties = {
            stats: { score: 0, lives: 0 },
            multipliers: { score: 0, lives: 2 }
        }
    }
}

class Sac extends Entity {
    constructor() {
        super();
        this.properties = {
            stats: { score: 0, lives: 0 },
            multipliers: { score: 2500, lives: 1 }
        }
    }
}

export { Monkey, Coconut, Banana, Sac };