import ObservableStorageObserver from "/emcJS/util/observer/ObservableStorageObserver.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import DataState from "/GameTrackerJS/state/DataState.js";
import ShopItemsResource from "../../resource/ShopItemsResource.js";
import ShopLocationRegistry from "../../registry/ShopLocationRegistry.js";
import "../../util/registerStorages.js";

const shopsanityObserver = new OptionsObserver("shopsanity");

const STORAGES = {
    shopItems: Savestate.getStorage("shopItems"),
    shopItemsPrice: Savestate.getStorage("shopItemsPrice"),
    shopItemsBought: Savestate.getStorage("shopItemsBought"),
    shopItemsName: Savestate.getStorage("shopItemsName")
};

function isSanity() {
    return shopsanityObserver.value != "off";
}

export default class DefaultShopState extends DataState {

    #refill = true;

    #item = "";

    #price = 0;

    #bought = false;

    #apBought = false;

    #name = "";

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        const shopItemsObserver = new ObservableStorageObserver(STORAGES.shopItems, ref);
        this.#item = shopItemsObserver.value;
        shopItemsObserver.addEventListener("change", (event) => {
            this.item = event.value;
        });

        const shopItemsPriceObserver = new ObservableStorageObserver(STORAGES.shopItemsPrice, ref);
        this.#price = shopItemsPriceObserver.value;
        shopItemsPriceObserver.addEventListener("change", (event) => {
            this.price = event.value;
        });

        const shopItemsBoughtObserver = new ObservableStorageObserver(STORAGES.shopItemsBought, ref);
        this.#bought = shopItemsBoughtObserver.value;
        shopItemsBoughtObserver.addEventListener("change", (event) => {
            this.bought = event.value;
        });

        const shopItemsNameObserver = new ObservableStorageObserver(STORAGES.shopItemsName, ref);
        this.#name = shopItemsNameObserver.value;
        shopItemsNameObserver.addEventListener("change", (event) => {
            this.name = event.value;
        });

        /* shoposanity */
        shopsanityObserver.addEventListener("change", () => {
            if (this.item) {
                const itemData = ShopItemsResource.get(this.item);
                this.#refill = itemData?.refill ?? !isSanity();
                // bought
                if (this.#refill) {
                    STORAGES.shopItemsBought.set(ref, true);
                } else {
                    STORAGES.shopItemsBought.set(ref, false);
                }
            } else {
                this.#refill = !isSanity();
                STORAGES.shopItemsBought.set(ref, false);
            }
            // external
            const event = new Event("item");
            event.value = this.item;
            this.dispatchEvent(event);
        });

        /* --- */
        if (this.#item) {
            const itemData = ShopItemsResource.get(this.#item);
            this.#refill = itemData?.refill ?? !isSanity();
        } else {
            this.#refill = !isSanity();
        }
        /* --- */
        if (props.ref != null) {
            ShopLocationRegistry.set(props.ref, this);
        }
    }

    set item(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        const old = this.item;
        if (value != old) {
            this.#item = value;
            STORAGES.shopItems.set(ref, value);
            // data
            if (value) {
                const itemData = ShopItemsResource.get(value);
                this.#refill = itemData?.refill ?? !isSanity();
                // bought
                if (this.#refill) {
                    STORAGES.shopItemsBought.set(ref, true);
                } else {
                    STORAGES.shopItemsBought.set(ref, false);
                }
            } else {
                this.#refill = !isSanity();
                STORAGES.shopItemsBought.set(ref, false);
            }
            // external
            const event = new Event("item");
            event.value = this.item;
            this.dispatchEvent(event);
        }
    }

    get item() {
        if (this.#item !== "") {
            return this.#item;
        } else if (!isSanity()) {
            return this.props.item;
        }
        return "";
    }

    set price(value) {
        const ref = this.ref;
        value = parseInt(value);
        if (isNaN(value) || value < 0) {
            value = 0;
        }
        if (value > 999) {
            value = 999;
        }
        const old = this.price;
        if (value != old) {
            this.#price = value;
            STORAGES.shopItemsPrice.set(ref, value);
            // external
            const event = new Event("price");
            event.value = value;
            this.dispatchEvent(event);
        }
    }

    get price() {
        if (this.#price !== 0) {
            return this.#price;
        } else if (!isSanity()) {
            return this.props.price;
        }
        return 0;
    }

    set bought(value) {
        const ref = this.ref;
        if (typeof value != "boolean" || this.isDefault() || this.isRefill()) {
            value = false;
        }
        const old = this.#bought;
        if (value != old) {
            const oldResValue = this.bought;
            this.#bought = value;
            STORAGES.shopItemsBought.set(ref, value);
            const newResValue = this.bought;
            if (newResValue != oldResValue) {
                // external
                const event = new Event("bought");
                event.value = newResValue;
                this.dispatchEvent(event);
            }
        }
    }

    get bought() {
        return this.#bought || this.#apBought;
    }

    set name(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        const old = this.name;
        if (value != old) {
            this.#name = value;
            STORAGES.shopItemsName.set(ref, value);
            // external
            const event = new Event("name");
            event.value = value;
            this.dispatchEvent(event);
        }
    }

    get name() {
        return this.#name;
    }

    get itemData() {
        if (this.#item !== "") {
            const itemData = ShopItemsResource.get(this.#item);
            if (itemData != null) {
                return {
                    ...itemData,
                    "price": this.price
                };
            } else {
                return {
                    "image": "/images/items/error.png",
                    "category": "hidden_items",
                    "refill": true,
                    "mark": false,
                    "price": "?"
                };
            }
        } else if (!isSanity()) {
            const itemData = ShopItemsResource.get(this.props.item);
            if (itemData != null) {
                return itemData;
            } else {
                return {
                    "image": "/images/items/error.png",
                    "category": "hidden_items",
                    "refill": true,
                    "mark": false,
                    "price": "?"
                };
            }
        }
        return {
            "image": "/images/unknown.svg",
            "category": "hidden_items",
            "refill": false,
            "mark": false,
            "price": "?"
        };
    }

    isRefill() {
        return this.#refill;
    }

    isDefault() {
        return this.#item === "";
    }

    reset() {
        const ref = this.ref;
        STORAGES.shopItems.delete(ref);
        STORAGES.shopItemsPrice.delete(ref);
        STORAGES.shopItemsBought.delete(ref);
        STORAGES.shopItemsName.delete(ref);
    }

    setAPBought(value, silent = false) {
        if (typeof value != "boolean" || this.isRefill()) {
            value = false;
        }
        if (value && this.isDefault()) {
            this.item = "ap_item";
        }
        if (silent) {
            this.#apBought = value;
        } else {
            const old = this.#apBought;
            if (value != old) {
                const oldResValue = this.bought;
                this.#apBought = value;
                const newResValue = this.bought;
                if (newResValue != oldResValue) {
                    // external
                    const event = new Event("bought");
                    event.value = newResValue;
                    this.dispatchEvent(event);
                }
            }
        }
    }

}
