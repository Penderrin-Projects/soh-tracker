import ItemStates from "/script/state/ItemStates.js";
import DefaultState from "/script/state/items/DefaultState.js";

export default class InfiniteItemState extends DefaultState {

    constructor(ref, props) {
        super(ref, props, 0, 9999);
    }

    get max() {
        return 9999;
    }

    get min() {
        return 0;
    }

}

ItemStates.register("infinite", InfiniteItemState);
