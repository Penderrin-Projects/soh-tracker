// GameTrackerJS
import AbstractStateManager from "/GameTrackerJS/statemanager/AbstractStateManager.js";
// Track-OOT
import ShopsResource from "/script/resource/ShopsResource.js";
import ShopItemsResource from "/script/resource/ShopItemsResource.js";
import DefaultShopState from "./DefaultShopState.js";

const resourceData = ShopsResource.get();

class ShopStateManager extends AbstractStateManager {

    constructor() {
        super(DefaultShopState, resourceData);
    }

    createState(StateClass, ref, props) {
        const data = ShopItemsResource.get(props.item);
        return new StateClass(ref, props, data);
    }

}

export default new ShopStateManager();
