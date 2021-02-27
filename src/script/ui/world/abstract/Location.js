// GameTrackerJS
import ItemStateManager from "/GameTrackerJS/state/item/StateManager.js";
import AbstractLocation from "/GameTrackerJS/ui/world/Location.js";
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import "/script/state/world/location/LocationState.js";
import LogicViewer from "/script/ui/LogicViewer.js";
import "../../ctxmenu/LocationContextMenu.js";
import "../../ctxmenu/ItemPickerMenu.js";

export default class MapLocation extends AbstractLocation {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("item", event => {
            this.applyItem(event.data);
        });

        /* context menu */
        const mnu_ctx = document.createElement("ootrt-ctxmenu-location");
        this.setContextMenu("main", mnu_ctx);

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
            const state = this.getState();
            if (state != null) {
                state.item = "";
            }
        });
        mnu_ctx.addEventListener("show_logic", event => {
            const state = this.getState();
            if (state != null) {
                const title = Language.generateLabel(this.ref);
                LogicViewer.show(state.props.access, title);
            }
        });
        
        /* mouse events */
        this.addEventListener("contextmenu", event => {
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
