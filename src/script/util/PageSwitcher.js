// frameworks
import NavBar from "/emcJS/ui/navigation/NavBar.js";
import HotkeyHandler from "/emcJS/util/HotkeyHandler.js";
import KeyInput from "/emcJS/ui/input/KeyInput.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";

const NAV = document.querySelector("emc-navbar");
const PAGER = document.getElementById("view-pager");
const NAVIGATION = new Map();
const DEFAULT_HOTKEYS = new Map();
const HOTKEYS = new Map();
const ACTIVE_HOTKEYS = new Set();

class PageSwitcher {

    constructor() {
        SettingsStorage.addEventListener("change", (event) => {
            for (const name of ACTIVE_HOTKEYS) {
                if (event.changes[name] != null) {
                    const hotkey = event.changes[name].newValue;
                    HotkeyHandler.setConfig(name, KeyInput.parseKeys(hotkey));
                }
            }
        });
    }

    register(name, navConfig, hotkeyConfig) {
        NAVIGATION.set(name, navConfig);
        HOTKEYS.set(name, hotkeyConfig);
    }

    switch(name) {
        PAGER.active = name;
        /* navigation */
        if (NAVIGATION.has(name)) {
            NAV.loadNavigation(NAVIGATION.get(name));
        } else {
            NAV.loadNavigation([]);
        }
        /* hotkeys */
        HotkeyHandler.clear();
        ACTIVE_HOTKEYS.clear();
        for (const [name, handler] of DEFAULT_HOTKEYS) {
            this.#registerHotkey(name, handler);
        }
        if (HOTKEYS.has(name)) {
            const hotkeys = HOTKEYS.get(name);
            for (const name in hotkeys) {
                const handler = hotkeys[name];
                if (typeof handler === "function") {
                    this.#registerHotkey(name, handler);
                }
            }
        }
    }

    #registerHotkey(name, handler) {
        const hotkey = SettingsStorage.get(name) ?? "";
        if (hotkey) {
            HotkeyHandler.setAction(name, handler, KeyInput.parseKeys(hotkey));
        } else {
            HotkeyHandler.setAction(name, handler);
        }
        ACTIVE_HOTKEYS.add(name);
    }

    addNavigationMixin(name, config) {
        NavBar.addMixin(name, config);
    }

    addHotkeyHandler(name, handler) {
        if (typeof handler === "function") {
            DEFAULT_HOTKEYS.set(name, handler);
            if (!ACTIVE_HOTKEYS.has(name)) {
                this.#registerHotkey(name, handler);
            }
        }
    }

}

export default new PageSwitcher();
