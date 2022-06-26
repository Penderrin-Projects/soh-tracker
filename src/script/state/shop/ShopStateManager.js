// GameTrackerJS
import SimpleStateManager from "/GameTrackerJS/statemanager/SimpleStateManager.js";
// Track-OOT
import ShopsResource from "/script/resource/ShopsResource.js";
import DefaultShopState from "./DefaultShopState.js";

const resourceData = ShopsResource.get();

const ShopStateManager = new SimpleStateManager(DefaultShopState, resourceData);

export default ShopStateManager;
