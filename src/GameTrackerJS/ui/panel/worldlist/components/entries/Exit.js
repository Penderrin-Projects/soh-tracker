// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import { mix } from "/emcJS/util/Mixin.js";
import ElementManager from "/emcJS/util/html/ElementManager.js";
import EventTargetMixin from "/emcJS/event/ui/EventTargetMixin.js";
import "/emcJS/ui/Icon.js";

import WorldStateManager from "../../../../../state/world/WorldStateManager.js";
import WorldListState from "../../../../../state/world/WorldListState.js";
import EmptyState from "../../../../../state/world/EmptyState.js";
import AccessStateEnum from "../../../../../enum/AccessStateEnum.js";
import UIRegistry from "../../../../../registry/UIRegistry.js";
import SettingsObserver from "../../../../../util/observer/SettingsObserver.js";
import WorldListMarkedEntry from "../abstract/WorldListMarkedEntry.js";
import ExitContextMenu from "../../../../ctxmenu/ExitContextMenu.js";
import ExitBindingContextMenu from "../../../../ctxmenu/ExitBindingContextMenu.js";

const TPL = new Template(`
<div id="area" class="textarea">
    <div id="entrances"></div>
    <emc-i18n-label id="value"></emc-i18n-label>
    <div id="hint"></div>
</div>
<div id="list">
    <slot></slot>
</div>
`);

const STYLE = new GlobalStyle(`
#value:empty:after {
    display: inline;
    font-style: italic;
    content: "no association";
}
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
:host(:not(:empty):not(.empty)) #area.collapsible:before {
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
:host(:not(:empty):not(.empty)) #area.collapsible.expanded:before {
    content:"-"
}
#list {
    width: 100%;
    margin-top: 5px;
}
#area.collapsible + #list {
    display: none;
}
:host(:not(:empty):not(.empty)) #area.collapsible.expanded + #list {
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
    WorldListMarkedEntry
).with(
    EventTargetMixin
);

export default class WorldListExit extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* state handler */
        this.registerStateHandler("value", event => {
            this.applyValue(event.data);
        });
        this.registerStateHandler("hint", event => {
            this.applyHint(event.data);
        });
        this.registerStateHandler("list_update", event => {
            this.refreshList();
        });
        /* header */
        const areaEl = this.shadowRoot.getElementById("area");
        areaEl.addEventListener("click", (event) => {
            if (areaEl.classList.contains("collapsible") && this.value != "") {
                if (areaEl.classList.contains("expanded")) {
                    areaEl.classList.remove("expanded");
                } else {
                    areaEl.classList.add("expanded");
                }
            }
        });
        /* settings */
        this.switchTarget("sublistCollapsible", sublistCollapsibleObserver);
        this.setTargetEventListener("sublistCollapsible", "change", event => {
            const collapsible = event.data;
            if (collapsible != "off") {
                areaEl.classList.add("collapsible");
                if (collapsible == "start_expanded") {
                    areaEl.classList.add("startexpanded");
                }
            } else {
                areaEl.classList.remove("collapsible");
            }
        });
        const collapsible = sublistCollapsibleObserver.value;
        if (collapsible != "off") {
            areaEl.classList.add("collapsible");
            if (collapsible == "start_expanded") {
                areaEl.classList.add("expanded");
                areaEl.classList.add("startexpanded");
            }
        }
        /* context menu */
        this.setDefaultContextMenu(ExitContextMenu);
        this.addDefaultContextMenuHandler("associate", event => {
            const state = this.getState();
            const mnu_ctx = this.getDefaultContextMenu();
            const mnu_ext = this.getContextMenu("exitbinding");
            if (state != null) {
                mnu_ext.fillEntranceSelection(state.props.access, state.value);
            } else {
                mnu_ext.fillEntranceSelection("", "");
            }
            mnu_ext.setValue(state.value);
            mnu_ext.show(mnu_ctx.left, mnu_ctx.top);
        });
        this.addDefaultContextMenuHandler("deassociate", event => {
            const state = this.getState();
            if (state != null) {
                state.value = "";
            }
        });
        this.addDefaultContextMenuHandler("check", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.setAllEntries(true);
                }
            }
        });
        this.addDefaultContextMenuHandler("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.setAllEntries(false);
                }
            }
        });
        this.addDefaultContextMenuHandler("setwoth", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.hint = "woth";
                }
            }
        });
        this.addDefaultContextMenuHandler("setbarren", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.hint = "barren";
                }
            }
        });
        this.addDefaultContextMenuHandler("clearhint", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.hint = "";
                }
            }
        });
        /* context menu - exit binding */
        this.setContextMenu("exitbinding", ExitBindingContextMenu);
        this.addContextMenuHandler("exitbinding", "change", event => {
            const state = this.getState();
            if (state != null) {
                state.value = event.value;
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

    clickHandler(event) {
        const state = this.getState();
        if (state != null) {
            const area = state.area;
            if (area != null) {
                if (!(area instanceof EmptyState)) {
                    WorldListState.area = area.ref;
                }
                // XXX use the one below
                // if (area instanceof AreaState) {
                //     WorldListState.area = area.ref;
                // }
            } else {
                const mnu_ext = this.getContextMenu("exitbinding");
                mnu_ext.fillEntranceSelection(state.props.access, state.value);
                mnu_ext.setValue(state.value);
                this.showContextMenu("exitbinding", event);
            }
        }
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/entrance.svg");
        /* value */
        this.applyValue();
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/entrance.svg");
        /* value */
        this.applyValue(state.value);
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

    applyValue(value = "") {
        const valueEl = this.shadowRoot.getElementById("value");
        if (valueEl != null) {
            if (value) {
                valueEl.i18nValue = `entrance[${value}]`;
                const state = this.getState();
                if (state != null) {
                    this.applyHint(state.hint);
                } else {
                    this.applyHint();
                }
            } else {
                valueEl.innerHTML = "";
                this.applyHint();
            }
        }
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
        const areaEl = this.shadowRoot.getElementById("area");
        if (areaEl.classList.contains("collapsible")) {
            if (value) {
                areaEl.classList.remove("expanded");
            } else {
                areaEl.classList.add("expanded");
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

    get textRef() {
        const state = this.getState();
        if (state != null) {
            return `exit[${state.props.access}]`;
        }
        return super.textRef;
    }

}

UIRegistry.set("worldlist-exit", new UIRegistry(WorldListExit));
UIRegistry.set("worldlist-subexit", new UIRegistry(WorldListExit));
customElements.define("ootrt-list-exit", WorldListExit);
