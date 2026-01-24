import { Sprite } from "./sylth/core/sprite.js";
import { Player } from "./classes/entity/player.js";
import { Timer } from "./sylth/core/time.js";
import { Canvas } from "./sylth/core/canvas.js";
import { EntityPool } from "./sylth/core/entity_pool.js";
import { KeyPress } from "./sylth/core/keypress.js";
import { CollisionHandler } from "./sylth/core/collision_handler.js";
import { AudioHandler } from "./sylth/audio/audio_handler.js";
import { loadFromLocalStorage } from "./utils/utils.js";
import { InformationPopup } from "./classes/gui/popups.js";

const main = document.querySelector("main");
const play = document.querySelector(".home_center_play");
const levelStart = document.querySelector(".home_level_start");
const levelSelect = document.querySelector(".home_level-select");
const level = loadFromLocalStorage("levelSettings");

const levelStats = document.querySelector(".level_game-stats");
const levelBegin = document.querySelector(".level_game-begin");

let lost = -1;
let score = -1;

function start() {
    AudioHandler.stopAll();
    AudioHandler.play("./assets/sounds/ambient/menu.mp3", { loop: true });
    document.title = level.name;
    levelStats.style.display = "flex";
    levelBegin.style.display = "flex";

    /* ================= CANVAS ================= */

    const sky = new Canvas();
    sky.z = 9999;
    sky.canvas.style.animation = "sky 240s linear infinite";
    sky.attach();

    const background = new Canvas(
        `url("../../assets/textures/background/${level.img}") no-repeat center center`
    );
    background.z = 10000;
    background.attach();

    const overlay = new Canvas("rgba(0,0,0,.8)");
    const ctx = overlay.canvas.getContext("2d");
    overlay.canvas.style.backdropFilter = "blur(2.5px)";
    overlay.z = 10001;
    overlay.attach();

    const p = (overlay.canvas.width + overlay.canvas.height) / 100;

    /* ================= ENGINE CORE ================= */

    const entityPool = new EntityPool();
    entityPool.ctx = ctx;
    entityPool.setOriginalSize();

    const collisionHandler = new CollisionHandler();
    entityPool.collisionHandler = collisionHandler;

    entityPool.start();

    window.addEventListener("resize", () => {
        entityPool.resizeAll();
    });

    /* ================= UI ================= */

    const ui = {
        player1: {
            lives: document.querySelector(".player-1_lives"),
            score: document.querySelector(".player-1_score")
        },
        player2: {
            lives: document.querySelector(".player-2_lives"),
            score: document.querySelector(".player-2_score")
        }
    };

    const renderLives = (lives) => lives + "💖";

    const updatePlayerUI = (player, index) => {
        const target = index === 1 ? ui.player1 : ui.player2;
        target.lives.textContent = renderLives(player.lives);
        target.score.textContent = player.score.toString();
    };

    /* ================= ENTITY RULES ================= */

    const ENTITY_RULES = {
        monkey: { lives: -1, score: -1000 },
        coconut: { lives: -2, score: 0 },
        banana: { lives: +2, score: 0 },
        sac: { lives: 0, score: +3000 }
    };

    /* ================= PLAYERS ================= */

    let player1 = null;
    let player2 = null;

    const createPlayers = () => {
        player1 = new Player({ left: "a", right: "d", jump: " " });
        player1.setTexture("./assets/textures/entity/player/frog.png");
        player1.ctx = ctx;
        player1.properties.width = 5 * p;
        player1.properties.height = 5 * p;
        player1.properties.x = 5 * p;
        player1.properties.y = overlay.canvas.height - player1.properties.height;
        player1.properties.speed = p / 2;
        player1.setGround(overlay.canvas.height);
        player1.lives = 6;
        player1.score = 0;

        player2 = new Player({
            left: "ArrowLeft",
            right: "ArrowRight",
            jump: "ArrowUp"
        });
        player2.setTexture("./assets/textures/entity/player/red_stocking.png");
        player2.ctx = ctx;
        player2.properties.width = 5 * p;
        player2.properties.height = 5 * p;
        player2.properties.x =
            overlay.canvas.width - player2.properties.width - 5 * p;
        player2.properties.y = overlay.canvas.height - player2.properties.height;
        player2.properties.speed = p / 2;
        player2.setGround(overlay.canvas.height);
        player2.lives = 6;
        player2.score = 0;

        entityPool.addEntity(player1);
        entityPool.addEntity(player2);
        collisionHandler.addEntity(player1);
        collisionHandler.addEntity(player2);

        updatePlayerUI(player1, 1);
        updatePlayerUI(player2, 2);
    };

    /* ================= ENTITY SPAWNER ================= */

    const spawnEntity = ({ type, x, y, speed }) => {
        const entity = new Sprite();
        entity.ctx = ctx;

        let dangerous = false, circleColor = "";
        if (type === "monkey" || type === "coconut") {
            dangerous = true;
        } else dangerous = false;

        if (dangerous) {
            circleColor = "#921d1d";
        } else circleColor = "#00ff00";

        entity.enableCircle({
            color: circleColor,
            opacity: 1,
            gradient: true,
            pulse: true
        });

        entity.properties.id = type;
        entity.properties.canCollideWith = ["player"];

        entity.setTexture(`./assets/textures/entity/${type}.png`);

        entity.properties.width = 4 * p;
        entity.properties.height = 4 * p;
        entity.properties.x = x;
        entity.properties.y = y;
        entity.properties.motion.vy = speed;

        let consumed = false;

        entity.onCollision = (other) => {
            if (consumed) return;
            if (!other?.properties?.id?.toLowerCase().includes("player")) return;

            consumed = true;

            const rule = ENTITY_RULES[type];
            if (rule) {
                other.lives = other.lives + rule.lives;
                other.score = other.score + rule.score;

                if (player1.score > player2.score) {
                    score = 2;
                } else score = 1;
            }

            if (other === player1) {
                updatePlayerUI(player1, 1);
                lost = 1;
            }
            if (other === player2) {
                updatePlayerUI(player2, 2);
                lost = 2;
            }

            if (other.lives < 0) {
                alert(`Player ${lost} just lost! Ouch! I wouldn't let that slide.`);
                sky.canvas.remove();
                background.canvas.remove();
                overlay.canvas.remove();
                entityPool.stop();
                AudioHandler.stopAll();
                main.style.pointerEvents = "all";
                main.classList.remove("gentle-fade");
                levelStats.style.display = "none";
                levelBegin.style.display = "none";
                AudioHandler.resumeAll();
                return;
            }

            AudioHandler.play(`./assets/sounds/sfx/${type}.mp3`);

            entityPool.removeEntity(entity);
            collisionHandler.removeEntity(entity);
        };

        entity.update = function () {
            Sprite.prototype.update.call(this);
            if (this.properties.y > overlay.canvas.height) {
                entityPool.removeEntity(this);
                collisionHandler.removeEntity(this);
            }
        };

        entityPool.addEntity(entity);
        collisionHandler.addEntity(entity);
    };

    /* ================= SPAWN LOOP ================= */

    let spawnInterval = null;

    const startSpawning = () => {
        if (spawnInterval) return;

        spawnInterval = setInterval(() => {
            const types = ["monkey", "banana", "sac", "coconut"];
            const type = types[Math.floor(Math.random() * types.length)];

            spawnEntity({
                type,
                x: Math.random() * (overlay.canvas.width - 4 * p),
                y: -4 * p,
                speed: p / 6
            });
        }, 900);
    };

    /* ================= START ================= */

    const WAIT = new Timer(30000, 1000);
    const GAME_OVER = new Timer(360000, 1000);
    WAIT.begin();
    GAME_OVER.begin();
    const gameBegin = document.querySelector(".level_game-begin");
    const span = gameBegin.querySelector("span");
    const levelTimer = document.querySelector(".level_timer").querySelector("span");

    WAIT.onTick(() => {
        span.textContent = WAIT.getTimeString();
    });

    GAME_OVER.onTick(() => {
        levelTimer.textContent = GAME_OVER.getTimeString();
    });

    WAIT.onEnded(() => {
        gameBegin.style.display = "none";
        overlay.canvas.style.backdropFilter = "";
        overlay.canvas.style.background = "transparent";

        AudioHandler.stopAll();
        AudioHandler.play("../../assets/sounds/ambient/jungle.mp3", { loop: true });

        WAIT.stop();
        createPlayers();
        startSpawning();
    });

    GAME_OVER.onEnded(() => {
        if (lost < 0) {
            alert(`Player ${score} just lost! Ouch! I wouldn't let that slide.`);
        }

        sky.canvas.remove();
        background.canvas.remove();
        overlay.canvas.remove();
        entityPool.stop();
        AudioHandler.stopAll();
        main.style.pointerEvents = "all";
        main.classList.remove("gentle-fade");
        levelStats.style.display = "none";
        levelBegin.style.display = "none";
        AudioHandler.play("../../assets/sounds/ambient/home_0.mp3");
        return;
    });

    const enterKey = new KeyPress("Enter");
    enterKey.onpress = () => {
        gameBegin.style.display = "none";
        overlay.canvas.style.backdropFilter = "";
        overlay.canvas.style.background = "transparent";

        AudioHandler.stopAll();
        AudioHandler.play("../../assets/sounds/ambient/jungle.mp3");

        WAIT.stop();
        createPlayers();
        startSpawning();
    };
    enterKey.listen();
}

/* ================= MENU ================= */
levelSelect.parentNode.style.display = "none";
play.addEventListener("click", () => {
    levelSelect.parentNode.style.display = "grid";
});

levelStart.addEventListener("click", () => {
    levelSelect.style.display = "none";
    main.style.pointerEvents = "none";
    main.classList.add("gentle-fade");

    const animationEndHandler = () => {
        start();
        main.removeEventListener("animationend", animationEndHandler);
        main.classList.remove("gentle-fade");
    };

    main.addEventListener("animationend", animationEndHandler);
});