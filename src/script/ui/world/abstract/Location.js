import FileData from "/emcJS/data/FileData.js";
import "/emcJS/ui/Icon.js";
import LogicViewer from "/script/content/logic/LogicViewer.js";
import Language from "/script/util/Language.js";
import StateDataEventManagerMixin from "/script/ui/mixin/StateDataEventManager.js";
import ContextMenuManagerMixin from "/script/ui/mixin/ContextMenuManager.js";
import LocationStates from "/script/state/LocationStates.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";
import "./menus/LocationContextMenu.js";
import "./menus/ItemPickerMenu.js";

export default class AbstractLocation extends ContextMenuManagerMixin(StateDataEventManagerMixin(HTMLElement)) {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("access", event => {
            const textEl = this.shadowRoot.getElementById("text");
            if (textEl != null) {
                textEl.dataset.state = event.data ? "available" : "unavailable";
            }
        });
        this.registerStateHandler("value", event => {
            const textEl = this.shadowRoot.getElementById("text");
            if (textEl != null) {
                textEl.dataset.checked = !!event.data;
            }
        });
        this.registerStateHandler("item", event => {
            this.item = event.data;
        });

        /* context menu */
        const mnu_ctx = document.createElement("ootrt-ctxmenu-location");
        this.setContextMenu("location", mnu_ctx);

        const mnu_itm = document.createElement("ootrt-ctxmenu-itempicker");
        this.setContextMenu("itempicker", mnu_itm);

        mnu_itm.addEventListener("pick", event => {
            const state = this.getState();
            if (state != null) {
                state.item = event.item;
            }
        });
        mnu_ctx.addEventListener("check", event => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        mnu_ctx.addEventListener("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                state.value = false;
            }
        });
        mnu_ctx.addEventListener("associate", event => {
            mnu_itm.show(mnu_ctx.left, mnu_ctx.top);
        });
        mnu_ctx.addEventListener("disassociate", event => {
            if (this.ref) {
                const state = this.getState();
                if (state != null) {
                    state.item = "";
                }
            }
        });
        mnu_ctx.addEventListener("show_logic", event => {
            const title = Language.translate(this.ref);
            LogicViewer.show(this.access, title);
        });
        
        /* mouse events */
        this.addEventListener("click", event => {
            const state = this.getState();
            if (state != null) {
                state.value = !state.value;
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

    applyDefaultValues() {
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.dataset.checked = false;
            textEl.dataset.state = "unavailable";
        }
        const typeIconEl = this.shadowRoot.getElementById("badge-type");
        if (typeIconEl != null) {
            typeIconEl.src = "images/icons/location.svg";
        }
        this.item = "";
        this.setFilterData({});
    }

    applyStateValues(state) {
        if (state != null) {
            const textEl = this.shadowRoot.getElementById("text");
            if (textEl != null) {
                textEl.dataset.checked = state.value;
                textEl.dataset.state = state.access ? "available" : "unavailable";
            }
            const typeIconEl = this.shadowRoot.getElementById("badge-type");
            if (typeIconEl != null) {
                typeIconEl.src = state.props.icon ?? "images/icons/location.svg";
            }
            this.item = state.item ?? "";
            this.setFilterData(state.filter);
        }
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get item() {
        return this.getAttribute('item');
    }

    set item(val) {
        this.setAttribute('item', val);
    }

    static get observedAttributes() {
        return ['ref', 'item'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'ref':
                    {
                        const state = LocationStates.get(this.ref);
                        const textEl = this.shadowRoot.getElementById("text");
                        if (textEl != null) {
                            textEl.innerHTML = Language.translate(newValue);
                        }
                        this.switchState(state);
                    }
                    break;
                case 'item':
                    {
                        const itemEl = this.shadowRoot.getElementById("item");
                        if (itemEl != null) {
                            itemEl.innerHTML = "";
                            if (!!newValue && newValue != "false") {
                                const el_icon = document.createElement("img");
                                const itemsData = FileData.get("items")[newValue];
                                const bgImage = Array.isArray(itemsData.images) ? itemsData.images[0] : itemsData.images;
                                el_icon.src = bgImage;
                                itemEl.append(el_icon);
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
