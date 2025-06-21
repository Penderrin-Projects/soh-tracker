import AbstractElement from "/emcJS/ui/logic/abstract/AbstractElement.js";
import AbstractLiteralValueElement from "/emcJS/ui/logic/abstract/AbstractLiteralValueElement.js";
import TPL from "./LiteralMixin.js.html" assert {type: "html"};
import STYLE from "./LiteralMixin.js.css" assert {type: "css"};

const TPL_CAPTION = "MIXIN";
const REFERENCE = "mixin";

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

}

AbstractElement.registerReference(REFERENCE, LogicElement);
customElements.define(`ootrt-logic-${REFERENCE}`, LogicElement);
