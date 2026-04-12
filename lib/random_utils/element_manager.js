export class ElementManager {
    static addNewElements = true;
    static elements = new Set();
    static _observer = null;

    static init() {
        // Capture initial elements
        const existing = document.querySelectorAll('body [id], body [class]');
        existing.forEach(el => this.elements.add(el));

        if (this.addNewElements && !this._observer) {
            this._observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && (node.id || node.classList.length > 0)) {
                            this.elements.add(node);
                        }
                    });
                }
            });
            this._observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    static getElement(type, value) {
        // type can be 'id' or 'class'
        const selector = type === 'id' ? `#${value}` : `.${value}`;
        return [...this.elements].find(el => el.matches(selector));
    }

    static removeElement(el) {
        if (this.elements.has(el)) {
            el.remove();
            this.elements.delete(el);
        }
    }
}