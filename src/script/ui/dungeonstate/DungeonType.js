/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import "/emcJS/ui/input/Option.js";
/* asym-import: on */

// GameTrackerJS
import StateDataEventManager from "/GameTrackerJS/ui/mixin/StateDataEventManager.js";
import WorldStateManagers from "/GameTrackerJS/state/world/StateManagers.js";
import iOSTouchHandler from "/GameTrackerJS/util/iOSTouchHandler.js";
// Track-OOT
import DungeonstateStates from "/script/state/dungeonstate/StateManager.js";

const TPL = new Template(`
<emc-option value="n" style="background-image: url('images/dungeontype/undefined.svg')"></emc-option>
<emc-option value="v" style="background-image: url('images/dungeontype/vanilla.svg')"></emc-option>
<emc-option value="mq" style="background-image: url('images/dungeontype/masterquest.svg')"></emc-option>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
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

class HTMLTrackerDungeonType extends StateDataEventManager(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("type", event => {
            this.value = event.data;
        });
        this.addEventListener("click", event => this.next(event));
        this.addEventListener("contextmenu", event => this.revert(event));
        /* fck iOS */
        iOSTouchHandler.register(this);
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
                        const state = DungeonstateStates.get(this.ref);
                        if (state != null) {
                            const data = WorldStateManagers.getByRef(newValue);
                            if (data != null) {
                                if (data.areaData.lists != null) {
                                    this.readonly = false;
                                } else {
                                    this.readonly = true;
                                }
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
