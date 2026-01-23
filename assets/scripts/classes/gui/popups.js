export class Popup {
    constructor({ size, icon, warning, message }) {
        this.size = size;
        this.icon = icon;
        this.warning = warning;
        this.message = message;

        this.background = document.createElement("div");
        this.background.classList.add("popup-background");
        this.background.style.position = "fixed";
        this.background.style.top = "0";
        this.background.style.left = "0";
        this.background.style.width = "100vw";
        this.background.style.height = "100vh";
        this.background.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
        this.background.style.backdropFilter = "blur(5px)";
        this.background.style.zIndex = "999";
        this.background.style.display = "none";

        this.root = document.createElement("div");
        this.root.classList.add("popup-window");
        this.root.style.width = `${this.size}vw`;
        this.root.style.display = "none";
        this.root.style.zIndex = "1000";

        this.root.innerHTML = `
            <div class="popup-window-top">
                <img class="popup-window-icon" src="${this.icon}" alt="Icon">
            </div>

            <div class="popup-window-bottom">
                <span class="popup-window-warning">${this.warning}</span>
                <span class="popup-window-message themed-text-wooden">${this.message}</span>

                <div class="popup-window-options"></div>
            </div>
        `;

        document.body.appendChild(this.background);
        document.body.appendChild(this.root);
    }

    show() {
        this.background.style.display = "block";
        this.root.style.display = "flex";
        document.body.style.pointerEvents = "none";
        this.root.style.pointerEvents = "auto";
    }


    hide() {
        this.background.style.display = "none";
        this.root.style.display = "none";
        document.body.style.pointerEvents = "auto";
    }

    remove() {
        this.background.remove();
        this.root.remove();
        document.body.style.pointerEvents = "auto";
    }
}

export class ConfirmationPopup extends Popup {
    constructor({ size, icon, warning, message }) {
        super({ size, icon, warning, message });

        const options = this.root.querySelector(".popup-window-options");
        options.innerHTML = `
            <button class="popup-yes themed-text-wooden button-press">Yes</button>
            <button class="popup-no themed-text-wooden button-press">No</button>
        `;
    }

    onAccept(callback) {
        this.root.querySelector(".popup-yes")
            .addEventListener("click", callback);
    }

    onDecline(callback) {
        this.root.querySelector(".popup-no")
            .addEventListener("click", callback);
    }
}

export class InformationPopup extends Popup {
    constructor({ size, icon, warning, message }) {
        super({ size, icon, warning, message });

        const options = this.root.querySelector(".popup-window-options");
        options.innerHTML = `
            <button class="popup-ok themed-text-wooden button-press">OK</button>
        `;
    }

    onOK(callback) {
        this.root.querySelector(".popup-ok")
            .addEventListener("click", callback);
    }
}