// GameTrackerJS
import LocationStateManager from "/GameTrackerJS/state/world/location/StateManager.js";
import DefaultLocationState from "/GameTrackerJS/state/world/location/DefaultState.js";
import ItemStateManager from "/GameTrackerJS/state/item/StateManager.js";
// Track-OOT
import ShopsResource from "/script/resource/ShopsResource.js";
import ShopStates from "/script/state/shop/StateManager.js";
import ShopLocationRegistry from "/script/registry/ShopLocationRegistry.js";

// TODO only show item if it is not a refill item

const SHOP_STATE = new WeakMap();
const WALLET = ItemStateManager.get("item.wallet");
const WALLET_CAPACITIES = [99, 200, 500, 999];

{
    const shops = ShopsResource.get();
    for (const name in shops) {
        for (let slot = 0; slot < 8; ++slot) {
            ShopStates.get(`${name}/${slot}`);
        }
    }
}

export default class ShopSlotState extends DefaultLocationState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        const shopState = ShopLocationRegistry.get(ref);
        SHOP_STATE.set(this, shopState);
        /* EVENTS */
        if (shopState != null) {
            shopState.addEventListener("bought", event => {
                this.refreshAccess();
                const ev = new Event("value");
                ev.data = event.data;
                this.dispatchEvent(ev);
            });
            shopState.addEventListener("item", event => {
                const ev = new Event("item");
                ev.data = event.data;
                this.dispatchEvent(ev);
            });
            shopState.addEventListener("price", event => {
                this.refreshAccess();
                const ev = new Event("price");
                ev.data = event.data;
                this.dispatchEvent(ev);
            });
            WALLET.addEventListener("value", event => {
                this.refreshAccess();
            });
        }
        this.refreshAccess();
    }

    getAccessValue(checked, reachable) {
        if (!checked && reachable) {
            const shopState = SHOP_STATE.get(this);
            if (WALLET_CAPACITIES[WALLET.value] < shopState.price) {
                reachable = false;
            }
        }
        return super.getAccessValue(checked, reachable);
    }

    stateLoaded(event) {
        // ignore
    }

    set value(value) {
        const shopState = SHOP_STATE.get(this);
        if (shopState != null) {
            shopState.bought = value;
        }
    }

    get value() {
        const shopState = SHOP_STATE.get(this);
        if (shopState != null) {
            return shopState.bought;
        }
        return false;
    }

    set item(value) {
        const shopState = SHOP_STATE.get(this);
        if (shopState != null) {
            shopState.item = value;
        }
    }

    get item() {
        const shopState = SHOP_STATE.get(this);
        if (shopState != null) {
            return shopState.item;
        }
        return "";
    }

    set price(value) {
        const shopState = SHOP_STATE.get(this);
        if (shopState != null) {
            shopState.price = value;
        }
    }

    get price() {
        const shopState = SHOP_STATE.get(this);
        if (shopState != null) {
            return shopState.price;
        }
        return "";
    }

    get price() {
        const shopState = SHOP_STATE.get(this);
        if (shopState != null) {
            return shopState.price;
        }
        return "";
    }

    get itemData() {
        const shopState = SHOP_STATE.get(this);
        if (shopState != null) {
            return shopState.itemData;
        }
        return null;
    }

    isDefault() {
        const shopState = SHOP_STATE.get(this);
        return shopState.isDefault();
    }

    reset() {
        const shopState = SHOP_STATE.get(this);
        shopState.reset();
    }

}

LocationStateManager.register("shopslot", ShopSlotState);
