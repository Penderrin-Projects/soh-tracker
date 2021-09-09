// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import { mix } from "/emcJS/util/Mixin.js";
import ElementManager from "/emcJS/util/html/ElementManager.js";
import EventTargetMixin from "/emcJS/event/ui/EventTargetMixin.js";
import "/emcJS/ui/Icon.js";

import WorldStateManager from "../../../../../state/world/WorldStateManager.js";
import AccessStateEnum from "../../../../../enum/AccessStateEnum.js";
import UIRegistry from "../../../../../registry/UIRegistry.js";
import SettingsObserver from "../../../../../util/observer/SettingsObserver.js";
import WorldListStateEntry from "../abstract/WorldListStateEntry.js";

const TPL = new Template(`
<div id="list">
    <slot></slot>
</div>
`);

const STYLE = new GlobalStyle(`
:host(.empty) {
    display: none;
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
const EL_MANAGER = new WeakMap();

function elementComposer(key, props) {
    const uiReg = UIRegistry.get(`worldlist-${props.category}`);
    if (uiReg != null) {
        return uiReg.create(props.type, key);
    }
}

const BaseClass = mix(
    WorldListStateEntry
).with(
    EventTargetMixin
);

export default class WorldListCollection extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* state handler */
        this.registerStateHandler("list_update", event => {
            this.refreshList();
        });
        /* header */
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
        /* settings */
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
        /* --- */
        EL_MANAGER.set(this, new ElementManager(this, elementComposer));
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        /* list */
        this.refreshList();
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        /* collapsed */
        this.setCollapsed(true);
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        /* list */
        this.refreshList();
    }
    
    applyAccess(value = "unavailable", data = {}) {
        super.applyAccess(value, data);
        /* collapsed */
        // TODO remember and restore collapsed state
        if (!!data.entrances || data.value != AccessStateEnum.OPENED) {
            this.setCollapsed(false);
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

    refreshList() {
        const elManager = EL_MANAGER.get(this);
        const elManagerData = [];
        const state = this.getState();
        let hasElements = false;
        if (state != null) {
            const list = state.getList();
            if (list != null && list.length > 0) {
                for (const record of list) {
                    const loc = WorldStateManager.get(record.category, record.id);
                    elManagerData.push({
                        key: loc.ref,
                        category: record.category,
                        type: loc.props.type
                    });
                    if (loc.isVisible()) {
                        hasElements = true;
                    }
                }
            }
        }
        this.classList.toggle("empty", !hasElements);
        elManager.manage(elManagerData);
    }

}

UIRegistry.set("worldlist-collection", new UIRegistry(WorldListCollection));
customElements.define("gt-worldlist-collection", WorldListCollection);
