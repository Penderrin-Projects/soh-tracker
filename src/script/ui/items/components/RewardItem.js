// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import "/emcJS/ui/input/Option.js";


// GameTrackerJS
import Language from "/GameTrackerJS/util/Language.js";
import ItemStates from "/GameTrackerJS/state/item/StateManager.js";
import StateDataEventManager from "/GameTrackerJS/ui/mixin/StateDataEventManager.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
// Track-OOT
import "/script/state/item/RewardItemState.js";
import "./Item.js";

const TPL = new Template(`
<div id="value">
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
:host {
    display: inline-flex;
    width: 40px;
    height: 40px;
    cursor: pointer;
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: border-box;
}
:host(:hover) {
    background-size: 100%;
}
:host([value="0"]) {
    filter: contrast(0.8) grayscale(0.5);
    opacity: 0.4;
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

function getAlign(value) {
    switch (value) {
        case "start":
            return "flex-start";
        case "end":
            return "flex-end";
        default:
            return "center";
    }
}

export default class RewardItem extends StateDataEventManager(CustomElement) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("value", event => {
            this.value = event.data;
        });
        this.registerStateHandler("dungeon", event => {
            this.dungeon = event.data;
        });
        this.addEventListener("click", event => this.next(event));
        this.addEventListener("contextmenu", event => this.prev(event));
    }

    connectedCallback() {
        super.connectedCallback();
        // state
        const state = this.getState();
        if (state != null) {
            this.value = state.value;
            this.dungeon = state.dungeon;
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get readonly() {
        return this.getAttribute("readonly");
    }

    set readonly(val) {
        this.setAttribute("readonly", val);
    }

    get halign() {
        return this.getAttribute("halign");
    }

    set halign(val) {
        this.setAttribute("halign", val);
    }

    get valign() {
        return this.getAttribute("halign");
    }

    set valign(val) {
        this.setAttribute("valign", val);
    }

    get dungeon() {
        return this.getAttribute("dungeon");
    }

    set dungeon(val) {
        this.setAttribute("dungeon", val);
    }

    static get observedAttributes() {
        return ["ref", "dungeon", "halign", "valign"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref":
                    {
                        // state
                        const state = ItemStates.get(this.ref);
                        this.switchState(state);
                        if (state != null) {
                            if (this.isConnected) {
                                this.value = state.value;
                                this.dungeon = state.dungeon;
                            }
                            const data = state.props;
                            // settings
                            if (data.halign != null) {
                                this.halign = data.halign;
                            }
                            if (data.valign != null) {
                                this.valign = data.valign;
                            }
                            this.style.backgroundImage = `url("${data.images}")`;
                        }
                    }
                    break;
                case "dungeon":
                    if (newValue != "") {
                        Language.applyLabel(this.shadowRoot.getElementById("value"), `${newValue}.short`);
                    } else {
                        Language.applyLabel(this.shadowRoot.getElementById("value"), "");
                    }
                    break;
                case "halign":
                    this.shadowRoot.getElementById("value").style.justifyContent = getAlign(newValue);
                    break;
                case "valign":
                    this.shadowRoot.getElementById("value").style.alignItems = getAlign(newValue);
                    break;
            }
        }
    }

    next(event) {
        if (!this.readonly) {
            const state = this.getState();
            if (state != null) {
                if (state.value == 0) {
                    state.value = 1;
                }
            }
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

    prev(event) {
        if (!this.readonly) {
            const state = this.getState();
            if (state != null) {
                if (state.value == 1) {
                    state.value = 0;
                }
            }
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

}

UIRegistry.get("item").register("dungeonreward", RewardItem);
customElements.define("ootrt-rewarditem", RewardItem);
