import EventBus from "/emcJS/event/EventBus.js";
import Helper from "/emcJS/util/Helper.js";
import StateStorage from "/script/storage/StateStorage.js";
import LocationStates from "/script/state/LocationStates.js";
import DefaultState from "/script/state/world/locations/DefaultState.js";

const HINT = new WeakMap();

function internalChange(event) {
    const ref = this.ref;
    // savesatate
    if (event.data[ref] != null) {
        this.hint = event.data[ref].newValue;
    }
}

export default class GossipstoneState extends DefaultState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        this.hint = StateStorage.readExtra("gossipstone", ref, false);
        /* EVENTS */
        EventBus.register("state_location_hint", internalChange.bind(this));
        EventBus.register("net:state_location_hint", internalChange.bind(this));
    }

    stateLoaded(event) {
        const ref = this.ref;
        // savesatate
        super.stateLoaded(event);
        // hint
        if (event.data.extra["gossipstone"] != null && event.data.extra["gossipstone"][ref] != null) {
            this.hint = event.data.extra["gossipstone"][ref];
        } else {
            this.hint = "";
        }
    }

    get value() {
        const hint = HINT.get(this);
        return !!hint.location || !!hint.item;
    }

    set hint(value) {
        if (typeof value != "object" || Array.isArray(value)) {
            value = {
                location: "",
                item: ""
            };
        }
        if (typeof value.location != "string") {
            value.location = "";
        }
        if (typeof value.item != "string") {
            value.item = "";
        }
        const old = this.hint;
        if (!Helper.isEqual(old, value)) {
            HINT.set(this, value);
            StateStorage.writeExtra("gossipstone", this.ref, value);
            // external
            const event = new Event("hint");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state_location_hint", {
                oldValue: old,
                newValue: this.hint
            });
        }
    }

    get hint() {
        return HINT.get(this);
    }

}

LocationStates.register("gossipstone", GossipstoneState);
