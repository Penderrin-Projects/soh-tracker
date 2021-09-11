// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";

import UIRegistry from "../../../../../registry/UIRegistry.js";
import ItemElement from "../abstract/ItemElement.js";

const TPL = new Template(`
<div id="value">
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: border-box;
    filter: contrast(0.8) grayscale(0.5);
    opacity: 0.4;
}
:host(:hover) {
    background-size: 100%;
}
:host(.always_active),
:host([value]:not([value="0"])) {
    filter: none;
    opacity: 1;
}
#value {
    display: none;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 2px;
    color: white;
    font-size: 0.8em;
    text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
    flex-grow: 0;
    flex-shrink: 0;
    min-height: 0;
    white-space: normal;
    line-height: 0.7em;
    font-weight: bold;
}
:host(.always_active) #value,
:host([value]:not([value="0"])) #value {
    display: inline-flex;
}
#value.mark {
    color: #54ff54;
}
`);

function resolveIcon(icon, value = 0) {
    if (icon == null) {
        return "/images/items/unknown.png";
    }
    if (typeof icon == "object") {
        return icon[value] ?? icon[0] ?? "/images/items/unknown.png";
    }
    return icon;
}

function applyElements(target) {
    const tooltipEl = target.getElementById("tooltip");
    const tpl = TPL.generate();
    /* value */
    const valueEl = tpl.getElementById("value");
    tooltipEl.append(valueEl);
}

export default class Item extends ItemElement {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        // image
        this.style.backgroundImage = "";
        // always active
        this.classList.remove("always_active");
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        // always active
        if (state.props.always_active) {
            this.classList.add("always_active");
        } else {
            this.classList.remove("always_active");
        }
    }

    applyValueChange(value) {
        const state = this.getState();
        const valueEl = this.shadowRoot.getElementById("value");
        if (state.props.counting) {
            if (Array.isArray(state.props.counting)) {
                valueEl.innerHTML = state.props.counting[value];
            } else if (typeof state.props.counting == "string") {
                valueEl.innerHTML = state.props.counting;
            } else {
                valueEl.innerHTML = value;
            }
            valueEl.classList.toggle("mark", state.isMarked());
        } else if (state.props.label) {
            if (Array.isArray(state.props.label)) {
                valueEl.innerHTML = state.props.label[value];
            } else {
                valueEl.innerHTML = state.props.label;
            }
        }
        // image
        const icon = resolveIcon(state.props.icon, this.value);
        this.style.backgroundImage = `url("${icon}")`;
    }

}

customElements.define("gt-itemgrid-item", Item);
UIRegistry.set("itemgrid-item", new UIRegistry(Item));
