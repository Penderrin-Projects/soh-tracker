// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import EventTargetMixin from "/emcJS/event/ui/EventTargetMixin.js";
import "/emcJS/ui/Icon.js";


// GameTrackerJS
import WorldStateManager from "/GameTrackerJS/state/world/WorldStateManager.js";
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";
import "/GameTrackerJS/state/world/area/StateManager.js";
import "/GameTrackerJS/state/world/exit/StateManager.js";
import "/GameTrackerJS/state/world/location/StateManager.js";
import "/GameTrackerJS/state/world/subarea/StateManager.js";
import "/GameTrackerJS/state/world/subexit/StateManager.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import AbstractSubArea from "/GameTrackerJS/ui/world/SubArea.js";
import SettingsObserver from "/GameTrackerJS/util/observer/SettingsObserver.js";
import "/GameTrackerJS/ui/Badge.js";
// Track-OOT
import "/script/state/world/CustomWorldStates.js";

const TPL = new Template(`
<div id="header" class="textarea">
    <div id="text"></div>
    <gt-badge-access id="badge"></gt-badge-access>
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
:host(:hover),
:host(.ctx-marked) {
    background-color: var(--main-hover-color, #ffffff32);
}
:host(.empty) {
    display: none;
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
:host(:not(:empty)) #header.collapsible:before {
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
:host(:not(:empty)) #header.collapsible.expanded:before {
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
#header.collapsible + #list {
    display: none;
}
:host(:not(:empty)) #header.collapsible.expanded + #list {
    display: block;
}
`);

const sublistCollapsibleObserver = new SettingsObserver("sublist_collapsible");

export default class ListSubArea extends EventTargetMixin(AbstractSubArea) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const headerEl = this.shadowRoot.getElementById("header");
        headerEl.addEventListener("click", (event) => {
            if (headerEl.classList.contains("collapsible") && this.value != "") {
                if (headerEl.classList.contains("expanded")) {
                    headerEl.classList.remove("expanded");
                } else {
                    headerEl.classList.add("expanded");
                }
            }
        });
        /* --- */
        this.switchTarget("sublistCollapsible", sublistCollapsibleObserver);
        this.setTargetEventListener("sublistCollapsible", "change", event => {
            const collapsible = event.data;
            if (collapsible != "off") {
                headerEl.classList.add("collapsible");
                if (collapsible == "start_expanded") {
                    headerEl.classList.add("startexpanded");
                }
            } else {
                headerEl.classList.remove("collapsible");
            }
        });
        const collapsible = sublistCollapsibleObserver.value;
        if (collapsible != "off") {
            headerEl.classList.add("collapsible");
            if (collapsible == "start_expanded") {
                headerEl.classList.add("expanded");
                headerEl.classList.add("startexpanded");
            }
        }
    }

    setCollapsed(value) {
        const headerEl = this.shadowRoot.getElementById("header");
        if (headerEl.classList.contains("collapsible")) {
            if (value) {
                headerEl.classList.remove("expanded");
            } else {
                headerEl.classList.add("expanded");
            }
        }
    }
    
    applyAccess(data) {
        super.applyAccess(data);
        /* collapsed */
        this.setCollapsed(data.value == AccessStateEnum.OPENED);
    }

    refreshList() {
        this.innerHTML = ""; // TODO use ElementManager
        const state = this.getState();
        if (state != null) {
            const list = state.getList();
            if (list != null && list.length > 0) {
                let visible = false;
                for (const record of list) {
                    const loc = WorldStateManager.get(record.category, record.id);
                    const uiReg = UIRegistry.get(`list-${record.category}`);
                    this.append(uiReg.create(loc.props.type, loc.ref));
                    if (loc.isVisible()) {
                        visible = true;
                    }
                }
                this.classList.toggle("empty", !visible);
            } else {
                this.classList.add("empty");
            }
        }
    }

}

UIRegistry.set("list-subarea", new UIRegistry(ListSubArea));
customElements.define("ootrt-list-subarea", ListSubArea);
