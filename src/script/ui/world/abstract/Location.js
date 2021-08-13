// GameTrackerJS
import ItemStateManager from "/GameTrackerJS/state/item/StateManager.js";
import AbstractLocation from "/GameTrackerJS/ui/world/Location.js";
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import "/script/state/world/location/LocationState.js";
import LogicViewer from "/script/ui/LogicViewer.js";
import LocationContextMenu from "../../ctxmenu/LocationContextMenu.js";
import ItemPickerMenu from "../../ctxmenu/ItemPickerMenu.js";

export default class Location extends AbstractLocation {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("item", event => {
            this.applyItem(event.data);
        });

        /* context menu */
        this.setDefaultContextMenu(LocationContextMenu);
        this.setContextMenu("itempicker", ItemPickerMenu);
        this.addContextMenuHandler("itempicker", "pick", event => {
            const state = this.getState();
            if (state != null) {
                state.item = event.item;
            }
        });
        this.addDefaultContextMenuHandler("check", event => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("uncheck", event => {
            const state = this.getState();
            if (state != null) {
                state.value = false;
            }
        });
        this.addDefaultContextMenuHandler("associate", event => {
            const mnu_ctx = this.getDefaultContextMenu();
            const mnu_itm = this.getContextMenu("itempicker");
            mnu_itm.show(mnu_ctx.left, mnu_ctx.top);
        });
        this.addDefaultContextMenuHandler("disassociate", event => {
            const state = this.getState();
            if (state != null) {
                state.item = "";
            }
        });
        this.addDefaultContextMenuHandler("show_logic", event => {
            const state = this.getState();
            if (state != null) {
                const title = Language.generateLabel(this.ref);
                LogicViewer.show(state.props.access, title);
            }
        });
        
        /* mouse events */
        this.addEventListener("contextmenu", event => {
            const mnu_ctx = this.getDefaultContextMenu();
            mnu_ctx.show(event.clientX, event.clientY);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        this.applyItem();
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        this.applyItem(state.item);
    }

    applyItem(item = "") {
        const itemEl = this.shadowRoot.getElementById("item");
        if (itemEl != null) {
            itemEl.innerHTML = "";
            if (item) {
                const el_icon = document.createElement("img");
                const itemData = ItemStateManager.get(item);
                const bgImage = Array.isArray(itemData.props.images) ? itemData.props.images[0] : itemData.props.images;
                el_icon.src = bgImage;
                itemEl.append(el_icon);
            }
        }
    }

}
