import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";
import "/emcJS/ui/Icon.js";
import FileData from "/emcJS/data/FileData.js";
import Logger from "/emcJS/util/Logger.js";
import StateStorage from "/script/storage/StateStorage.js";
import Language from "/script/util/Language.js";
import StateHandlerMixin from "/script/ui/mixins/StateHandlerMixin.js";
import AreaStates from "/script/state/AreaStates.js";
import AccessStateEnum from "/script/enum/AccessStateEnum.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";

import "./menus/AreaContextMenu.js";

function setAllListEntries(list, value = true) {
    if (!!list && Array.isArray(list)) {
        for (const entry of list) {
            const category = entry.category;
            const id = entry.id;
            if (category == "location") {
                StateStorage.write(`${category}/${id}`, value);
            } else if (category == "subarea") {
                const subarea = FileData.get(`world/subarea/${id}/list`);
                setAllListEntries(subarea, value);
            } else if (category == "subexit") {
                const subexit = FileData.get(`world/marker/subexit/${id}`);
                const bound = StateStorage.readExtra("exits", subexit.access);
                if (!bound) {
                    continue;
                }
                let entrance = FileData.get(`world/exit/${bound}`);
                if (entrance == null) {
                    entrance = FileData.get(`world/exit/${bound.split(" -> ").reverse().join(" -> ")}`)
                }
                if (entrance != null) {
                    const subarea = FileData.get(`world/${entrance.area}/list`);
                    setAllListEntries(subarea, value);
                }
            } else {
                Logger.error((new Error(`unknown category "${category}" for entry "${id}"`)), "Area");
            }
        }
    }
}

const MNU_CTX = new WeakMap();

export default class AbstractArea extends StateHandlerMixin(UIEventBusMixin(HTMLElement)) {

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
        const mnu_ctx = document.createElement("ootrt-ctxmenu-area");
        MNU_CTX.set(this, mnu_ctx);
        
        mnu_ctx.addEventListener("check", event => {
            const data = FileData.get(`world/${this.ref}/lists`);
            for (const type in data) {
                setAllListEntries(data[type], true);
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.addEventListener("uncheck", event => {
            const data = FileData.get(`world/${this.ref}/lists`);
            for (const type in data) {
                setAllListEntries(data[type], false);
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.addEventListener("setwoth", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "woth";
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.addEventListener("setbarren", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "barren";
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.addEventListener("clearhint", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "";
            }
            event.preventDefault();
            return false;
        });

        
        /* mouse events */
        this.addEventListener("click", event => {
            this.triggerGlobal("location_change", {
                name: this.ref
            });
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

    connectedCallback() {
        super.connectedCallback();
        let el = this;
        while (el.parentElement != null && !el.classList.contains("panel")) {
            el = el.parentElement;
        }
        el.append(MNU_CTX.get(this));
        // state
        const state = this.getState();
        if (state != null) {
            this.hint = state.hint;
            this.setFilterData(state.filter);
            /* --- */
            this.applyAccess(state.access);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        MNU_CTX.get(this).remove();
    }

    setEntrances(active) {
        const entrances = this.shadowRoot.getElementById("entrances");
        if (entrances != null) {
            entrances.innerHTML = "";
            if (active) {
                const el_icon = document.createElement("img");
                el_icon.src = `images/icons/entrance.svg`;
                entrances.append(el_icon);
            }
        }
    }

    applyAccess(data) {
        const value = AccessStateEnum.getName(data.value).toLowerCase();
        /* --- */
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.dataset.state = value;
        }
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get hint() {
        return this.getAttribute('hint');
    }

    set hint(val) {
        this.setAttribute('hint', val);
    }

    static get observedAttributes() {
        return ['ref', 'hint'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'ref':
                    {
                        const textEl = this.shadowRoot.getElementById("text");
                        if (textEl != null) {
                            textEl.innerHTML = Language.translate(newValue);
                        }
                        
                        const state = AreaStates.get(this.ref.slice(5));
                        this.switchState(state);
                        if (state != null && this.isConnected) {
                            this.hint = state.hint;
                            this.setFilterData(state.filter);
                            /* --- */
                            this.applyAccess(state.access);
                        }
                    }
                    break;
                case 'hint':
                    {
                        const hintEl = this.shadowRoot.getElementById("hint");
                        hintEl.innerHTML = "";
                        if (!!newValue && newValue != "") {
                            const el_icon = document.createElement("img");
                            el_icon.src = `images/icons/area_${newValue}.svg`;
                            hintEl.append(el_icon);
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
