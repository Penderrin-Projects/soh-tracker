/* asym-import: off */
import "/emcJS/ui/Icon.js";
/* asym-import: on */
import WorldRegistry from "../../registry/WorldRegistry.js";
import WorldElement from "./WorldElement.js";
import "../ctxmenu/LocationContextMenu.js";
import Language from "../../util/Language.js";
import iOSTouchHandler from "../../util/iOSTouchHandler.js";

export default class AbstractLocation extends WorldElement {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("access", event => {
            const state = this.getState();
            if (state != null) {
                this.applyAccess(event.data, state.value);
            } else {
                this.applyAccess(event.data, false);
            }
        });
        this.registerStateHandler("value", event => {
            const textEl = this.shadowRoot.getElementById("text");
            if (textEl != null) {
                textEl.dataset.checked = event.data;
                const state = this.getState();
                if (state != null) {
                    this.applyAccess(state.access, event.data);
                } else {
                    this.applyAccess(false, event.data);
                }
            }
        });

        /* context menu */
        const mnu_ctx = document.createElement("gt-ctxmenu-location");
        this.setContextMenu("main", mnu_ctx);

        mnu_ctx.addEventListener("check", event => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        mnu_ctx.addEventListener("uncheck", event => {
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
            mnu_ctx.show(event.clientX, event.clientY);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        
        /* fck iOS */
        iOSTouchHandler.register(this);
    }
    
    applyAccess(access, checked) {
        const textEl = this.shadowRoot.getElementById("text");
        const badgeEl = this.shadowRoot.getElementById("badge");
        /* access */
        if (textEl != null) {
            textEl.dataset.state = access ? "available" : "unavailable";
        }
        /* badge */
        if (badgeEl != null) {
            badgeEl.access = checked ? "opened" : access ? "available" : "unavailable";
        }
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
                        const state = WorldRegistry.get(this.ref);
                        const textEl = this.shadowRoot.getElementById("text");
                        if (textEl != null) {
                            textEl.innerHTML = Language.translate(newValue);
                        }
                        this.switchState(state);
                    }
                    break;
            }
        }
    }

}
