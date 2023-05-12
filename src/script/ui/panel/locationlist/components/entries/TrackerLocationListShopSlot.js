import {
    mix
} from "/emcJS/util/Mixin.js";
import "/emcJS/ui/LabeledIcon.js";
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import LocationListEntry from "/GameTrackerJS/ui/panel/locationlist/components/abstract/LocationListEntry.js";
import AccessTextMarkerMixin from "/GameTrackerJS/ui/panel/worldlist/components/mixin/AccessTextMarkerMixin.js";
import ShopItemChoiceDialog from "../../../../dialog/ShopItemChoiceDialog/ShopItemChoiceDialog.js";
import ShopSlotContextMenu from "../../../../ctxmenu/ShopSlotContextMenu";
import TPL from "./TrackerLocationListShopSlot.js.html" assert {type: "html"};
import STYLE from "./TrackerLocationListShopSlot.js.css" assert {type: "css"};

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    const itemEl = tpl.getElementById("item");
    textEl.insertAdjacentElement("afterend", itemEl);
}

const shopsanityObserver = new OptionsObserver("shopsanity");

const BaseClass = mix(
    LocationListEntry
).with(
    AccessTextMarkerMixin
);

export default class TrackerLocationListShopSlot extends BaseClass {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        badgeEl.hideValues = true;
        /* item */
        const itemEl = this.shadowRoot.getElementById("item");
        itemEl.valign = "end";
        itemEl.halign = "end";
        /* observer */
        shopsanityObserver.addEventListener("change", () => {
            const state = this.getState();
            this.#applyItem(state?.itemData, state?.price);
        });
        /* state handler */
        this.registerStateHandler("item", () => {
            const state = this.getState();
            this.#applyItem(state?.itemData, state?.price);
        });
        this.registerStateHandler("bought", () => {
            const state = this.getState();
            this.#applyItem(state?.itemData, state?.price);
        });
        this.registerStateHandler("price", () => {
            const state = this.getState();
            this.#applyItem(state?.itemData, state?.price);
        });
        /* context menu */
        this.setDefaultContextMenu(ShopSlotContextMenu);
        this.addDefaultContextMenuHandler("check", () => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("uncheck", () => {
            const state = this.getState();
            if (state != null) {
                state.value = false;
            }
        });
        this.addDefaultContextMenuHandler("associate", () => {
            this.#editItem();
        });
        this.addDefaultContextMenuHandler("junk", () => {
            const state = this.getState();
            if (state != null) {
                state.item = "refill_item";
                state.price = "0";
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("disassociate", () => {
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
                if (state.item != "refill_item") {
                    state.item = "refill_item";
                    state.price = "0";
                    state.value = true;
                } else {
                    state.reset();
                }
            } else if (state.isDefault()) {
                this.#editItem();
            } else {
                state.value = !state.value;
            }
        }
    }

    applyDefaultValues() {
        super.applyDefaultValues("images/icons/shops.svg");
        this.#applyItem();
    }

    applyStateValues(state) {
        super.applyStateValues(state, "images/icons/shops.svg");
        this.#applyItem(state.itemData);
    }

    #applyItem(itemData) {
        const itemEl = this.shadowRoot.getElementById("item");
        if (itemEl != null) {
            if (itemData != null) {
                itemEl.src = itemData.image;
                itemEl.text = itemData.price;
            } else {
                itemEl.src = "/images/items/unknown.png";
                itemEl.text = "?";
            }
        }
    }

    #editItem() {
        const state = this.getState();
        if (state != null) {
            const d = new ShopItemChoiceDialog(this.ref);
            d.item = state.item;
            d.price = state.price;
            d.addEventListener("submit", (result) => {
                if (result) {
                    const state = this.getState();
                    if (state != null) {
                        state.item = result.item;
                        state.price = result.price;
                    }
                }
            });
            d.show();
        }
    }

    get category() {
        return "location";
    }

}

customElements.define("ootrt-locationlist-shopslot", TrackerLocationListShopSlot);
UIRegistry.get("locationlist-location")
    .register("shopslot", TrackerLocationListShopSlot);
