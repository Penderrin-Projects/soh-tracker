import EventBus from "/emcJS/util/events/EventBus.js";
import AnyState from "/emcJS/data/state/AnyState.js";
import StateStorage from "/script/storage/StateStorage.js";
import WorldStates from "../LocationStates.js";
import FilterMixin from "../mixins/FilterMixin.js";

const ITEM = new WeakMap();

function stateLoaded(event) {
    const ref = this.ref;
    // savesatate
    let value = !!event.data.state[ref];
    if (typeof value == "undefined") {
        value = false;
    }
    this.value = value;
    // item
    if (event.data.extra["item_location"] != null && event.data.extra["item_location"][ref] != null) {
        this.item = event.data.extra["item_location"][ref];
    } else {
        this.item = "";
    }
}

function stateChanged(event) {
    const ref = this.ref;
    // savesatate
    if (event.data[ref] != null) {
        const value = !!event.data[ref].newValue;
        this.value = value;
    }
}

function locationItemUpdate(event) {
    const ref = this.ref;
    // savesatate
    if (event.data[ref] != null) {
        this.item = event.data[ref].newValue;
    }
}

export default class GossipstoneState extends FilterMixin(AnyState) {

    constructor(ref, props) {
        super(ref, props);
        /* EVENTS */
        EventBus.register("state", stateLoaded.bind(this));
        EventBus.register("statechange", stateChanged.bind(this));
        EventBus.register("statechange_item_location", locationItemUpdate.bind(this));
    }

    set item(value) {
        if (typeof value != "string") value = "";
        if (value != this.item) {
            ITEM.set(this, value);
            const event = new Event("item");
            event.data = value;
            this.dispatchEvent(event);
            StateStorage.writeExtra("item_location", this.ref, value);
        }
    }

    get item() {
        return ITEM.get(this);
    }

}

WorldStates.register("gossipstone", GossipstoneState);
