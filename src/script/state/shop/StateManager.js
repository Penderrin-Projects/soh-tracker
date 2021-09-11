// GameTrackerJS
import AbstractStateManager from "/GameTrackerJS/state/StateManager.js";
// Track-OOT
import ShopsResource from "/script/resource/ShopsResource.js";
import ShopItemsResource from "/script/resource/ShopItemsResource.js";
import DefaultState from "./DefaultState.js";

const resourceData = ShopsResource.get();

class ShopStateManager extends AbstractStateManager {

    constructor() {
        super(DefaultState, resourceData);
    }

    createState(StateClass, ref, props) {
        const data = ShopItemsResource.get(props.item);
        return new StateClass(ref, props, data);
    }

}

export default new ShopStateManager();
