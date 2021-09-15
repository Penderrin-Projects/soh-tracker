// GameTrackerJS
import LocationStateManager from "/GameTrackerJS/statemanager/world/location/LocationStateManager.js";
import DefaultLocationState from "/GameTrackerJS/state/world/location/DefaultLocationState.js";
import ItemStateManager from "/GameTrackerJS/state/item/ItemStateManager.js";
// Track-OOT
import ShopsResource from "/script/resource/ShopsResource.js";
import ShopStates from "../../shop/ShopStateManager.js";
import ShopLocationRegistry from "/script/registry/ShopLocationRegistry.js";

const SHOP_STATE = new WeakMap();
const WALLET = ItemStateManager.get("wallet");
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
        const shopState = ShopLocationRegistry.get(props.shop);
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
    }

    get reachable() {
        const shopState = SHOP_STATE.get(this);
        if (shopState == null || WALLET_CAPACITIES[WALLET.value] < shopState.price) {
            return false;
        }
        return super.reachable;
    }

    onStateLoad(state) {
        // ignore
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
