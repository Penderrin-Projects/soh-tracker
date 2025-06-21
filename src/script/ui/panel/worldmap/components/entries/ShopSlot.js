import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import WorldMapLocation from "/GameTrackerJS/ui/panel/worldmap/components/entries/Location.js";
import MetaObserver from "/GameTrackerJS/util/observer/MetaObserver.js";
import ShopItemChoiceDialog from "../../../../dialog/ShopItemChoiceDialog/ShopItemChoiceDialog.js";
import ShopSlotContextMenu from "../../../../ctxmenu/ShopSlotContextMenu.js";
import APHintLocations from "../../../../../resource/APHintLocations.js";

const archipelagoActiveObserver = new MetaObserver("archipelago");
const apHintLocations = APHintLocations.get();

const shopsanityObserver = new OptionsObserver("shopsanity");

export default class WorldMapShopSlot extends WorldMapLocation {

    #itemEl;

    constructor() {
        super();
        /* --- */
        this.#itemEl = this.shadowRoot.getElementById("item");
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        badgeEl.hideValues = true;
        /* observer */
        shopsanityObserver.onChange(() => {
            const state = this.getState();
            this.#applyItem(state?.itemData, state?.price);
        });
        /* state handler */
        this.registerStateHandler("item", () => {
            const state = this.getState();
            this.#applyItem(state?.itemData, state?.price);
        });
        this.registerStateHandler("value", () => {
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
        this.addDefaultContextMenuHandler("hint_ap_location", () => {
            const apHintLocation = apHintLocations[this.ref];
            if (apHintLocation != null) {
                const viewchoiceEl = document.getElementById("main-content");
                viewchoiceEl.active = "ap";
                const apTextClient = document.getElementById("ap-textclient");
                apTextClient.setLocationHintMessage(apHintLocation);
            }
        });
        /* AP */
        if (!archipelagoActiveObserver.value) {
            this.toggleDefaultContextMenuGroupActive("ap", false);
        }
        archipelagoActiveObserver.onChange((event) => {
            const {value} = event;
            this.toggleDefaultContextMenuGroupActive("ap", !!value);
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
        if (this.#itemEl != null) {
            if (itemData != null) {
                this.#itemEl.src = itemData.image;
                this.#itemEl.text = itemData.price;
            } else {
                this.#itemEl.src = "/images/items/unknown.png";
                this.#itemEl.text = "?";
            }
        }
    }

    #editItem() {
        const state = this.getState();
        if (state != null) {
            const d = new ShopItemChoiceDialog(`location[${this.ref}]`);
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

    get type() {
        return "Location";
    }

}

customElements.define("ootrt-worldmap-shopslot", WorldMapShopSlot);
UIRegistry.get("worldmap-location").register("shopslot", WorldMapShopSlot);
