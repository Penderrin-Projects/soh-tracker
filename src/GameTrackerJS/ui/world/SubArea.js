/* asym-import: off */
import "/emcJS/ui/Icon.js";
/* asym-import: on */
import AccessStateEnum from "../../enum/AccessStateEnum.js";
import WorldStateManagers from "../../state/world/StateManagers.js";
import WorldElement from "./WorldElement.js";
import "../ctxmenu/SubAreaContextMenu.js";
import Language from "../../util/Language.js";
import iOSTouchHandler from "../../util/iOSTouchHandler.js";

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
        this.registerGlobal(["state", "options"], event => {
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
                state.setAllEntries(true);
            }
        });
        mnu_ctx.addEventListener("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                state.setAllEntries(false);
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

    refreshList() {
        // nothing
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    static get observedAttributes() {
        return ["ref"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref":
                    {
                        const state = WorldStateManagers.getByRef(this.ref);
                        const textEl = this.shadowRoot.getElementById("text");
                        if (textEl != null) {
                            Language.applyLabel(textEl, newValue);
                        }
                        this.switchState(state);
                    }
                    break;
            }
        }
    }

}
