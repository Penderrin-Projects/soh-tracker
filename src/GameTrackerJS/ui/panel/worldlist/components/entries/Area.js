// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import { mix } from "/emcJS/util/Mixin.js";
import ElementManager from "/emcJS/util/html/ElementManager.js";
import EventTargetMixin from "/emcJS/event/ui/EventTargetMixin.js";
import "/emcJS/ui/Icon.js";

import WorldStateManager from "../../../../../state/world/WorldStateManager.js";
import WorldListState from "../../../../../state/world/WorldListState.js";
import AccessStateEnum from "../../../../../enum/AccessStateEnum.js";
import UIRegistry from "../../../../../registry/UIRegistry.js";
import SettingsObserver from "../../../../../util/observer/SettingsObserver.js";
import WorldListMarkedEntry from "../abstract/WorldListMarkedEntry.js";
import AreaContextMenu from "../../../../ctxmenu/AreaContextMenu.js";
import "../../../../../state/world/area/OverworldState.js";

const TPL = new Template(`
<div id="entrances"></div>
<div id="hint"></div>
<div id="list">
    <slot></slot>
</div>
`);

const STYLE = new GlobalStyle(`
#hint {
    margin-left: 5px;
}
#hint:empty {
    display: none;
}
#hint img {
    width: 25px;
    height: 25px;
}
#entrances {
    margin-right: 5px;
}
#entrances:empty {
    display: none;
}
#entrances img {
    width: 25px;
    height: 25px;
}
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

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    /* entrances */
    const entrancesEl = tpl.getElementById("entrances");
    textEl.insertAdjacentElement("beforebegin", entrancesEl);
    /* hint */
    const hintEl = tpl.getElementById("hint");
    textEl.insertAdjacentElement("afterend", hintEl);
    /* list */
    const listEl = tpl.getElementById("list");
    target.append(listEl);
}

const BaseClass = mix(
    WorldListMarkedEntry
).with(
    EventTargetMixin
);

export default class WorldListArea extends BaseClass {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* state handler */
        this.registerStateHandler("hint", event => {
            this.applyHint(event.data);
        });
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
        /* context menu */
        this.setDefaultContextMenu(AreaContextMenu);
        this.addDefaultContextMenuHandler("check", event => {
            const state = this.getState();
            if (state != null) {
                state.setAllEntries(true);
            }
        });
        this.addDefaultContextMenuHandler("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                state.setAllEntries(false);
            }
        });
        this.addDefaultContextMenuHandler("setwoth", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "woth";
            }
        });
        this.addDefaultContextMenuHandler("setbarren", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "barren";
            }
        });
        this.addDefaultContextMenuHandler("clearhint", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "";
            }
        });
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

    clickHandler() {
        const state = this.getState();
        if (state != null && !state.listContents) {
            WorldListState.area = this.ref;
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/location.svg");
        /* hint */
        this.applyHint();
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/location.svg");
        /* hint */
        this.applyHint(state.hint);
        /* list */
        this.refreshList();
    }
    
    applyAccess(value = "unavailable", data = {}) {
        super.applyAccess(value, data);
        /* entrances */
        const entrancesEl = this.shadowRoot.getElementById("entrances");
        if (entrancesEl != null) {
            entrancesEl.innerHTML = "";
            if (data.entrances) {
                const el_icon = document.createElement("img");
                el_icon.src = `images/icons/entrance.svg`;
                entrancesEl.append(el_icon);
            }
        }
        /* collapsed */
        // TODO remember and restore collapsed state
        this.setCollapsed(data.value == AccessStateEnum.OPENED);
    }

    applyHint(hint = "") {
        const hintEl = this.shadowRoot.getElementById("hint");
        if (hintEl != null) {
            hintEl.innerHTML = "";
            if (hint) {
                const el_icon = document.createElement("img");
                el_icon.src = `images/icons/area_${hint}.svg`;
                hintEl.append(el_icon);
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

    refreshList() {
        const elManager = EL_MANAGER.get(this);
        const elManagerData = [];
        const state = this.getState();
        let hasElements = true;
        if (state != null && state.listContents) {
            hasElements = false;
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

UIRegistry.set("worldlist-area", new UIRegistry(WorldListArea));
UIRegistry.set("worldlist-subarea", new UIRegistry(WorldListArea));
customElements.define("ootrt-list-area", WorldListArea);
