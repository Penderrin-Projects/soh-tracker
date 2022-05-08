// GameTrackerJS
import AbstractStateManager from "/GameTrackerJS/statemanager/AbstractStateManager.js";
// Track-OOT
import ShopsResource from "/script/resource/ShopsResource.js";
import DefaultShopState from "./DefaultShopState.js";

const resourceData = ShopsResource.get();

class ShopStateManager extends AbstractStateManager {

    constructor() {
        super(DefaultShopState, resourceData);
    }

}

export default new ShopStateManager();
