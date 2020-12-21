import EventBus from "/emcJS/event/EventBus.js";
import Helper from "/emcJS/util/Helper.js";
import StateStorage from "/script/storage/StateStorage.js";
import LocationStates from "/script/state/LocationStates.js";
import DefaultState from "/script/state/world/locations/DefaultState.js";

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
        EventBus.register("state::gossipstone_hint", internalHintChange.bind(this));
        EventBus.register("net::state::gossipstone_hint", internalHintChange.bind(this));
    }

    stateLoaded(event) {
        const ref = this.ref;
        // savesatate
        this.hint = !!event.data.state[ref];
    }

    get value() {
        const hint = HINT.get(this);
        return !!hint.location || !!hint.item;
    }

    set value(value) {
        // nothing
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
            const ref = this.ref;
            HINT.set(this, value);
            StateStorage.write(`location/${ref}`, this.value);
            // external
            const event = new Event("hint");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state::gossipstone_hint", {
                ref: ref,
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
