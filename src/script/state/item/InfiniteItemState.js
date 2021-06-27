// GameTrackerJS
import StateManager from "/GameTrackerJS/state/item/StateManager.js";
import DefaultState from "/GameTrackerJS/state/item/DefaultState.js";

export default class InfiniteItemState extends DefaultState {

    constructor(ref, props) {
        super(ref, props, {max: 9999});
    }

    get max() {
        return 9999;
    }

    get min() {
        return 0;
    }

}

StateManager.register("infinite", InfiniteItemState);
