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
        this.registerStateHandler("visiblity", (event) => {
            this.style.display = event.data ? "" : "none";
        });
        this.registerStateHandler("access", (event) => {
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
            const state = WorldStateManager.get(this.category, this.ref);
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
        this.style.display = state.isVisible() ? "" : "none";
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = AccessStateEnum.getName(access.value);
        this.applyAccess(accessValue.toLowerCase(), access);
    }

    getStateAccess(state) {
        return state.access;
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
                    const state = WorldStateManager.get(this.category, this.ref);
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

    get category() {
        return "\u0000";
    }

}
