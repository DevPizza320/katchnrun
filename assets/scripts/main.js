import { ConfirmationPopup, InformationPopup } from "./classes/gui/popups.js";
import { show, hide } from "./classes/gui/display.js";
import * as utils from "./utils/utils.js";
import { LoadingScreen } from "./sylth/load/load.js";
import { AudioHandler } from "./sylth/audio/audio_handler.js";

// Note: touch-device warning will be shown later inside the proceed flow

const main = document.querySelector("main");
const version_span = document.querySelector(".home_bottom span");
let mayproceed = false;

const config = await utils.JSON("./config.json");
version_span.textContent = `Katch N' Run ${config.version}. Do not distribute!`;

if (config.maintenance) {
    mayproceed = false;
    const maintenancePopup = new InformationPopup({
        size: 50,
        icon: "./assets/textures/gui/warning.png",
        warning: "Warning!",
        message: "Katch N' Run is temporarily under maintenance. Please try again later."
    });

    maintenancePopup.onOK(() => window.close());
    maintenancePopup.show();
}

if (config.loadingScreen) mayproceed = true;

if (mayproceed) {
    const showProceedPopup = () => {
        const proceedPopup = new ConfirmationPopup({
            size: 50,
            icon: "./assets/textures/gui/warning.png",
            warning: "Proceed to game?",
            message:
                "Katch N' Run is still in development and may contain bugs or incomplete features. Do you wish to proceed?"
        });

        proceedPopup.onAccept(async () => {
            utils.toggleFullscreen();
            proceedPopup.hide();
            proceedPopup.remove();

            const loadingScreen = new LoadingScreen({
                tips: [
                    "Standing still can save you from the Warden...",
                    "Some skins have hidden advantages.",
                    "Every run makes you better."
                ],
                backgroundImage: "./assets/textures/background/load.png",
                minDisplayTime: 1000,
                startSound: null,
                classNames: {
                    container: "loading-screen",
                    text: "loader-text",
                    bar: "loader-bar",
                    fill: "loader-fill",
                    tip: "loader-tip"
                }
            });

            const container = loadingScreen.container;

            await loadingScreen.loadAssetsFromJSON("./asset_paths.json");

            loadingScreen.finish(() => {
                container.classList.add("fade");
                setTimeout(() => {
                    container.remove();
                    AudioHandler.play("../assets/sounds/ambient/home_0.mp3", { volume: 1, loop: true });
                    show(main);
                }, 5000);
            });
        });

        proceedPopup.onDecline(() => {
            proceedPopup.hide();
            window.close();
        });

        proceedPopup.show();
    };

    if (utils.isTouchDevice()) {
        const touchPopup = new InformationPopup({
            size: 50,
            icon: "./assets/textures/gui/warning.png",
            warning: "Warning!",
            message:
                "Katch N' Run does not yet support touch screen devices, and the game experience won't be optimal. Playing with a connected keyboard may work. Do you wish to continue?"
        });

        touchPopup.onOK(() => {
            touchPopup.hide();
            touchPopup.remove();
            showProceedPopup();
        });

        touchPopup.show();
    } else {
        showProceedPopup();
    }
}