import Logger from "/emcJS/util/Logger.js";
import "/emcJS/ui/Icon.js";
import StateDataEventManagerMixin from "/script/ui/mixin/StateDataEventManager.js";
import ContextMenuManagerMixin from "/script/ui/mixin/ContextMenuManager.js";
import WorldRegistry from "/script/registries/WorldRegistry.js";
import ExitRegistry from "/script/registries/ExitRegistry.js";
import LocationState from "/script/state/world/locations/LocationState.js";
import SubAreaStates from "/script/state/SubAreaStates.js";
import Language from "/script/util/Language.js";
import AccessStateEnum from "/script/enum/AccessStateEnum.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";
import "./menus/SubAreaContextMenu.js";

function setAllListEntries(list, value = true) {
    if (!!list && Array.isArray(list)) {
        for (const entry of list) {
            const category = entry.category;
            const id = entry.id;
            if (category == "location") {
                const state = WorldRegistry.get(`location/${id}`);
                if (state instanceof LocationState) {
                    state.value = value;
                }
            } else if (category == "subarea") {
                const subarea = WorldRegistry.get(`subarea/${id}`);
                if (subarea != null) {
                    setAllListEntries(subarea.getFilteredList(), value);
                }
            } else if (category == "subexit") {
                const subexit = WorldRegistry.get(`subexit/${id}`);
                if (subexit != null) {
                    const bound = subexit.value;
                    if (!bound) {
                        continue;
                    }
                    const entrance = ExitRegistry.get(bound);
                    if (entrance != null) {
                        const subarea = WorldRegistry.get(entrance.exitData.area);
                        if (subarea != null) {
                            setAllListEntries(subarea.getFilteredList(), value);
                        }
                    }
                }
            } else {
                Logger.error((new Error(`unknown category "${category}" for entry "${id}"`)), "SubArea");
            }
        }
    }
}

export default class AbstractSubArea extends ContextMenuManagerMixin(StateDataEventManagerMixin(HTMLElement)) {

    constructor(type) {
        super();
        /* --- */
        this.registerStateHandler("access", event => {
            this.applyAccess(event.data);
        });
        this.registerStateHandler("hint", event => {
            this.hint = event.data;
        });

        /* context menu */
        const mnu_ctx = document.createElement("ootrt-ctxmenu-subarea");
        this.setContextMenu("area", mnu_ctx);
        
        mnu_ctx.addEventListener("check", event => {
            const state = this.getState();
            if (state != null) {
                const list = state.getFilteredList();
                setAllListEntries(list, true);
            }
        });
        mnu_ctx.addEventListener("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                const list = state.getFilteredList();
                setAllListEntries(list, false);
            }
        });
        
        /* mouse events */
        this.addEventListener("click", event => {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            mnu_ctx.show(event.clientX, event.clientY);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        
        /* fck iOS */
        iOSTouchHandler.register(this);
    }
    
    applyAccess(data) {
        /* access */
        const textEl = this.shadowRoot.getElementById("text");
        const value = AccessStateEnum.getName(data.value).toLowerCase();
        if (textEl != null) {
            textEl.dataset.state = value;
        }
        /* entrances */
        const entrances = this.shadowRoot.getElementById("entrances");
        if (entrances != null) {
            entrances.innerHTML = "";
            if (data.entrances) {
                const el_icon = document.createElement("img");
                el_icon.src = `images/icons/entrance.svg`;
                entrances.append(el_icon);
            }
        }
    }

    applyStateValues(state) {
        this.hint = state.hint;
        this.setFilterData(state.filter);
        this.applyAccess(state.access);
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    static get observedAttributes() {
        return ['ref'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'ref':
                    {
                        const state = SubAreaStates.get(this.ref);
                        const textEl = this.shadowRoot.getElementById("text");
                        if (textEl != null) {
                            textEl.innerHTML = Language.translate(newValue);
                        }
                        this.switchState(state);
                    }
                    break;
            }
        }
    }

    setFilterData(data) {
        if (data != null) {
            const el_era = this.shadowRoot.getElementById("badge-era");
            if (el_era != null) {
                if (!data["filter.era/child"]) {
                    el_era.src = "images/icons/era_adult.svg";
                } else if (!data["filter.era/adult"]) {
                    el_era.src = "images/icons/era_child.svg";
                } else {
                    el_era.src = "images/icons/era_both.svg";
                }
            }
            const el_time = this.shadowRoot.getElementById("badge-time");
            if (el_time != null) {
                if (!data["filter.time/day"]) {
                    el_time.src = "images/icons/time_night.svg";
                } else if (!data["filter.time/night"]) {
                    el_time.src = "images/icons/time_day.svg";
                } else {
                    el_time.src = "images/icons/time_always.svg";
                }
            }
        }
    }

}
