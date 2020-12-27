import StateManager from "/GameTrackerJS/state/item/StateManager.js";
import DefaultState from "/GameTrackerJS/state/item/DefaultState.js";

export default class ItemState extends DefaultState {

    constructor(ref, props) {
        super(ref, props, 0, props.max);
    }

    get max() {
        return super.max;
    }

    get min() {
        return super.min;
    }

}

StateManager.register("item", ItemState);
