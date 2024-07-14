// GameTrackerJS
import LocationStateManager from "/GameTrackerJS/statemanager/world/location/LocationStateManager.js";
import ItemStateManager from "/GameTrackerJS/statemanager/item/ItemStateManager.js";
// Track-OOT
import ShopsResource from "/script/resource/ShopsResource.js";
import ShopStates from "../../shop/ShopStateManager.js";
import ShopLocationRegistry from "/script/registry/ShopLocationRegistry.js";
import DefaultAPLocationState from "./DefaultAPLocationState.js";

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

export default class ShopSlotState extends DefaultAPLocationState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        const shopState = this.shopState;
        if (shopState != null) {
            shopState.addEventListener("bought", (event) => {
                this.refreshAccess();
                const ev = new Event("value");
                ev.value = event.value;
                this.dispatchEvent(ev);
            });
            shopState.addEventListener("item", (event) => {
                this.refreshAccess();
                const ev = new Event("item");
                ev.value = event.value;
                this.dispatchEvent(ev);
            });
            shopState.addEventListener("price", (event) => {
                this.refreshAccess();
                const ev = new Event("price");
                ev.value = event.value;
                this.dispatchEvent(ev);
            });
            WALLET.addEventListener("value", () => {
                this.refreshAccess();
            });
            this.refreshAccess();
        }
    }

    get shopState() {
        let shopState = SHOP_STATE.get(this);
        if (shopState == null) {
            shopState = ShopLocationRegistry.get(this.ref);
            SHOP_STATE.set(this, shopState);
        }
        return shopState;
    }

    get reachable() {
        const shopState = this.shopState;
        if (shopState == null || WALLET_CAPACITIES[WALLET.value] < shopState.price) {
            return false;
        }
        return super.reachable;
    }

    onStateLoad(/* state */) {
        // ignore
    }

    stateLoaded(/* event */) {
        // ignore
    }

    set value(value) {
        const shopState = this.shopState;
        if (shopState != null) {
            shopState.bought = value;
        }
    }

    get value() {
        const shopState = this.shopState;
        if (shopState != null) {
            return shopState.isRefill() || shopState.bought;
        }
        return false;
    }

    set item(value) {
        const shopState = this.shopState;
        if (shopState != null) {
            shopState.item = value;
        }
    }

    get item() {
        const shopState = this.shopState;
        if (shopState != null) {
            return shopState.item;
        }
        return "";
    }

    set price(value) {
        const shopState = this.shopState;
        if (shopState != null) {
            shopState.price = value;
        }
    }

    get price() {
        const shopState = this.shopState;
        if (shopState != null) {
            return shopState.price;
        }
        return "";
    }

    get itemData() {
        const shopState = this.shopState;
        if (shopState != null) {
            return shopState.itemData;
        }
        return null;
    }

    isDefault() {
        const shopState = this.shopState;
        if (shopState != null) {
            return shopState.isDefault();
        }
    }

    reset() {
        const shopState = this.shopState;
        if (shopState != null) {
            shopState.reset();
        }
    }

    setAPValue(value) {
        const shopState = this.shopState;
        if (shopState != null) {
            shopState.setAPBought(value);
        }
    }

}

LocationStateManager.register("shopslot", ShopSlotState);
