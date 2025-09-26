
import ObservableStorageObserver from "/emcJS/util/observer/data/storage/ObservableStorageObserver.js";
import LocationStateManager from "/GameTrackerJS/statemanager/world/location/LocationStateManager.js";
import ItemStateManager from "/GameTrackerJS/statemanager/item/ItemStateManager.js";
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import DefaultAPLocationState from "./DefaultAPLocationState.js";
import ShopItemsResource from "../../../resource/ShopItemsResource.js";
import ShopsResource from "../../../resource/ShopsResource.js";
import {AP_STORAGES} from "../../../util/archipelago/storage/RegisterAPStorage.js";

const shopsanityObserver = new OptionsObserver("shopsanity");

const STORAGES = {
    locations: Savestate.getStorage("locations"),
    locationItems: Savestate.getStorage("locationItems"),
    shopItemsPrice: Savestate.getStorage("shopItemsPrice"),
    shopItemsName: Savestate.getStorage("shopItemsName")
};

const WALLET = ItemStateManager.get("wallet");
const WALLET_CAPACITIES = [99, 200, 500, 999];
const SHOP_PROPS = new Map();

{
    const shops = ShopsResource.get();
    for (const name in shops) {
        for (let i = 0; i < 8; ++i) {
            const shopSlot = shops[name][i];
            SHOP_PROPS.set(shopSlot.ref, shopSlot);
        }
    }
}

function isSanity() {
    return shopsanityObserver.value != "off";
}

export default class ShopSlotState extends DefaultAPLocationState {

    #refill = true;

    #item = "";

    #price = 0;

    #name = "";

    #itemData = null;

    #shopProps = null;

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        this.#shopProps = SHOP_PROPS.get(ref);

        const locationItemsObserver = new ObservableStorageObserver(STORAGES.locationItems, ref);
        this.#item = locationItemsObserver.value;
        locationItemsObserver.onChange((event) => {
            this.item = event.value;
        });

        const shopItemsPriceObserver = new ObservableStorageObserver(STORAGES.shopItemsPrice, ref);
        this.#price = shopItemsPriceObserver.value;
        shopItemsPriceObserver.onChange((event) => {
            this.price = event.value;
        });

        const shopItemsNameObserver = new ObservableStorageObserver(STORAGES.shopItemsName, ref);
        this.#name = shopItemsNameObserver.value;
        shopItemsNameObserver.onChange((event) => {
            this.name = event.value;
        });

        Savestate.addEventListener("load", () => {
            this.item = STORAGES.locationItems.get(this.ref);
            this.price = STORAGES.shopItemsPrice.get(this.ref);
            this.name = STORAGES.shopItemsName.get(this.ref);
            this.value = STORAGES.locations.get(this.ref);
            this.setAPValue(AP_STORAGES.locations.get(this.ref));
        });

        /* shoposanity */
        shopsanityObserver.onChange(() => {
            if (this.item) {
                this.#refill = this.#itemData?.refill ?? !isSanity();
            } else {
                this.#refill = !isSanity();
            }
            this.refreshAccess();
            // external
            const event = new Event("item");
            event.value = this.item;
            this.dispatchEvent(event);
        });

        /* --- */
        if (this.#item) {
            this.#itemData = ShopItemsResource.get(this.#item);
            this.#refill = this.#itemData?.refill ?? !isSanity();
        } else if (isSanity()) {
            this.#itemData = null;
            this.#refill = false;
        } else {
            this.#itemData = ShopItemsResource.get(this.#shopProps.item);
            this.#refill = true;
        }

        /* --- */
        WALLET.addEventListener("value", () => {
            this.refreshAccess();
        });
        this.refreshAccess();
    }

    get shopProps() {
        return this.#shopProps;
    }

    get reachable() {
        if (WALLET_CAPACITIES[WALLET.value] < this.price) {
            return false;
        }
        return super.reachable;
    }

    set value(value) {
        if (typeof value != "boolean" || this.isDefault() || this.isRefill()) {
            value = false;
        }
        super.value = value;
    }

    get value() {
        return this.isRefill() || super.value;
    }

    set item(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        const old = this.item;
        if (value != old) {
            this.#item = value;
            STORAGES.locationItems.set(ref, value);
            // data
            if (value) {
                this.#itemData = ShopItemsResource.get(value);
                this.#refill = this.#itemData?.refill ?? !isSanity();
            } else if (isSanity()) {
                this.#itemData = null;
                this.#refill = false;
            } else {
                this.#itemData = ShopItemsResource.get(this.#shopProps.item);
                this.#refill = true;
            }
            this.refreshAccess();
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
            return this.#shopProps.item;
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
            this.refreshAccess();
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
            return this.#shopProps.price;
        }
        return 0;
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
            if (this.#itemData != null) {
                return {
                    ...this.#itemData,
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
            if (this.#itemData != null) {
                return this.#itemData;
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
        return this.item === "";
    }

    reset() {
        const ref = this.ref;
        STORAGES.locations.delete(ref);
        STORAGES.locationItems.delete(ref);
        STORAGES.shopItemsPrice.delete(ref);
        STORAGES.shopItemsName.delete(ref);
    }

    setAPValue(value, silent = false) {
        if (typeof value != "boolean" || this.isRefill()) {
            value = false;
        }
        if (value && this.isDefault()) {
            this.item = "ap_item";
        }
        super.setAPValue(value, silent);
    }

}

LocationStateManager.register("shopslot", ShopSlotState);
