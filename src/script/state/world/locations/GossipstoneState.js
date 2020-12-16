import EventBus from "/emcJS/util/events/EventBus.js";
import AnyState from "/emcJS/data/state/AnyState.js";
import StateStorage from "/script/storage/StateStorage.js";
import FilterMixin from "/script/state/mixins/FilterMixin.js";
import LocationStates from "/script/state/LocationStates.js";
import WorldRegistry from "/script/state/WorldRegistry.js";

function stateLoaded(event) {
    const ref = this.ref;
    // savesatate
    let value = !!event.data.state[ref];
    if (typeof value == "undefined") {
        value = false;
    }
    this.value = value;
    // hint
    if (event.data.extra["gossipstone"] != null && event.data.extra["gossipstone"][ref] != null) {
        this.hint = event.data.extra["gossipstone"][ref];
    } else {
        this.hint = "";
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

function gossipstoneUpdate(event) {
    const ref = this.ref;
    // savesatate
    if (event.data[ref] != null) {
        this.hint = event.data[ref].newValue;
    }
}

export default class GossipstoneState extends FilterMixin(AnyState) {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        this.value = StateStorage.readExtra("gossipstone", ref, false);
        /* EVENTS */
        EventBus.register("state", stateLoaded.bind(this));
        EventBus.register("statechange", stateChanged.bind(this));
        EventBus.register("statechange_gossipstone", gossipstoneUpdate.bind(this));
        /* register */
        WorldRegistry.set(`location/${ref}`, this);
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
        const old = this.value;
        super.value = value;
        if (value.location != old.value || value.item != old.item) {
            StateStorage.writeExtra("gossipstone", this.ref, value);
        }
    }

    get value() {
        return super.value;
    }

}

LocationStates.register("gossipstone", GossipstoneState);
