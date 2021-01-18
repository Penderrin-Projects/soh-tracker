import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateManager from "/GameTrackerJS/state/world/location/StateManager.js";
import DefaultState from "/GameTrackerJS/state/world/location/DefaultState.js";

const ITEM = new WeakMap();

function internalItemChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setItem(change.value);
    }
}

export default class LocationState extends DefaultState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        this.value = StateStorage.read(ref, false);
        this.item = StateStorage.readExtra("item_location", ref, "");
        /* EVENTS */
        EventBus.register("state::location_item", internalItemChange.bind(this));
    }

    stateLoaded(event) {
        super.stateLoaded(event);
        const ref = this.ref;
        // item
        if (event.data.extra["item_location"] != null && event.data.extra["item_location"][ref] != null) {
            this.item = event.data.extra["item_location"][ref];
        } else {
            this.item = "";
        }
    }

    /*#*/__setItem(value) {
        const ref = this.ref;
        if (typeof value != "string") value = "";
        const old = this.item;
        if (value != old) {
            ITEM.set(this, value);
            StateStorage.writeExtra("item_location", ref, value);
            // external
            const event = new Event("item");
            event.data = value;
            this.dispatchEvent(event);
        }
        return value;
    }

    set item(value) {
        const ref = this.ref;
        const old = this.reward;
        value = this./*#*/__setItem(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::location_item", {ref, value});
        }
    }

    get item() {
        return ITEM.get(this);
    }

}

StateManager.register("chest", LocationState);
StateManager.register("skulltula", LocationState);
StateManager.register("scrub", LocationState);
StateManager.register("bean", LocationState);
StateManager.register("cow", LocationState);
