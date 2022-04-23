// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

// GameTrackerJS
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import LocationStateManager from "/GameTrackerJS/statemanager/world/location/LocationStateManager.js";
import DefaultLocationState from "/GameTrackerJS/state/world/location/DefaultLocationState.js";

const STORAGES = {
    gossipstoneItems: Savestate.getStorage("gossipstoneItems"),
    gossipstoneLocations: Savestate.getStorage("gossipstoneLocations")
};

const LOCATION = new WeakMap();
const ITEM = new WeakMap();

export default class GossipstoneState extends DefaultLocationState {

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        const gossipstoneItemsObserver = new DataStorageValueObserver(STORAGES.gossipstoneItems, ref, "");
        ITEM.set(this, gossipstoneItemsObserver.value);
        gossipstoneItemsObserver.addEventListener("change", (event) => {
            this.item = event.data;
        });

        const gossipstoneLocationsObserver = new DataStorageValueObserver(STORAGES.gossipstoneLocations, ref, "");
        LOCATION.set(this, gossipstoneLocationsObserver.value);
        gossipstoneLocationsObserver.addEventListener("change", (event) => {
            this.location = event.data;
        });
    }

    set item(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        const oldValue = this.item;
        if (value != oldValue) {
            ITEM.set(this, value);
            STORAGES.gossipstoneItems.set(ref, value);
            // external
            const event = new Event("item");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get item() {
        return ITEM.get(this);
    }

    set location(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        const oldValue = this.location;
        if (value != oldValue) {
            LOCATION.set(this, value);
            STORAGES.gossipstoneLocations.set(ref, value);
            // external
            const event = new Event("location");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get location() {
        return LOCATION.get(this);
    }

}

LocationStateManager.register("gossipstone", GossipstoneState);
