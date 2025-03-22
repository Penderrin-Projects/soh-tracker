import AreaStateManager from "/GameTrackerJS/statemanager/world/area/AreaStateManager.js";
import ShopSlotState from "../location/ShopSlotState.js";
import AreaState from "./AreaState.js";

export default class ShopState extends AreaState  {

    setAllEntries(value = true) {
        const list = this.getList();
        for (const state of list) {
            if (state != null && state.entry != null) {
                const entry = state.entry;
                if (entry instanceof ShopSlotState) {
                    if (value && entry.item === "") {
                        entry.item = "refill_item";
                        entry.price = "0";
                    } else if (!value && entry.item === "refill_item") {
                        entry.item = "";
                        entry.price = "";
                    }
                } else {
                    super.setAllEntries(value);
                }
            }
        }
    }

}

AreaStateManager.register("shop", ShopState);
