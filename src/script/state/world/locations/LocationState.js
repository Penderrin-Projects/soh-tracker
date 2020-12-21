import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import LocationStates from "/script/state/LocationStates.js";
import DefaultState from "/script/state/world/locations/DefaultState.js";

const VALUE = new WeakMap();
const ITEM = new WeakMap();

function internalChange(event) {
    const ref = this.ref;
    // savesatate
    if (event.data[ref] != null) {
        this.item = event.data[ref].newValue;
    }
}

export default class LocationState extends DefaultState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        this.value = StateStorage.read(ref, false);
        this.item = StateStorage.readExtra("item_location", `location/${ref}`, "");
        /* EVENTS */
        EventBus.register("state_location_item", internalChange.bind(this));
        EventBus.register("net:state_location_item", internalChange.bind(this));
    }

    stateLoaded(event) {
        const ref = this.ref;
        // savesatate
        this.value = !!event.data.state[ref];
        // item
        if (event.data.extra["item_location"] != null && event.data.extra["item_location"][`location/${ref}`] != null) {
            this.item = event.data.extra["item_location"][`location/${ref}`];
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
            VALUE.set(this, value);
            StateStorage.write(this.ref, this.value);
            // external
            const event = new Event("value");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state_location", {
                ref: this.ref,
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
            StateStorage.writeExtra("item_location", `location/${ref}`, value);
            // external
            const event = new Event("item");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state_location_item", {
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

LocationStates.register("chest", LocationState);
LocationStates.register("skulltula", LocationState);
LocationStates.register("scrub", LocationState);
LocationStates.register("bean", LocationState);
