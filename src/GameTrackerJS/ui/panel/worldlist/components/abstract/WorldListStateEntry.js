// frameworks
import { mix } from "/emcJS/util/Mixin.js";

import AccessStateEnum from "../../../../../enum/AccessStateEnum.js";
import WorldStateManager from "../../../../../state/world/WorldStateManager.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManager.js";
import WorldListEntry from "./WorldListEntry.js";

const BaseClass = mix(
    WorldListEntry
).with(
    StateDataEventManagerMixin
);

export default class WorldListStateEntry extends BaseClass {

    constructor() {
        super();
        /* state handler */
        this.registerStateHandler("visible", event => {
            const state = this.getState();
            if (state != null) {
                if (state.isVisible()) {
                    this.style.display = "";
                } else {
                    this.style.display = "none";
                }
            }
        });
        this.registerStateHandler("filter", event => {
            const state = this.getState();
            if (state != null) {
                if (state.isVisible()) {
                    this.style.display = "";
                } else {
                    this.style.display = "none";
                }
            }
        });
        this.registerStateHandler("access", event => {
            const accessValue = AccessStateEnum.getName(event.data.value);
            this.applyAccess(accessValue.toLowerCase(), event.data);
        });
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        /* --- */
        if (this.ref) {
            const state = WorldStateManager.getByRef(this.ref);
            this.switchState(state);
            /* text */
            const textEl = this.shadowRoot.getElementById("text");
            if (textEl != null) {
                textEl.i18nValue = this.textRef;
            }
        }
    }

    applyDefaultValues() {
        /* visible */
        this.style.display = "none";
        /* access */
        this.applyAccess("unavailable", {});
    }

    applyStateValues(state) {
        /* visible */
        if (state.isVisible()) {
            this.style.display = "";
        } else {
            this.style.display = "none";
        }
        /* access */
        const accessValue = AccessStateEnum.getName(state.access.value);
        this.applyAccess(accessValue.toLowerCase(), state.access);
    }
    
    applyAccess(value = "unavailable", data = {}) {
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.dataset.state = value;
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
                case "ref": {
                    const state = WorldStateManager.getByRef(this.ref);
                    this.switchState(state);
                    /* text */
                    const textEl = this.shadowRoot.getElementById("text");
                    if (textEl != null) {
                        textEl.i18nValue = this.textRef;
                    }
                } break;
            }
        }
    }

    get textRef() {
        return this.ref;
    }

}
