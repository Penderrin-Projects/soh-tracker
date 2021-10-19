// GameTrackerJS
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import AbstractLocation from "/GameTrackerJS/ui/world/Location.js";
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import "/script/state/world/location/LocationState.js";
import ShopSlotContextMenu from "../../ctxmenu/ShopSlotContextMenu.js";
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
        this.setDefaultContextMenu(ShopSlotContextMenu);
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
            this./*#*/__editItem();
        });
        this.addDefaultContextMenuHandler("junk", event => {
            const state = this.getState();
            if (state != null) {
                state.item = "item.refill_item";
                state.price = "0";
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("disassociate", event => {
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
        const itemEl = this.shadowRoot.getElementById("item");
        if (itemEl != null) {
            const state = this.getState();
            const itemData = state?.itemData;
            if (itemData != null) {
                itemEl.src = itemData?.image ?? "/images/items/unknown.png";
                itemEl.text = state.price ?? "?";
            } else {
                itemEl.src = "/images/items/unknown.png";
                itemEl.text = "?";
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
