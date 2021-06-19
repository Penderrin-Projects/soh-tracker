// GameTrackerJS
import StateManager from "/GameTrackerJS/state/world/location/StateManager.js";
import DefaultState from "/GameTrackerJS/state/world/location/DefaultState.js";
// Track-OOT
import ShopsResource from "/script/resource/ShopsResource.js";
import ShopStates from "/script/state/shop/StateManager.js";
import ShopLocationRegistry from "/script/registry/ShopLocationRegistry.js";

// TODO only show item if it is not a refill item

const SHOP_STATE = new WeakMap();

{
    const shops = ShopsResource.get();
    for (const name in shops) {
        for (let slot = 0; slot < 8; ++slot) {
            ShopStates.get(`${name}/${slot}`);
        }
    }
}

export default class ShopSlotState extends DefaultState {

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
        }
        this.refreshAccess();
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

}

StateManager.register("shopslot", ShopSlotState);
