/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
import "/emcJS/ui/Icon.js";
/* asym-import: on */
import AccessStateEnum from "../../enum/AccessStateEnum.js";
import WorldStateManagers from "../../state/world/StateManagers.js";
import WorldElement from "./WorldElement.js";
import "../ctxmenu/AreaContextMenu.js";
import Language from "../../util/Language.js";
import iOSTouchHandler from "../../util/iOSTouchHandler.js";

export default class AbstractArea extends WorldElement {

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
        const mnu_ctx = document.createElement("gt-ctxmenu-area");
        this.setContextMenu("main", mnu_ctx);
        
        mnu_ctx.addEventListener("check", event => {
            const state = this.getState();
            if (state != null) {
                state.setAllEntries(true);
            }
        });
        mnu_ctx.addEventListener("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                state.setAllEntries(false);
            }
        });
        mnu_ctx.addEventListener("setwoth", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "woth";
            }
        });
        mnu_ctx.addEventListener("setbarren", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "barren";
            }
        });
        mnu_ctx.addEventListener("clearhint", event => {
            const state = this.getState();
            if (state != null) {
                state.hint = "";
            }
        });
        
        /* mouse events */
        this.addEventListener("click", event => {
            EventBus.trigger("location_change", {
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

    getMainContextMenuEntries() {
        // empty
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
                el_icon.src = `images/icons/entrance.svg`;
                entrancesEl.append(el_icon);
            }
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/area.svg");
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.dataset.state = "unavailable";
        }
        this.hint = "";
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/area.svg");
        if (state != null) {
            this.hint = state.hint;
            this.applyAccess(state.access);
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get hint() {
        return this.getAttribute("hint");
    }

    set hint(val) {
        this.setAttribute("hint", val);
    }

    static get observedAttributes() {
        return ["ref", "hint"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref":
                    {
                        const state = WorldStateManagers.getByRef(this.ref);
                        const textEl = this.shadowRoot.getElementById("text");
                        if (textEl != null) {
                            textEl.innerHTML = Language.translate(newValue);
                        }
                        this.switchState(state);
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
