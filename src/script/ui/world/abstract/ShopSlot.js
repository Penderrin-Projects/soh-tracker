// GameTrackerJS
import AbstractLocation from "/GameTrackerJS/ui/world/Location.js";
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import ShopItemsResource from "/script/resource/ShopItemsResource.js";
import "/script/state/world/location/LocationState.js";
import "../../ctxmenu/ShopSlotContextMenu.js";
import ShopItemChoiceDialog from "../../shops/ShopItemChoiceDialog.js";

export default class ShopSlot extends AbstractLocation {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("item", event => {
            this.applyItem();
        });
        this.registerStateHandler("bought", event => {
            this.applyItem();
        });
        this.registerStateHandler("price", event => {
            this.applyItem();
        });

        /* context menu */
        const mnu_ctx = document.createElement("ootrt-ctxmenu-shopslot");
        this.setContextMenu("main", mnu_ctx);

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
            this./*#*/__editItem(event)
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

    applyItem() {
        const state = this.getState();
        const itemEl = this.shadowRoot.getElementById("item");
        if (itemEl != null) {
            if (state.item) {
                const itemData = ShopItemsResource.get(state.item);
                itemEl.src = itemData?.image ?? "/images/items/unknown.png";
            }
            if (state.price) {
                itemEl.text = state.price;
            }
        }
    }

    /*#*/__editItem(event) {
        const state = this.getState();
        if (state != null) {
            const d = new ShopItemChoiceDialog(Language.generateLabel(this.ref));
            d.item = state.item;
            d.price = state.price;
            d.addEventListener("submit", function(result) {
                if (result) {
                    const state = this.getState();
                    if (state != null) {
                        state.item = result.item;
                        state.price = result.price;
                    }
                }
            }.bind(this));
            d.show();
        }
    }

}
