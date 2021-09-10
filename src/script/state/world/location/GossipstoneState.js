// frameworks
import EventBus from "/emcJS/event/EventBus.js";

// GameTrackerJS
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import LocationStateManager from "/GameTrackerJS/state/world/location/StateManager.js";
import DefaultLocationState from "/GameTrackerJS/state/world/location/DefaultState.js";

const gossipstoneLocationsSavestateStorage = Savestate.getStorage("gossipstoneLocations");
const gossipstoneItemsSavestateStorage = Savestate.getStorage("gossipstoneItems");

const LOCATION = new WeakMap();
const ITEM = new WeakMap();

function internalItemChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setItem(change.value);
    }
}

function internalLocationChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setLocation(change.value);
    }
}

export default class GossipstoneState extends DefaultLocationState {

    constructor(ref, props) {
        super(ref, props);
        /* VALUES */
        ITEM.set(this, gossipstoneItemsSavestateStorage.get(ref, ""));
        gossipstoneItemsSavestateStorage.addEventListener("change", (event) => {
            if (event.changes[ref] != null) {
                const value = event.changes[ref].newValue;
                this./*#*/__setItem(value);
            }
        });
        gossipstoneItemsSavestateStorage.addEventListener("load", (event) => {
            this./*#*/__setItem(event.data[ref] ?? "");
        });
        LOCATION.set(this, gossipstoneLocationsSavestateStorage.get(ref, ""));
        gossipstoneLocationsSavestateStorage.addEventListener("change", (event) => {
            if (event.changes[ref] != null) {
                const value = event.changes[ref].newValue;
                this./*#*/__setLocation(value);
            }
        });
        gossipstoneLocationsSavestateStorage.addEventListener("load", (event) => {
            this./*#*/__setLocation(event.data[ref] ?? "");
        });
        /* EVENTS */
        EventBus.register("state::gossipstone::item", internalItemChange.bind(this));
        EventBus.register("state::gossipstone::location", internalLocationChange.bind(this));
    }

    /*#*/__setItem(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        const oldValue = this.item;
        if (value != oldValue) {
            ITEM.set(this, value);
            gossipstoneItemsSavestateStorage.set(ref, value);
            // external
            const event = new Event("item");
            event.data = value;
            this.dispatchEvent(event);
        }
        return value;
    }

    set item(value) {
        const ref = this.ref;
        const oldValue = this.item;
        const newValue = this./*#*/__setItem(value);
        if (value != null && newValue != oldValue) {
            // internal
            EventBus.trigger("state::gossipstone::item", {ref, value});
        }
    }

    get item() {
        return ITEM.get(this);
    }

    /*#*/__setLocation(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        const oldValue = this.location;
        if (value != oldValue) {
            LOCATION.set(this, value);
            gossipstoneLocationsSavestateStorage.set(ref, value);
            // external
            const event = new Event("location");
            event.data = value;
            this.dispatchEvent(event);
        }
        return value;
    }

    set location(value) {
        const ref = this.ref;
        const oldValue = this.location;
        const newValue = this./*#*/__setLocation(value);
        if (value != null && newValue != oldValue) {
            // internal
            EventBus.trigger("state::gossipstone::location", {ref, value});
        }
    }

    get location() {
        return LOCATION.get(this);
    }

}

LocationStateManager.register("gossipstone", GossipstoneState);
