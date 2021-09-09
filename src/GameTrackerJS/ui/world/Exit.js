// frameworks
import EventBus from "/emcJS/event/EventBus.js";
import "/emcJS/ui/Icon.js";

import WorldStateManager from "../../state/world/WorldStateManager.js";
import EmptyState from "../../state/world/EmptyState.js";
import WorldElement from "./WorldElement.js";
import ExitContextMenu from "../ctxmenu/ExitContextMenu.js";
import ExitBindingContextMenu from "../ctxmenu/ExitBindingContextMenu.js";
import Language from "../../util/Language.js";

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
        this.setDefaultContextMenu(ExitContextMenu);
        this.setContextMenu("exitbinding", ExitBindingContextMenu);
        this.addContextMenuHandler("exitbinding", "change", event => {
            const state = this.getState();
            if (state != null) {
                state.value = event.value;
            }
        });
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
    }

    clickHandler(event) {
        const state = this.getState();
        if (state != null) {
            const area = state.area;
            if (area != null) {
                if (area instanceof EmptyState) {
                    // nothing
                } else /*if (area instanceof AreaState)*/ {
                    EventBus.trigger("location_change", {
                        name: area.ref
                    });
                }
            } else {
                const mnu_ext = this.getContextMenu("exitbinding");
                mnu_ext.fillEntranceSelection(state.props.access, state.value);
                mnu_ext.setValue(state.value);
                mnu_ext.show(event.clientX, event.clientY);
            }
        }
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
    
    applyAccess(data) {
        super.applyAccess(data);
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
                        const state = WorldStateManager.getByRef(this.ref);
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
