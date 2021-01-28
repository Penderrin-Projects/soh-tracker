import EventBus from "/emcJS/event/EventBus.js";
import Logger from "/emcJS/util/Logger.js";
import "/emcJS/ui/Icon.js";
import AccessStateEnum from "../../enum/AccessStateEnum.js";
import WorldRegistry from "../../registry/WorldRegistry.js";
import ExitRegistry from "../../registry/ExitRegistry.js";
import LocationState from "../../state/world/location/DefaultState.js";
import WorldElement from "./WorldElement.js";
import "../ctxmenu/ExitContextMenu.js";
import "../ctxmenu/ExitBindingMenu.js";
import Language from "../../util/Language.js";
import iOSTouchHandler from "../../util/iOSTouchHandler.js";

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

export default class MapExit extends WorldElement {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("value", event => {
            this.value = event.data;
        });
        this.registerStateHandler("access", event => {
            this.applyAccess(event.data);
        });
        this.registerStateHandler("hint", event => {
            this.hint = event.data;
        });

        /* context menu */
        const mnu_ctx = document.createElement("gt-ctxmenu-exit");
        this.setContextMenu("main", mnu_ctx);
        
        const mnu_ext = document.createElement("gt-ctxmenu-exitbinding");
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
            } else {
                mnu_ext.fillEntranceSelection("", "");
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
        mnu_ctx.shadowRoot.getElementById("menu-setwoth").addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.hint = "woth";
                }
            }
        });
        mnu_ctx.shadowRoot.getElementById("menu-setbarren").addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.hint = "barren";
                }
            }
        });
        mnu_ctx.shadowRoot.getElementById("menu-clearhint").addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.hint = "";
                }
            }
        });

        /* mouse events */
        this.addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    EventBus.trigger("location_change", {
                        name: area.ref
                    });
                } else {
                    mnu_ext.fillEntranceSelection(state.props.access, state.value);
                    mnu_ext.setValue(state.value);
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
        const badgeEl = this.shadowRoot.getElementById("badge");
        const entrancesEl = this.shadowRoot.getElementById("entrances");
        if (typeof data == "boolean") {
            /* access */
            if (textEl != null) {
                textEl.dataset.state = data ? "available" : "unavailable";
            }
            /* badge */
            if (badgeEl != null) {
                badgeEl.access = data ? "available" : "unavailable";
            }
            /* entrances */
            if (entrancesEl != null) {
                entrancesEl.innerHTML = "";
            }
        } else {
            /* access */
            const value = AccessStateEnum.getName(data.value).toLowerCase();
            if (textEl != null) {
                textEl.dataset.state = value;
            }
            /* badge */
            if (badgeEl != null) {
                badgeEl.access = value;
            }
            /* entrances */
            if (entrancesEl != null) {
                entrancesEl.innerHTML = "";
                if (data.entrances) {
                    const el_icon = document.createElement("img");
                    el_icon.src = `images/icons/entrance.svg`;
                    entrancesEl.append(el_icon);
                }
            }
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/entrance.svg");
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.dataset.state = "unavailable";
        }
        this.hint = "";
        this.value = "";
        this.applyAccess(false);
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/entrance.svg");
        if (state != null) {
            this.value = state.value;
            const area = state.area;
            if (area != null) {
                this.hint = area.hint;
            } else {
                this.hint = "";
            }
            this.applyAccess(state.access);
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

    get hint() {
        return this.getAttribute("hint");
    }

    set hint(val) {
        this.setAttribute("hint", val);
    }

    static get observedAttributes() {
        return ["ref", "value", "hint"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref":
                    {
                        const state = WorldRegistry.get(this.ref);
                        const textEl = this.shadowRoot.getElementById("text");
                        if (textEl != null) {
                            textEl.innerHTML = Language.translate(`exit[${state.props.access}]`);
                        }
                        this.switchState(state);
                    }
                    break;
                case "value":
                    {
                        const state = this.getState();
                        if (state != null) {
                            const valueEl = this.shadowRoot.getElementById("value");
                            if (valueEl != null) {
                                if (newValue) {
                                    valueEl.innerHTML = Language.translate(`entrance[${newValue}]`);
                                    const area = state.area;
                                    if (area != null) {
                                        this.hint = area.hint;
                                    } else {
                                        this.hint = "";
                                    }
                                } else {
                                    valueEl.innerHTML = "";
                                    this.hint = "";
                                }
                            }
                        }
                    }
                    break;
                case "hint":
                    {
                        const hintEl = this.shadowRoot.getElementById("hint");
                        if (hintEl != null) {
                            hintEl.innerHTML = "";
                            if (!!newValue && newValue != "") {
                                const el_icon = document.createElement("img");
                                el_icon.src = `images/icons/area_${newValue}.svg`;
                                hintEl.append(el_icon);
                            }
                        }
                    }
                    break;
            }
        }
    }

}
