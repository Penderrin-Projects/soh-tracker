// frameworks
import EventBus from "/emcJS/event/EventBus.js";
import "/emcJS/ui/Icon.js";

import WorldStateManager from "../../state/world/WorldStateManager.js";
import WorldElement from "./WorldElement.js";
import "../ctxmenu/AreaContextMenu.js";
import Language from "../../util/Language.js";

export default class AbstractArea extends WorldElement {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("access", event => {
            this.applyAccess(event.data);
        });
        this.registerStateHandler("hint", event => {
            this.hint = event.data;
        });

        /* context menu */
        this.setDefaultContextMenu(document.createElement("gt-ctxmenu-area"));
        this.addDefaultContextMenuHandler("check", event => {
            const state = this.getState();
            if (state != null) {
                state.setAllEntries(true);
            }
        });
        this.addDefaultContextMenuHandler("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                state.setAllEntries(false);
            }
        });
        this.addDefaultContextMenuHandler("setwoth", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "woth";
            }
        });
        this.addDefaultContextMenuHandler("setbarren", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "barren";
            }
        });
        this.addDefaultContextMenuHandler("clearhint", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "";
            }
        });
    }

    clickHandler(event) {
        EventBus.trigger("location_change", {
            name: this.ref
        });
    }

    getMainContextMenuEntries() {
        // empty
    }
    
    applyAccess(data) {
        super.applyAccess(data);
        /* entrances */
        const entrancesEl = this.shadowRoot.getElementById("entrances");
        if (entrancesEl != null) {
            entrancesEl.innerHTML = "";
            if (data.entrances) {
                const el_icon = document.createElement("img");
                el_icon.src = `images/icons/entrance.svg`;
                entrancesEl.append(el_icon);
            }
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/area.svg");
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.dataset.state = "unavailable";
        }
        this.hint = "";
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/area.svg");
        if (state != null) {
            this.hint = state.hint;
            this.applyAccess(state.access);
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get hint() {
        return this.getAttribute("hint");
    }

    set hint(val) {
        this.setAttribute("hint", val);
    }

    static get observedAttributes() {
        return ["ref", "hint"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref":
                    {
                        const state = WorldStateManager.getByRef(this.ref);
                        const textEl = this.shadowRoot.getElementById("text");
                        if (textEl != null) {
                            Language.applyLabel(textEl, newValue);
                        }
                        this.switchState(state);
                    }
                    break;
                case "hint":
                    {
                        const hintEl = this.shadowRoot.getElementById("hint");
                        if (hintEl != null) {
                            hintEl.innerHTML = "";
                            if (!!newValue && newValue != "") {
                                const el_icon = document.createElement("img");
                                el_icon.src = `images/icons/area_${newValue}.svg`;
                                hintEl.append(el_icon);
                            }
                        }
                    }
                    break;
            }
        }
    }

}
