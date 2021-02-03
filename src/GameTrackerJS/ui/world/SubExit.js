/* asym-import: off */
import "/emcJS/ui/Icon.js";
/* asym-import: on */
import AccessStateEnum from "../../enum/AccessStateEnum.js";
import WorldStateManagers from "../../state/world/StateManagers.js";
import WorldElement from "./WorldElement.js";
import "../ctxmenu/SubExitContextMenu.js";
import "../ctxmenu/ExitBindingMenu.js";
import Language from "../../util/Language.js";
import iOSTouchHandler from "../../util/iOSTouchHandler.js";

export default class MapSubExit extends WorldElement {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("value", event => {
            this.value = event.data;
            this.refreshList();
            const state = this.getState();
            if (state != null) {
                this.applyAccess(state.access);
            }
        });
        this.registerStateHandler("access", event => {
            this.applyAccess(event.data);
        });
        this.registerStateHandler("hint", event => {
            this.hint = event.data;
        });
        this.registerGlobal("options", event => {
            if (this.isConnected) {
                this.refreshList();
            }
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
                mnu_ext.setValue(state.value);
            } else {
                mnu_ext.fillEntranceSelection("", "");
                mnu_ext.setValue("");
            }
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
                    area.setAllEntries(true);
                }
            }
        });
        mnu_ctx.shadowRoot.getElementById("menu-uncheck").addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area != null) {
                    area.setAllEntries(false);
                }
            }
        });

        /* mouse events */
        this.addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                const area = state.area;
                if (area == null) {
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

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        this.refreshList();
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

    refreshList() {
        // nothing
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

    static get observedAttributes() {
        return ["ref", "value"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref":
                    {
                        const state = WorldStateManagers.getByRef(this.ref);
                        const textEl = this.shadowRoot.getElementById("text");
                        if (textEl != null) {
                            Language.applyLabel(textEl, `exit[${state.props.access}]`);
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
                                    Language.applyLabel(valueEl, `entrance[${newValue}]`);
                                } else {
                                    valueEl.innerHTML = "";
                                }
                            }
                        }
                    }
                    break;
            }
        }
    }

}
