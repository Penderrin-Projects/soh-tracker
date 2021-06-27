/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import "/emcJS/ui/input/Option.js";
/* asym-import: on */
import ItemStates from "../../state/item/StateManager.js";
import StateDataEventManager from "../mixin/StateDataEventManager.js";
import iOSTouchHandler from "../../util/iOSTouchHandler.js";

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
    width: 100%;
    height: 100%;
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
:host([value="0"]) #value {
    display: none;
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

export default class Item extends StateDataEventManager(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("value", event => {
            this.value = event.data;
        });
        this.addEventListener("click", event => this.next(event));
        this.addEventListener("contextmenu", event => this.prev(event));
        /* fck iOS */
        iOSTouchHandler.register(this);
    }

    applyDefaultValues() {
        this.style.backgroundImage = "";
        this.halign = "center";
        this.valign = "center";
        this.value = 0;
    }

    applyStateValues(state) {
        if (state != null) {
            if (state.props.counting) {
                this.value = state.value;
            } else if (state.props.label) {
                if (Array.isArray(state.props.label)) {
                    this.value = state.props.label[state.value];
                } else if (typeof state.props.label == "string") {
                    this.value = state.props.label;
                }
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

    static get observedAttributes() {
        return ["ref", "value", "halign", "valign"];
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
                case "value": {
                    const valueEl = this.shadowRoot.getElementById("value");
                    const state = this.getState();
                    if (state.props.counting) {
                        if (Array.isArray(state.props.counting)) {
                            valueEl.innerHTML = state.props.counting[newValue];
                        } else if (typeof state.props.counting == "string") {
                            valueEl.innerHTML = state.props.counting;
                        } else {
                            valueEl.innerHTML = newValue;
                        }
                    } else if (state.props.label) {
                        if (Array.isArray(state.props.label)) {
                            valueEl.innerHTML = state.props.label[newValue];
                        } else {
                            valueEl.innerHTML = state.props.label;
                        }
                    }
                } break;
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
                const oldValue = state.value;
                let value = oldValue;
                if (value < 9999) {
                    value++;
                }
                if (value != oldValue) {
                    state.value = value;
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
                const oldValue = state.value;
                let value = oldValue;
                if ((event.shiftKey || event.ctrlKey)) {
                    value = 0;
                } else if (value > 0) {
                    value--;
                }
                if (value != oldValue) {
                    state.value = value;
                }
            }
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

}

customElements.define("ootrt-infiniteitem", Item);
