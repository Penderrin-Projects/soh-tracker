// frameworks
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import {createMixin} from "/emcJS/util/Mixin.js";

import ContextMenuCatcher from "../ContextMenuCatcher.js";

const DEFAULT_MENU_ID = "main";
const MENU_CLASSES = new WeakMap();
const MENUS = new WeakMap();
const EVENT_MANAGERS = new WeakMap();

function getCatcherEl(target) {
    if (!(target instanceof ContextMenuCatcher)) {
        if (target.parentElement != null) {
            return getCatcherEl(target.parentElement);
        }
        if (target.getRootNode()?.host != null) {
            return getCatcherEl(target.getRootNode().host);
        }
    }
    return target;
}

function getEventManager(target, name) {
    const eventManagers = EVENT_MANAGERS.get(target);
    if (!eventManagers.has(name)) {
        const manager = new EventTargetManager();
        eventManagers.set(name, manager);
        return manager;
    } else {
        return eventManagers.get(name);
    }
}

export default createMixin((superclass) => class ContextMenuManager extends superclass {

    constructor(...args) {
        super(...args);
        MENUS.set(this, new Map());
        MENU_CLASSES.set(this, new Map());
        EVENT_MANAGERS.set(this, new Map());
    }

    get defaultContextMenuId() {
        return DEFAULT_MENU_ID;
    }

    setDefaultContextMenu(MenuClass) {
        this.setContextMenu(DEFAULT_MENU_ID, MenuClass);
    }

    getDefaultContextMenu() {
        return this.getContextMenu(DEFAULT_MENU_ID);
    }

    addDefaultContextMenuHandler(event, handler) {
        this.addContextMenuHandler(DEFAULT_MENU_ID, event, handler);
    }

    setContextMenu(name, MenuClass) {
        const menus = MENUS.get(this);
        const menuClasses = MENU_CLASSES.get(this);
        menuClasses.set(name, MenuClass);
        const manager = getEventManager(this, name);
        if (menus.has(name)) {
            const oldMenu = menus.get(name);
            if (!(oldMenu instanceof MenuClass)) {
                oldMenu.remove();
                manager.switchTarget(null);
            }
        }
    }

    getContextMenu(name) {
        const menus = MENUS.get(this);
        if (menus.has(name)) {
            return menus.get(name);
        }
        const menuClasses = MENU_CLASSES.get(this);
        const MenuClass = menuClasses.get(name);
        const ctxMnu = new MenuClass();
        menus.set(name, ctxMnu);
        /* --- */
        const manager = getEventManager(this, name);
        manager.switchTarget(ctxMnu);
        /* --- */
        if (this.isConnected) {
            const catcherEl = getCatcherEl(this);
            catcherEl.append(ctxMnu);
        }
        /* --- */
        return ctxMnu;
    }

    addContextMenuHandler(name, event, handler) {
        const manager = getEventManager(this, name);
        manager.set(event, handler);
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        const catcherEl = getCatcherEl(this);
        const menus = MENUS.get(this);
        for (const [, menu] of menus) {
            catcherEl.append(menu);
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
