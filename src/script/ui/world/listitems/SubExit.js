// frameworks
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import EventTargetMixin from "/emcJS/event/ui/EventTargetMixin.js";
import "/emcJS/ui/Icon.js";


// GameTrackerJS
import WorldStateManager from "/GameTrackerJS/state/world/WorldStateManager.js";
import "/GameTrackerJS/state/world/area/StateManager.js";
import "/GameTrackerJS/state/world/exit/StateManager.js";
import "/GameTrackerJS/state/world/location/StateManager.js";
import "/GameTrackerJS/state/world/subarea/StateManager.js";
import "/GameTrackerJS/state/world/subexit/StateManager.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import AbstractSubExit from "/GameTrackerJS/ui/world/SubExit.js";
import SettingsObserver from "/GameTrackerJS/util/observer/SettingsObserver.js";
import "/GameTrackerJS/ui/Badge.js";
// Track-OOT
import "/script/state/world/CustomWorldStates.js";
import "../../ctxmenu/ExitBindingMenu.js";

const sublistCollapsibleObserver = new SettingsObserver("sublist_collapsible");

const TPL = new Template(`
<div class="textarea">
    <div id="text"></div>
    <gt-badge-access id="badge"></gt-badge-access>
</div>
<div class="textarea">
    <div id="value"></div>
</div>
<div id="list">
    <slot></slot>
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
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    cursor: pointer;
    padding: 5px;
}
:host(:hover) {
    background-color: var(--main-hover-color, #ffffff32);
}
.textarea {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    min-height: 35px;
    word-break: break-word;
}
.textarea:empty {
    display: none;
}
.textarea + .textarea {
    margin-top: 5px;
}
#value:empty:after {
    display: inline;
    font-style: italic;
    content: "no association";
}
#text {
    display: flex;
    flex: 1;
    color: #ffffff;
    align-items: center;
}
#text[data-state="opened"] {
    color: var(--location-status-opened-color, #000000);
}
#text[data-state="available"] {
    color: var(--location-status-available-color, #000000);
}
#text[data-state="unavailable"] {
    color: var(--location-status-unavailable-color, #000000);
}
#text[data-state="possible"] {
    color: var(--location-status-possible-color, #000000);
}
:host(:not(:empty)) #text.collapsible:before {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-right: 8px;
    font-weight: bold;
    text-align: center;
    content: "+"
}
:host(:not(:empty)) #text.collapsible.expanded:before {
    content:"-"
}
.menu-tip {
    font-size: 0.7em;
    color: #777777;
    margin-left: 15px;
    float: right;
}
#list {
    width: 100%;
    margin-top: 5px;
}
#list {
    width: 100%;
    margin-top: 5px;
}
#list.collapsible {
    display: none;
}
:host(:not(:empty)) #list.collapsible.expanded {
    display: block;
}
`);

export default class ListSubExit extends EventTargetMixin(AbstractSubExit) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.setContextMenu("exitbinding", document.createElement("ootrt-ctxmenu-exitbinding"));
        /* --- */
        const textEl = this.shadowRoot.getElementById("text");
        const listEl = this.shadowRoot.getElementById("list");
        textEl.addEventListener("click", (event) => {
            if (textEl.classList.contains("collapsible") && this.value != "") {
                if (textEl.classList.contains("expanded")) {
                    textEl.classList.remove("expanded");
                    listEl.classList.remove("expanded");
                } else {
                    textEl.classList.add("expanded");
                    listEl.classList.add("expanded");
                }
            }
        });
        /* --- */
        this.switchTarget("sublistCollapsible", sublistCollapsibleObserver);
        this.setTargetEventListener("sublistCollapsible", "change", event => {
            const collapsible = event.data;
            if (collapsible != "off") {
                textEl.classList.add("collapsible");
                listEl.classList.add("collapsible");
                if (collapsible == "start_expanded") {
                    textEl.classList.add("startexpanded");
                }
            } else {
                textEl.classList.remove("collapsible");
                listEl.classList.remove("collapsible");
            }
        });
        const collapsible = sublistCollapsibleObserver.value;
        if (collapsible != "off") {
            textEl.classList.add("collapsible");
            listEl.classList.add("collapsible");
            if (collapsible == "start_expanded") {
                textEl.classList.add("expanded");
                listEl.classList.add("expanded");
                textEl.classList.add("startexpanded");
            }
        }
    }

    setCollapsed(value) {
        const textEl = this.shadowRoot.getElementById("text");
        const listEl = this.shadowRoot.getElementById("list");
        if (textEl.classList.contains("collapsible") && !!this.value) {
            if (value) {
                textEl.classList.remove("expanded");
                listEl.classList.remove("expanded");
            } else {
                textEl.classList.add("expanded");
                listEl.classList.add("expanded");
            }
        }
    }

    refreshList() {
        this.innerHTML = ""; // TODO use ElementManager
        const state = this.getState();
        if (state != null) {
            const area = state.area;
            if (area != null) {
                const list = area.getList();
                if (list != null) {
                    for (const record of list) {
                        const loc = WorldStateManager.get(record.category, record.id);
                        const uiReg = UIRegistry.get(`list-${record.category}`);
                        this.append(uiReg.create(loc.props.type, loc.ref));
                    }
                }
            }
        }
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (oldValue != newValue) {
            switch (name) {
                case "value":
                    {
                        const textEl = this.shadowRoot.getElementById("text");
                        const listEl = this.shadowRoot.getElementById("list");
                        if (textEl.classList.contains("collapsible") && !newValue) {
                            if (textEl.classList.contains("startexpanded")) {
                                textEl.classList.add("expanded");
                                listEl.classList.add("expanded");
                            } else {
                                textEl.classList.remove("expanded");
                                listEl.classList.remove("expanded");
                            }
                        }
                    }
                    break;
            }
        }
    }

}

UIRegistry.set("list-subexit", new UIRegistry(ListSubExit));
customElements.define("ootrt-list-subexit", ListSubExit);
