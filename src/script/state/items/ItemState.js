import ItemStates from "/script/state/ItemStates.js";
import DefaultState from "/script/state/items/DefaultState.js";

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

ItemStates.register("item", ItemState);
