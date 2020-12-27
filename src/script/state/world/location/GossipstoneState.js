import EventBus from "/emcJS/event/EventBus.js";
import Helper from "/emcJS/util/Helper.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateManager from "/GameTrackerJS/state/world/location/StateManager.js";
import DefaultState from "/GameTrackerJS/state/world/location/DefaultState.js";

const HINT = new WeakMap();

function internalHintChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.hint = change.newValue;
    }
}

export default class GossipstoneState extends DefaultState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        this.hint = StateStorage.read(ref, false);
        /* EVENTS */
        EventBus.register("state::gossipstone", internalHintChange.bind(this));
        EventBus.register("net::state::gossipstone", internalHintChange.bind(this));
    }

    stateLoaded(event) {
        const ref = this.ref;
        // savesatate
        this.hint = !!event.data.state[ref];
    }

    set value(value) {
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
            const ref = this.ref;
            HINT.set(this, value);
            StateStorage.write(ref, this.value);
            // external
            const event = new Event("value");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state::gossipstone", {
                ref: ref,
                oldValue: old,
                newValue: this.hint
            });
        }
    }

    get value() {
        return HINT.get(this);
    }

}

StateManager.register("gossipstone", GossipstoneState);
