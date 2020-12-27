import FileData from "/emcJS/data/FileData.js";
import "/emcJS/ui/Icon.js";
import WorldRegistry from "../../registry/WorldRegistry.js";
import WorldElement from "./WorldElement.js";
import "./menus/LocationContextMenu.js";
import "./menus/ItemPickerMenu.js";
import LogicViewer from "/script/content/logic/LogicViewer.js";
import Language from "/script/util/Language.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";

export default class AbstractLocation extends WorldElement {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("access", event => {
            const state = this.getState();
            if (state != null) {
                this.applyAccess(event.data, state.value);
            } else {
                this.applyAccess(event.data, false);
            }
        });
        this.registerStateHandler("value", event => {
            const textEl = this.shadowRoot.getElementById("text");
            if (textEl != null) {
                textEl.dataset.checked = event.data;
                const state = this.getState();
                if (state != null) {
                    this.applyAccess(state.access, event.data);
                } else {
                    this.applyAccess(false, event.data);
                }
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
    
    applyAccess(access, checked) {
        const textEl = this.shadowRoot.getElementById("text");
        const badgeEl = this.shadowRoot.getElementById("badge");
        /* access */
        if (textEl != null) {
            textEl.dataset.state = access ? "available" : "unavailable";
        }
        /* badge */
        if (badgeEl != null) {
            badgeEl.access = checked ? "opened" : access ? "available" : "unavailable";
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/location.svg");
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.dataset.checked = false;
        }
        this.item = "";
        this.applyAccess(false, false);
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/location.svg");
        if (state != null) {
            const textEl = this.shadowRoot.getElementById("text");
            if (textEl != null) {
                textEl.dataset.checked = state.value;
            }
            this.item = state.item ?? "";
            this.applyAccess(state.access, state.value);
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
                        const state = WorldRegistry.get(this.ref);
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

}
