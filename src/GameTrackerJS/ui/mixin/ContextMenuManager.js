/* asym-import: off */
import {registerMixin} from "/emcJS/util/Mixin.js";
/* asym-import: on */
import ContextMenuCatcher from "../ContextMenuCatcher.js";

const MENUS = new WeakMap();

export default registerMixin((superclass) => class ContextMenuManager extends superclass {

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
            while (!(el instanceof ContextMenuCatcher)) {
                if (el.parentElement != null) {
                    el = el.parentElement;
                } else if (el.getRootNode() != null && el.getRootNode().host != null) {
                    el = el.getRootNode().host;
                } else {
                    break;
                }
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
        while (!(el instanceof ContextMenuCatcher)) {
            if (el.parentElement != null) {
                el = el.parentElement;
            } else if (el.getRootNode() != null && el.getRootNode().host != null) {
                el = el.getRootNode().host;
            } else {
                break;
            }
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

});
