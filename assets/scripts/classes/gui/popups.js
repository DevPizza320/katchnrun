export class Popup {
    constructor({ size, icon, warning, message }) {
        this.size = size;
        this.icon = icon;
        this.warning = warning;
        this.message = message;

        this.root = document.createElement("div");
        this.root.classList.add("popup-window");
        this.root.style.width = `${this.size}vw`;
        this.root.style.display = "none";

        this.root.innerHTML = `
            <div class="popup-window-top">
                <img class="popup-window-icon" src="${this.icon}" alt="Icon">
            </div>

            <div class="popup-window-bottom">
                <span class="popup-window-warning">${this.warning}</span>
                <span class="popup-window-message">${this.message}</span>

                <div class="popup-window-options"></div>
            </div>
        `;

        document.body.appendChild(this.root);
    }

    show() {
        this.root.style.display = "flex";
        document.body.style.pointerEvents = "none";
        this.root.style.pointerEvents = "auto";
    }


    hide() {
        this.root.style.display = "none";
        document.body.style.pointerEvents = "auto";
    }

    remove() {
        this.root.remove();
        document.body.style.pointerEvents = "auto";
    }
}

export class ConfirmationPopup extends Popup {
    constructor({ size, icon, warning, message }) {
        super({ size, icon, warning, message });

        const options = this.root.querySelector(".popup-window-options");
        options.innerHTML = `
            <button class="popup-yes">Yes</button>
            <button class="popup-no">No</button>
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
            <button class="popup-ok">OK</button>
        `;
    }

    onOK(callback) {
        this.root.querySelector(".popup-ok")
            .addEventListener("click", callback);
    }
}
