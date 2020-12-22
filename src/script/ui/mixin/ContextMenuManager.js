const MENUS = new WeakMap();

export default (CLAZZ) => class extends CLAZZ {

    constructor(...args) {
        super(...args);
        MENUS.set(this, new Map());
    }

    setContextMenu(name, menu) {
        const menus = MENUS.get(this);
        if (this.isConnected) {
            if (menus.has(name)) {
                const oldMenu = menus.get(name);
                oldMenu.remove();
            }
            let el = this;
            while (el.parentElement != null && !el.classList.contains("panel")) {
                el = el.parentElement;
            }
            el.append(menu);
        }
        menus.set(name, menu);
    }

    getContextMenu(name) {
        const menus = MENUS.get(this);
        return menus.get(name);
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        let el = this;
        while (el.parentElement != null && !el.classList.contains("panel")) {
            el = el.parentElement;
        }
        const menus = MENUS.get(this);
        for (const [, menu] of menus) {
            el.append(menu);
        }
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
        const menus = MENUS.get(this);
        for (const [, menu] of menus) {
            menu.remove();
        }
    }

}
