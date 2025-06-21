import AbstractElement from "/emcJS/ui/logic/abstract/AbstractElement.js";
import AbstractLiteralValueElement from "/emcJS/ui/logic/abstract/AbstractLiteralValueElement.js";
import TPL from "./LiteralFunction.js.html" assert {type: "html"};
import STYLE from "./LiteralFunction.js.css" assert {type: "css"};

const TPL_CAPTION = "FUNCTION";
const REFERENCE = "function";

export default class LogicElement extends AbstractLiteralValueElement {

    constructor() {
        super(REFERENCE, TPL_CAPTION);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.shadowRoot.getElementById("header").append(els);
        /*this.shadowRoot.getElementById("view").addEventListener("click", (event) => {
            let title = this.ref;
            LogicViewer.show(this.ref, title);
        });*/
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

    static get observedAttributes() {
        const attr = AbstractElement.observedAttributes;
        attr.push("ref", "type");
        return attr;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "ref":
                if (oldValue != newValue) {
                    if (typeof newValue == "string") {
                        if (newValue) {
                            this.shadowRoot.getElementById("ref").innerHTML = newValue;
                            this.shadowRoot.getElementById("ref").classList.remove("blank");
                        } else {
                            this.shadowRoot.getElementById("ref").innerHTML = "[blank]";
                            this.shadowRoot.getElementById("ref").classList.add("blank");
                        }
                    } else {
                        this.shadowRoot.getElementById("ref").innerHTML = "";
                    }
                }
                break;
        }
    }

}

AbstractElement.registerReference(REFERENCE, LogicElement);
customElements.define(`ootrt-logic-${REFERENCE}`, LogicElement);
