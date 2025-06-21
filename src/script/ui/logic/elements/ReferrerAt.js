import AbstractElement from "/emcJS/ui/logic/abstract/AbstractElement.js";
import AbstractLiteralValueElement from "/emcJS/ui/logic/abstract/AbstractLiteralValueElement.js";
import TPL from "./ReferrerAt.js.html" assert {type: "html"};
import STYLE from "./ReferrerAt.js.css" assert {type: "css"};

const TPL_CAPTION = "AT";
const REFERENCE = "at";

export default class LogicElement extends AbstractLiteralValueElement {

    #placeholderEl;

    constructor() {
        super(REFERENCE, TPL_CAPTION);
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#placeholderEl = this.shadowRoot.getElementById("droptarget");
        this.#placeholderEl.ondragover = AbstractElement.allowDrop;
        this.#placeholderEl.ondrop = AbstractElement.dropOnPlaceholder;
        this.#placeholderEl.onclick = (event) => {
            const e = new Event("placeholderclicked", {
                bubbles: true,
                cancelable: true
            });
            this.dispatchEvent(e);
            event.stopPropagation();
        };
    }

    calculate(state = {}) {
        let value;
        const ch = this.children;
        if (ch[0]) {
            value = +(!!state[this.ref] && ch[0].calculate(state));
        } else {
            value = +!!state[this.ref];
        }
        this.shadowRoot.getElementById("header").setAttribute("value", value);
        return value;
    }

    toJSON() {
        return {
            type: REFERENCE,
            node: this.ref,
            content: Array.from(this.children).slice(0, 1).map((e) => e.toJSON())[0]
        };
    }

    loadLogic(logic) {
        if (!!logic && !!logic.content) {
            this.ref = logic.node;
            let cl;
            if (logic.content.category) {
                cl = AbstractElement.getReference(logic.content.category, logic.content.type);
            } else {
                cl = AbstractElement.getReference(logic.content.type);
            }
            const el = new cl;
            el.loadLogic(logic.content);
            this.append(el);
        }
    }

    get childList() {
        const ch = Array.from(this.children).filter((node) => node instanceof AbstractElement);
        if (ch.length) {
            return [ch[0]];
        }
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "disabled":
            case "template": {
                if (oldValue != newValue) {
                    if (this.editable) {
                        this.#placeholderEl.disabled = false;
                    } else {
                        this.#placeholderEl.disabled = true;
                    }
                }
            } break;
        }
    }

    checkValidity() {
        return this.childList.length === 1 && this.childList[0].checkValidity();
    }

}

AbstractElement.registerReference(REFERENCE, LogicElement);
customElements.define(`ootrt-logic-${REFERENCE}`, LogicElement);
