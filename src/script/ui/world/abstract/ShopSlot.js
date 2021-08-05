// GameTrackerJS
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import AbstractLocation from "/GameTrackerJS/ui/world/Location.js";
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import ShopItemsResource from "/script/resource/ShopItemsResource.js";
import "/script/state/world/location/LocationState.js";
import "../../ctxmenu/ShopSlotContextMenu.js";
import ShopItemChoiceDialog from "../../shops/ShopItemChoiceDialog.js";

const shopsanityObserver = new OptionsObserver("option.shopsanity");

export default class ShopSlot extends AbstractLocation {

    constructor() {
        super();
        /* --- */
        shopsanityObserver.addEventListener("change", () => {
            this.applyItem();
        });
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
        this.setDefaultContextMenu(mnu_ctx);
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
            this./*#*/__editItem();
        });
        mnu_ctx.addEventListener("junk", event => {
            const state = this.getState();
            if (state != null) {
                state.item = "item.refill_item";
                state.price = "0";
                state.value = true;
            }
        });
        mnu_ctx.addEventListener("disassociate", event => {
            const state = this.getState();
            if (state != null) {
                state.reset();
            }
        });
    }

    clickHandler(event) {
        const state = this.getState();
        if (state != null) {
            if (event.ctrlKey) {
                if (state.item != "item.refill_item") {
                    state.item = "item.refill_item";
                    state.price = "0";
                    state.value = true;
                } else {
                    state.reset();
                }
            } else {
                if (state.isDefault()) {
                    this./*#*/__editItem();
                } else {
                    super.clickHandler(event);
                }
            }
        }
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
            if (state.item != null) {
                const itemData = ShopItemsResource.get(state.item);
                itemEl.src = itemData?.image ?? "/images/items/unknown.png";
            }
            if (state.price != null) {
                itemEl.text = state.price;
            }
        }
    }

    /*#*/__editItem() {
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
