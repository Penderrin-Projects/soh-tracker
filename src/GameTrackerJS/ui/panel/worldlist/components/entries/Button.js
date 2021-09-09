
import WorldListEntry from "../abstract/WorldListEntry.js";

export default class WorldListButton extends WorldListEntry {

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    static get observedAttributes() {
        return ["value"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "value": {
                    const textEl = this.shadowRoot.getElementById("text");
                    if (textEl != null) {
                        textEl.i18nValue = newValue;
                    }
                } break;
            }
        }
    }

}

customElements.define("gt-worldlist-button", WorldListButton);
