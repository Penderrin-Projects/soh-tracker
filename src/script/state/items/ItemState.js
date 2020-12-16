import EventBus from "/emcJS/util/events/EventBus.js";
import ItemStates from "/script/state/ItemStates.js";
import DefaultState from "/script/state/items/DefaultState.js";

function stateLoaded(event) {
    const ref = this.ref;
    // savesatate
    this.value = parseInt(event.data.state[ref]) || 0;
}

function stateChanged(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data[ref];
    if (change != null) {
        this.value = parseInt(change.newValue) || 0;
    }
}

export default class ItemState extends DefaultState {

    constructor(ref, props) {
        super(ref, props, 0, props.max);
        /* EVENTS */
        EventBus.register("state", stateLoaded.bind(this));
        EventBus.register("statechange", stateChanged.bind(this));
    }

    set max(value) {
        // no action
    }

    get max() {
        return super.max;
    }

    set min(value) {
        // no action
    }

    get min() {
        return super.min;
    }

}

ItemStates.register("item", ItemState);
