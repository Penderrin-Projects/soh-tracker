import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateManager from "/GameTrackerJS/state/world/location/StateManager.js";
import DefaultState from "/GameTrackerJS/state/world/location/DefaultState.js";


const VALUE = new WeakMap();
const ITEM = new WeakMap();

function internalChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.value = change.newValue;
    }
}

function internalItemChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.item = change.newValue;
    }
}

export default class LocationState extends DefaultState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        this.value = StateStorage.read(ref, false);
        this.item = StateStorage.readExtra("item_location", ref, "");
        /* EVENTS */
        EventBus.register("state::location", internalChange.bind(this));
        EventBus.register("net::state::location", internalChange.bind(this));
        EventBus.register("state::location_item", internalItemChange.bind(this));
        EventBus.register("net::state::location_item", internalItemChange.bind(this));
    }

    stateLoaded(event) {
        const ref = this.ref;
        // savesatate
        this.value = !!event.data.state[ref];
        // item
        if (event.data.extra["item_location"] != null && event.data.extra["item_location"][ref] != null) {
            this.item = event.data.extra["item_location"][ref];
        } else {
            this.item = "";
        }
    }

    set value(value) {
        if (typeof value != "boolean") {
            value = !!value;
        }
        const old = this.value;
        if (value != old) {
            const ref = this.ref;
            VALUE.set(this, value);
            StateStorage.write(ref, this.value);
            // external
            const event = new Event("value");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state::location", {
                ref: ref,
                oldValue: old,
                newValue: this.value
            });
        }
    }

    get value() {
        return VALUE.get(this);
    }

    set item(value) {
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
            // internal
            EventBus.trigger("state::location_item", {
                ref: ref,
                oldValue: old,
                newValue: this.item
            });
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
