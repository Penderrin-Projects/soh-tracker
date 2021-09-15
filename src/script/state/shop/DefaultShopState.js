// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

// GameTrackerJS
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import OptionsStorage from "/GameTrackerJS/savestate/storage/OptionsStorage.js";
import DataState from "/GameTrackerJS/state/DataState.js";
// Track-OOT
import ShopItemsResource from "/script/resource/ShopItemsResource.js";
import ShopLocationRegistry from "/script/registry/ShopLocationRegistry.js";

const STORAGES = {
    shopItems: Savestate.getStorage("shopItems"),
    shopItemsPrice: Savestate.getStorage("shopItemsPrice"),
    shopItemsBought: Savestate.getStorage("shopItemsBought"),
    shopItemsName: Savestate.getStorage("shopItemsName"),
};

const DEF_ITEM_DATA = new WeakMap();
const ITEM_DATA = new WeakMap();
const ITEM = new WeakMap();
const PRICE = new WeakMap();
const BOUGHT = new WeakMap();
const NAME = new WeakMap();

export default class DefaultShopState extends DataState {

    constructor(ref, props, defItemData) {
        super(ref, props);

        /* DEFAULT */
        DEF_ITEM_DATA.set(this, defItemData);

        /* VALUES */
        const shopItemsObserver = new DataStorageValueObserver(STORAGES.shopItems, ref, "");
        ITEM.set(this, shopItemsObserver.value);
        shopItemsObserver.addEventListener("change", (event) => {
            this.item = event.data;
        });

        const shopItemsPriceObserver = new DataStorageValueObserver(STORAGES.shopItemsPrice, ref, 0);
        PRICE.set(this, shopItemsPriceObserver.value);
        shopItemsPriceObserver.addEventListener("change", (event) => {
            this.price = event.data;
        });

        const shopItemsBoughtObserver = new DataStorageValueObserver(STORAGES.shopItemsBought, ref, false);
        BOUGHT.set(this, shopItemsBoughtObserver.value);
        shopItemsBoughtObserver.addEventListener("change", (event) => {
            this.bought = event.data;
        });

        const shopItemsNameObserver = new DataStorageValueObserver(STORAGES.shopItemsName, ref, false);
        NAME.set(this, shopItemsNameObserver.value);
        shopItemsNameObserver.addEventListener("change", (event) => {
            this.name = event.data;
        });

        const itemData = ShopItemsResource.get(this.item);
        if (itemData != null) {
            ITEM_DATA.set(this, itemData);
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
            ITEM.set(this, value);
            STORAGES.shopItems.set(ref, value);
            // data
            const itemData = ShopItemsResource.get(value);
            if (itemData != null) {
                ITEM_DATA.set(this, itemData);
            } else {
                ITEM_DATA.delete(this);
            }
            // bought
            if (itemData != null && itemData.refill) {
                STORAGES.shopItemsBought.set(ref, true);
            } else {
                STORAGES.shopItemsBought.set(ref, false);
            }
            // external
            const event = new Event("item");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get item() {
        return ITEM.get(this);
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
            PRICE.set(this, value);
            STORAGES.shopItemsPrice.set(ref, value);
            // external
            const event = new Event("price");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get price() {
        return PRICE.get(this);
    }
    
    set bought(value) {
        const ref = this.ref;
        const itemData = ITEM_DATA.get(this);
        if (typeof value != "boolean" || itemData == null || itemData.refill) {
            value = false;
        }
        const old = this.bought;
        if (value != old) {
            BOUGHT.set(this, value);
            STORAGES.shopItemsBought.set(ref, value);
            // external
            const event = new Event("bought");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get bought() {
        return BOUGHT.get(this);
    }

    set name(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        const old = this.name;
        if (value != old) {
            NAME.set(this, value);
            STORAGES.shopItemsName.set(ref, value);
            // external
            const event = new Event("name");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get name() {
        return NAME.get(this);
    }

    get itemData() {
        if (ITEM_DATA.has(this)) {
            return ITEM_DATA.get(this);
        }
        if (OptionsStorage.get("option.shopsanity") != "off") {
            return {
                "image": "/images/unknown.svg",
                "category": "hidden_items",
                "refill": true,
                "mark": false,
                "price": "?"
            };
        }
        return DEF_ITEM_DATA.get(this);
    }

    isDefault() {
        return !ITEM_DATA.has(this);
    }

    reset() {
        const ref = this.ref;
        STORAGES.shopItems.delete(ref);
        STORAGES.shopItemsPrice.delete(ref);
        STORAGES.shopItemsBought.delete(ref);
        STORAGES.shopItemsName.delete(ref);
        ITEM_DATA.delete(this);
    }

}
