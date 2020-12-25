import Logger from "/emcJS/util/Logger.js";
import "/emcJS/ui/Icon.js";
import StateDataEventManagerMixin from "/script/ui/mixin/StateDataEventManager.js";
import ContextMenuManagerMixin from "/script/ui/mixin/ContextMenuManager.js";
import WorldRegistry from "/script/registries/WorldRegistry.js";
import ExitRegistry from "/script/registries/ExitRegistry.js";
import LocationState from "/script/state/world/locations/LocationState.js";
import SubExitStates from "/script/state/SubExitStates.js";
import Language from "/script/util/Language.js";
import AccessStateEnum from "/script/enum/AccessStateEnum.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";
import "./menus/SubExitContextMenu.js";
import "./menus/ExitBindingMenu.js";

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
                Logger.error((new Error(`unknown category "${category}" for entry "${id}"`)), "Area");
            }
        }
    }
}

export default class MapSubExit extends ContextMenuManagerMixin(StateDataEventManagerMixin(HTMLElement)) {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("access", event => {
            this.applyAccess(event.data);
        });
        this.registerStateHandler("value", event => {
            
        });
        this.registerStateHandler("hint", event => {
            this.hint = event.data;
        });

        /* context menu */
        const mnu_ctx = document.createElement("ootrt-ctxmenu-exit");
        this.setContextMenu("exit", mnu_ctx);
        
        const mnu_ext = document.createElement("ootrt-ctxmenu-exitbinding");
        this.setContextMenu("exitbinding", mnu_ext);

        mnu_ext.addEventListener("change", event => {
            const state = this.getState();
            if (state != null) {
                state.value = event.value;
            }
        });
        mnu_ctx.addEventListener("associate", event => {
            const state = this.getState();
            if (state != null) {
                mnu_ext.fillEntranceSelection(state.props.access, state.value);
            }
            mnu_ext.setValue(state.value);
            mnu_ext.show(mnu_ctx.left, mnu_ctx.top);
        });
        mnu_ctx.addEventListener("deassociate", event => {
            const state = this.getState();
            if (state != null) {
                state.value = "";
            }
        });
        mnu_ctx.shadowRoot.getElementById("menu-check").addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    const list = area.getFilteredList();
                    setAllListEntries(list, true);
                }
            }
        });
        mnu_ctx.shadowRoot.getElementById("menu-uncheck").addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    const list = area.getFilteredList();
                    setAllListEntries(list, false);
                }
            }
        });

        /* mouse events */
        this.addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area == null) {
                    const state = this.getState();
                    if (state != null) {
                        mnu_ext.fillEntranceSelection(state.props.access);
                    }
                    mnu_ext.show(event.clientX, event.clientY);
                }
            }
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
        const textEl = this.shadowRoot.getElementById("text");
        const entrances = this.shadowRoot.getElementById("entrances");
        if (typeof data == "boolean") {
            /* access */
            if (!data) {
                textEl.dataset.state = "available";
            } else {
                textEl.dataset.state = "unavailable";
            }
            /* entrances */
            if (entrances != null) {
                entrances.innerHTML = "";
            }
        } else {
            /* access */
            const value = AccessStateEnum.getName(data.value).toLowerCase();
            if (textEl != null) {
                textEl.dataset.state = value;
            }
            /* entrances */
            if (entrances != null) {
                entrances.innerHTML = "";
                if (data.entrances) {
                    const el_icon = document.createElement("img");
                    el_icon.src = `images/icons/entrance.svg`;
                    entrances.append(el_icon);
                }
            }
        }
    }

    applyStateValues(state) {
        this.value = state.value;
        const area = state.area;
        if (area != null) {
            this.hint = area.hint;
        } else {
            this.hint = "";
        }
        this.setFilterData(state.filter);
        this.applyAccess(state.access);
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    static get observedAttributes() {
        return ['ref', 'value'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'ref':
                    {
                        const state = SubExitStates.get(this.ref);
                        const textEl = this.shadowRoot.getElementById("text");
                        if (textEl != null) {
                            textEl.innerHTML = Language.translate(state.props.access);
                        }
                        this.switchState(state);
                    }
                    break;
                case 'value':
                    {
                        const state = this.getState();
                        if (state != null) {
                            const valueEl = this.shadowRoot.getElementById("value");
                            if (newValue) {
                                if (valueEl != null) {
                                    valueEl.innerHTML = Language.translate(newValue);
                                    const area = state.area;
                                    if (area != null) {
                                        this.hint = area.hint;
                                    } else {
                                        this.hint = "";
                                    }
                                }
                            } else {
                                if (valueEl != null) {
                                    valueEl.innerHTML = "";
                                    this.hint = "";
                                }
                            }
                        }
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
