// frameworks
import "/emcJS/ui/Icon.js";

import WorldStateManager from "../../state/world/WorldStateManager.js";
import WorldElement from "./WorldElement.js";
import LocationContextMenu from "../ctxmenu/LocationContextMenu.js";
import Language from "../../util/Language.js";

export default class AbstractLocation extends WorldElement {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("access", event => {
            this.applyAccess(event.data);
        });

        /* context menu */
        this.setDefaultContextMenu(LocationContextMenu);
        this.addDefaultContextMenuHandler("check", event => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                state.value = false;
            }
        });
    }

    clickHandler(event) {
        const state = this.getState();
        if (state != null) {
            state.value = !state.value;
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/location.svg");
        this.applyAccess("unavailable");
        const badge = this.shadowRoot.getElementById("badge");
        if (badge instanceof Badge) {
            badgeEl.hideValues = true;
        }
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/location.svg");
        if (state != null) {
            this.applyAccess(state.access);
        }
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
