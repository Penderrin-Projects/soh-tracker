// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import "/emcJS/ui/input/Option.js";
import "/emcJS/ui/i18n/I18nLabel.js";

// GameTrackerJS
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import ItemElement from "/GameTrackerJS/ui/panel/itemgrid/components/abstract/ItemElement.js";
import "/GameTrackerJS/ui/itempicker/components/Item.js";
// Track-OOT
import "/script/state/item/RewardItemState.js";

const TPL = new Template(`
<div id="icon">
    <emc-i18n-label id="value"></emc-i18n-label>
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
:host([value]:not([value="0"])) #icon {
    filter: none;
    opacity: 1;
}
#value {
    display: inline-flex;
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
`);

function applyElements(target) {
    const tooltipEl = target.getElementById("tooltip");
    const tpl = TPL.generate();
    /* icon */
    const iconEl = tpl.getElementById("icon");
    tooltipEl.append(iconEl);
}

// FIXME dungeon name is not shown

export default class RewardItem extends ItemElement {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("dungeon", (event) => {
            this.dungeon = event.value;
        });
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        // image
        const iconEl = this.shadowRoot.getElementById("icon");
        iconEl.style.backgroundImage = "";
        // dungeon
        this.dungeon = "";
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        // image
        const iconEl = this.shadowRoot.getElementById("icon");
        iconEl.style.backgroundImage = `url("${state.props.icon}")`;
        // dungeon
        this.dungeon = state.dungeon ?? "";
    }

    get dungeon() {
        return this.getAttribute("dungeon");
    }

    set dungeon(val) {
        this.setAttribute("dungeon", val);
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "dungeon"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "dungeon": {
                    if (newValue != "") {
                        const valueEl = this.shadowRoot.getElementById("value");
                        valueEl.i18nValue = `area[${newValue}.short]`;
                    } else {
                        const valueEl = this.shadowRoot.getElementById("value");
                        valueEl.i18nValue = "???";
                    }
                } break;
            }
        }
    }

}

customElements.define("ootrt-itemgrid-dungeonreward", RewardItem);
UIRegistry.get("itemgrid-item")
    .register("dungeonreward", RewardItem);
