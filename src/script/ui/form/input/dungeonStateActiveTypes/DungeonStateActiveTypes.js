import CustomFormElementDelegating from "/emcJS/ui/element/CustomFormElementDelegating.js";
import FormElementRegistry from "/emcJS/data/registry/form/FormElementRegistry.js";
import {
    deepClone
} from "/emcJS/util/helper/DeepClone.js";
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";
import {
    safeSetAttribute
} from "/emcJS/util/helper/ui/NodeAttributes.js";
import "/emcJS/ui/input/ListSelect.js";
import TPL from "./DungeonStateActiveTypes.js.html" assert {type: "html"};
import STYLE from "./DungeonStateActiveTypes.js.css" assert {type: "css"};
import CONFIG_FIELDS from "./DungeonStateActiveTypes.js.json" assert {type: "json"};

export default class DungeonStateActiveTypes extends CustomFormElementDelegating {

    static get formConfigurationFields() {
        return deepClone(CONFIG_FIELDS);
    }

    #value;

    #inputEl;

    #selectionEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#selectionEl = this.shadowRoot.getElementById("selection");
        this.#inputEl.addEventListener("change", () => {
            const value = this.#inputEl.value;
            if (value === "custom") {
                this.#inputEl.classList.add("append-bottom");
                this.#selectionEl.classList.add("active");
                this.value = this.#selectionEl.value;
            } else {
                this.#inputEl.classList.remove("append-bottom");
                this.#selectionEl.classList.remove("active");
                this.value = "";
            }
        });
        this.#selectionEl.addEventListener("change", () => {
            const value = this.#inputEl.value;
            if (value === "custom") {
                this.value = this.#selectionEl.value;
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();
        const value = this.value;
        this.#applyValue(value);
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#selectionEl.disabled = disabled;
    }

    formResetCallback() {
        super.formResetCallback();
        const value = this.value;
        this.#applyValue(value);
    }

    set value(value) {
        if (value !== "" && !Array.isArray(value)) {
            value = "";
        }
        if (!isEqual(this.#value, value)) {
            this.#applyValue(value);
            this.#value = value;
            this.internals.setFormValue(value);
            /* --- */
            this.dispatchEvent(new Event("change"));
        }
    }

    get value() {
        return this.#value;
    }

    set readonly(val) {
        this.setBooleanAttribute("readonly", val);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    static get observedAttributes() {
        return ["name", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "name":{
                if (oldValue != newValue) {
                    this.#selectionEl.name = newValue;
                }
            } break;
            case "value": {
                if (oldValue != newValue) {
                    this.#applyValueAttribute(newValue);
                    if (!this.isChanged) {
                        this.#applyValue(this.value);
                    }
                }
            } break;
        }
    }

    #applyValue(value) {
        if (Array.isArray(value)) {
            this.#inputEl.value = "custom";
            this.#selectionEl.classList.add("active");
            this.#selectionEl.value = value;
        } else {
            this.#inputEl.value = "default";
            this.#selectionEl.classList.remove("active");
        }
    }

    #applyValueAttribute(value) {
        if (Array.isArray(value)) {
            this.#inputEl.value = "custom";
            this.#selectionEl.classList.add("active");
            safeSetAttribute(this.#selectionEl, "value", value);
        } else {
            this.#inputEl.value = "default";
            this.#selectionEl.classList.remove("active");
        }
    }

}

FormElementRegistry.register("DungeonStateActiveTypes", DungeonStateActiveTypes);
customElements.define("ootrt-input-dungeonstateactivetype", DungeonStateActiveTypes);
