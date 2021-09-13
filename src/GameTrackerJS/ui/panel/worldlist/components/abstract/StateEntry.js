// frameworks
import { mix } from "/emcJS/util/Mixin.js";

import AccessStateEnum from "../../../../../enum/AccessStateEnum.js";
import WorldStateManager from "../../../../../state/world/WorldStateManager.js";
import StateDataEventManagerMixin from "../../../../mixin/StateDataEventManager.js";
import WorldListEntry from "./Entry.js";

const BaseClass = mix(
    WorldListEntry
).with(
    StateDataEventManagerMixin
);

export default class WorldListStateEntry extends BaseClass {

    constructor() {
        super();
        /* state handler */
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
        /* access */
        this.applyAccess();
    }

    applyStateValues(state) {
        /* access */
        const access = this.getStateAccess(state);
        const accessValue = AccessStateEnum.getName(access.value);
        this.applyAccess(accessValue.toLowerCase(), access);
    }

    getStateAccess(state) {
        return state.access;
    }
    
    applyAccess(value = "undefined", data = {}) {
        this.access = value;
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get access() {
        return this.getAttribute("access");
    }

    set access(val) {
        this.setAttribute("access", val);
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
        const ref = this.ref;
        const cat = this.category;
        return cat ? `${cat}[${ref}]` : ref;
    }

}
