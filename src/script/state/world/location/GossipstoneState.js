// frameworks
import EventBus from "/emcJS/event/EventBus.js";
import Helper from "/emcJS/util/Helper.js";

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import LocationStateManager from "/GameTrackerJS/state/world/location/StateManager.js";
import DefaultLocationState from "/GameTrackerJS/state/world/location/DefaultState.js";

const HINT = new WeakMap();

function internalHintChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setHint(change.value);
    }
}

export default class GossipstoneState extends DefaultLocationState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        this.hint = SavestateHandler.get("gossipstone", ref, {location: "", item: ""});
        /* EVENTS */
        EventBus.register("state::gossipstone", internalHintChange.bind(this));
    }

    stateLoaded(event) {
        super.stateLoaded(event);
        const ref = this.ref;
        // hint
        if (event.data.extra["gossipstone"] != null && event.data.extra["gossipstone"][ref] != null) {
            this.hint = event.data.extra["gossipstone"][ref];
        } else {
            this.hint = "";
        }
    }

    /*#*/__setHint(value) {
        const ref = this.ref;
        if (typeof value != "object" || Array.isArray(value)) {
            value = {location: "", item: ""}
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
            SavestateHandler.set("gossipstone", ref, value);
            // external
            const event = new Event("hint");
            event.data = value;
            this.dispatchEvent(event);
        }
        return value;
    }

    set hint(value) {
        const ref = this.ref;
        const old = this.reward;
        value = this./*#*/__setHint(value);
        if (value != null && !Helper.isEqual(old, value)) {
            // internal
            EventBus.trigger("state::gossipstone", {ref, value});
        }
    }

    get hint() {
        return HINT.get(this);
    }

}

LocationStateManager.register("gossipstone", GossipstoneState);
