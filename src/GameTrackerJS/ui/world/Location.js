/* asym-import: off */
import "/emcJS/ui/Icon.js";
/* asym-import: on */
import WorldStateManager from "../../state/world/WorldStateManager.js";
import WorldElement from "./WorldElement.js";
import "../ctxmenu/LocationContextMenu.js";
import Language from "../../util/Language.js";
import iOSTouchHandler from "../../util/iOSTouchHandler.js";

export default class AbstractLocation extends WorldElement {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("access", event => {
            this.applyAccess(event.data);
        });

        /* context menu */
        this.setContextMenu("main", document.createElement("gt-ctxmenu-location"));
        this.addContextMenuHandler("main", "check", event => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        this.addContextMenuHandler("main", "uncheck", event => {
            const state = this.getState();
            if (state != null) {
                state.value = false;
            }
        });
        
        /* mouse events */
        this.addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                state.value = !state.value;
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            const mnu_ctx = this.getContextMenu("main");
            mnu_ctx.show(event.clientX, event.clientY);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        
        /* fck iOS */
        iOSTouchHandler.register(this);
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/location.svg");
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.dataset.checked = false;
            textEl.dataset.state = "unavailable";
        }
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/location.svg");
        if (state != null) {
            const textEl = this.shadowRoot.getElementById("text");
            if (textEl != null) {
                textEl.dataset.checked = state.value;
            }
            this.applyAccess(state.access, state.value);
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
