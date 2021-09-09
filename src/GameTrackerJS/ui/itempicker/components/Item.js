// frameworks
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";

import ItemStates from "../../../state/item/StateManager.js";

const STYLE = new GlobalStyle(`
:host {
    display: inline-flex;
    width: 40px;
    height: 40px;
    cursor: pointer;
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: border-box;
    user-select: none;
}
:host(:hover) {
    background-size: 100%;
}
`);

export default class Item extends CustomElement {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("click", event => this.select(event));
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
            const state = ItemStates.get(this.ref);
            const data = state.props;
            switch (name) {
                case "ref":
                    if (Array.isArray(data.images)) {
                        this.style.backgroundImage = `url("${data.images[0]}")`;
                    } else {
                        this.style.backgroundImage = `url("${data.images}")`;
                    }
                    break;
            }
        }
    }

    select(event) {
        if (!event) return;
        event.preventDefault();

        const ev = new Event("select");
        ev.item = this.ref;
        this.dispatchEvent(ev);

        return false;
    }

}

customElements.define("gt-itempicker-item", Item);
