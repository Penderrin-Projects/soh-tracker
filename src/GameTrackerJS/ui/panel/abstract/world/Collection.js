// frameworks
import "/emcJS/ui/Icon.js";

import WorldStateManager from "../../state/world/WorldStateManager.js";
import WorldElement from "./WorldElement.js";
import AreaContextMenu from "../ctxmenu/AreaContextMenu.js";
import Language from "../../util/Language.js";

export default class AbstractCollection extends StateDataEventManagerMixin(HTMLElement) {

    constructor(type) {
        super();
        /* --- */
        this.registerStateHandler("access", event => {
            this.applyAccess(event.data);
        });
        this.registerStateHandler("list_update", event => {
            this.refreshList();
        });
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        this.refreshList();
    }
    
    applyAccess(data) {
        super.applyAccess(data);
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
