import AbstractElement from "/emcJS/ui/logic/abstract/AbstractElement.js";
import AbstractLiteralValueElement from "/emcJS/ui/logic/abstract/AbstractLiteralValueElement.js";
import TPL from "./LiteralCustom.js.html" assert {type: "html"};
import STYLE from "./LiteralCustom.js.css" assert {type: "css"};

const TPL_CAPTION = "CUSTOM";
const REFERENCE = "custom";

export default class LogicElement extends AbstractLiteralValueElement {

    constructor() {
        super(REFERENCE, TPL_CAPTION);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.shadowRoot.getElementById("body").append(els);
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        if (typeof val != "undefined" && val != null) {
            this.setAttribute("value", val);
        } else {
            this.removeAttribute("value");
        }
    }

    calculate(state = {}) {
        if (state[this.ref] != null) {
            const val = this.value ? +(state[this.ref] == this.value) : +!!state[this.ref];
            this.shadowRoot.getElementById("header").setAttribute("value", val);
            return val;
        } else {
            this.shadowRoot.getElementById("header").setAttribute("value", "0");
            return 0;
        }
    }

    loadLogic(logic) {
        this.ref = logic.ref;
        this.value = logic.value;
        this.category = logic.category;
    }

    toJSON() {
        if (this.value) {
            return {
                type: "state",
                ref: this.ref,
                value: this.value,
                category: this.category
            };
        } else {
            return {
                type: "value",
                ref: this.ref,
                category: this.category
            };
        }
    }

    static get observedAttributes() {
        const attr = AbstractElement.observedAttributes;
        attr.push("ref", "category", "value");
        return attr;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "ref":
            case "value":
                if (oldValue != newValue) {
                    if (typeof newValue == "string") {
                        if (newValue) {
                            this.shadowRoot.getElementById(name).innerHTML = newValue;
                            this.shadowRoot.getElementById(name).classList.remove("blank");
                        } else {
                            this.shadowRoot.getElementById(name).innerHTML = "[blank]";
                            this.shadowRoot.getElementById(name).classList.add("blank");
                        }
                    } else {
                        this.shadowRoot.getElementById(name).innerHTML = "";
                    }
                }
                break;
            case "category":
                if (oldValue != newValue) {
                    if (newValue) {
                        this.shadowRoot.getElementById("header").innerHTML = newValue.toUpperCase();
                    } else {
                        this.shadowRoot.getElementById("header").innerHTML = TPL_CAPTION;
                    }
                }
                break;
        }
    }

}

AbstractElement.registerReference("chest", LogicElement);
AbstractElement.registerReference("skulltula", LogicElement);
AbstractElement.registerReference("item", LogicElement);
AbstractElement.registerReference("skip", LogicElement);
AbstractElement.registerReference("option", LogicElement);
AbstractElement.registerReference("filter", LogicElement);
AbstractElement.registerReference("location", LogicElement);

customElements.define("ootrt-logic-custom", LogicElement);
