// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import "/emcJS/ui/input/Option.js";


// GameTrackerJS
import StateDataEventManager from "/GameTrackerJS/ui/mixin/StateDataEventManager.js";
import AreaStateManager from "/GameTrackerJS/statemanager/world/area/AreaStateManager.js";
// Track-OOT
import DungeonstateStates from "/script/state/dungeon/DungeonStateManager.js";
import "/script/state/world/area/DungeonState.js";

const TPL = new Template(`
<emc-option value="n" style="background-image: url('images/icons/dungeontype_undefined.svg')"></emc-option>
<emc-option value="v" style="background-image: url('images/icons/dungeontype_vanilla.svg')"></emc-option>
<emc-option value="mq" style="background-image: url('images/icons/dungeontype_masterquest.svg')"></emc-option>
`);

const STYLE = new GlobalStyle(`
:host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    cursor: pointer;
}
slot {
    width: 100%;
    height: 100%;
}
:not([value]),
[value]:not(.active) {
    display: none !important;
}
[value] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: white;
    font-size: 1em;
    text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: content-box;
    flex-grow: 0;
    flex-shrink: 0;
    min-height: 0;
    white-space: normal;
    padding: 0;
    line-height: 0.7em;
}
`);

class HTMLTrackerDungeonType extends StateDataEventManager(CustomElement) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("type", event => {
            this.value = event.data;
        });
        this.addEventListener("click", event => this.next(event));
        this.addEventListener("contextmenu", event => this.revert(event));
    }

    connectedCallback() {
        super.connectedCallback();
        // state
        const state = this.getState();
        if (state != null) {
            this.value = state.type;
        }
    }

    applyDefaultValues() {
        this.value = "v";
    }

    applyStateValues(state) {
        if (state != null) {
            this.value = state.type;
        }
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
        const val = this.getAttribute("readonly");
        return !!val && val != "false";
    }

    set readonly(val) {
        this.setAttribute("readonly", val);
    }

    static get observedAttributes() {
        return ["ref", "value"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref":
                    {
                        // state
                        const state = DungeonstateStates.get(newValue);
                        this.readonly = true;
                        if (state != null) {
                            const area = AreaStateManager.get(newValue);
                            if (area?.props.list_mq != null) {
                                this.readonly = false;
                            }
                        }
                        this.switchState(state);
                    }
                    break;
                case "value":
                    {
                        const oe = this.shadowRoot.querySelector(`.active`);
                        if (oe) {
                            oe.classList.remove("active");
                        }
                        const ne = this.shadowRoot.querySelector(`[value="${newValue}"]`);
                        if (ne) {
                            ne.classList.add("active");
                        }
                    }
                    break;
            }
        }
    }

    next(event) {
        if (!this.readonly) {
            const state = this.getState();
            if (state != null) {
                if (state.type == "v") {
                    state.type = "mq";
                } else {
                    state.type = "v";
                }
            }
        }
        event.preventDefault();
        return false;
    }

    revert(event) {
        if (!this.readonly) {
            const state = this.getState();
            if (state != null) {
                state.type = "n";
            }
        }
        event.preventDefault();
        return false;
    }

}

customElements.define("ootrt-dungeontype", HTMLTrackerDungeonType);
