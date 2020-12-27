import Logger from "/emcJS/util/Logger.js";
import "/emcJS/ui/Icon.js";
import AccessStateEnum from "../../enum/AccessStateEnum.js";
import WorldRegistry from "../../registry/WorldRegistry.js";
import ExitRegistry from "../../registry/ExitRegistry.js";
import LocationState from "../../state/world/location/DefaultState.js";
import WorldElement from "./WorldElement.js";
import "./menu/SubAreaContextMenu.js";
import Language from "/script/util/Language.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";

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

export default class AbstractSubArea extends WorldElement {

    constructor(type) {
        super();
        /* --- */
        this.registerStateHandler("access", event => {
            this.applyAccess(event.data);
        });
        this.registerStateHandler("hint", event => {
            this.hint = event.data;
        });
        this.registerGlobal(["state", "randomizer_options"], event => {
            if (this.isConnected) {
                this.refreshList();
            }
        });

        /* context menu */
        const mnu_ctx = document.createElement("gt-ctxmenu-subarea");
        this.setContextMenu("main", mnu_ctx);
        
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
        const textEl = this.shadowRoot.getElementById("text");
        const badgeEl = this.shadowRoot.getElementById("badge");
        const entrancesEl = this.shadowRoot.getElementById("entrances");
        const value = AccessStateEnum.getName(data.value).toLowerCase();
        /* access */
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
                el_icon.src = "images/icons/entrance.svg";
                entrancesEl.append(el_icon);
            }
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/area.svg");
        this.hint = "";
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/area.svg");
        if (state != null) {
            this.hint = state.hint;
            this.applyAccess(state.access);
        }
    }

    refreshList() {
        // nothing
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
                        const state = WorldRegistry.get(this.ref);
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

}
