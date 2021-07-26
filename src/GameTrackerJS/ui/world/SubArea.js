// frameworks
import "/emcJS/ui/Icon.js";

import WorldStateManager from "../../state/world/WorldStateManager.js";
import WorldElement from "./WorldElement.js";
import "../ctxmenu/AreaContextMenu.js";
import Language from "../../util/Language.js";

export default class AbstractSubArea extends WorldElement {

    constructor(type) {
        super();
        /* --- */
        this.registerStateHandler("access", event => {
            this.applyAccess(event.data);
        });
        this.registerStateHandler("hint", event => {
            this.hint = event.data;
        });
        this.registerGlobal(["state", "options"], event => {
            if (this.isConnected) {
                this.refreshList();
            }
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

    refreshList() {
        // nothing
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    static get observedAttributes() {
        return ["ref"];
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
            }
        }
    }

}
