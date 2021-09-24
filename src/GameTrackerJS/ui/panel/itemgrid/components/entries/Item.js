// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";

import UIRegistry from "../../../../../registry/UIRegistry.js";
import ItemElement from "../abstract/ItemElement.js";

const TPL = new Template(`
<div id="icon">
    <div id="value"></div>
</div>
`);

const STYLE = new GlobalStyle(`
#icon {
    width: 100%;
    height: 100%;
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: border-box;
    filter: contrast(0.8) grayscale(0.5);
    opacity: 0.4;
}
:host(:hover) #icon {
    background-size: 100%;
}
:host(.alwaysActive) #icon,
:host([value]:not([value="0"])) #icon {
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
:host(.alwaysActive) #value,
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
    /* icon */
    const iconEl = tpl.getElementById("icon");
    tooltipEl.append(iconEl);
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
        this.classList.remove("alwaysActive");
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        // always active
        if (state.props.alwaysActive) {
            this.classList.add("alwaysActive");
        } else {
            this.classList.remove("alwaysActive");
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
                if (value > 0 || data.alwaysCounting) {
                    if (data.showMax) {
                        opt.innerHTML = `${value} / ${max_value}`;
                    } else {
                        opt.innerHTML = value;
                    }
                }
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
        const iconEl = this.shadowRoot.getElementById("icon");
        const icon = resolveIcon(state.props.icon, this.value);
        iconEl.style.backgroundImage = `url("${icon}")`;
    }

}

customElements.define("gt-itemgrid-item", Item);
UIRegistry.set("itemgrid-item", new UIRegistry(Item));
