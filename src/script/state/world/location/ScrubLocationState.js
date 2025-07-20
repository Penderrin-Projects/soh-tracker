
import ObservableStorageObserver from "/emcJS/util/observer/data/storage/ObservableStorageObserver.js";
import LocationStateManager from "/GameTrackerJS/statemanager/world/location/LocationStateManager.js";
import ItemStateManager from "/GameTrackerJS/statemanager/item/ItemStateManager.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import DefaultAPLocationState from "./DefaultAPLocationState.js";

const STORAGES = {
    scrubPrices: Savestate.getStorage("scrubPrices")
};

const WALLET = ItemStateManager.get("wallet");
const WALLET_CAPACITIES = [99, 200, 500, 999];

export default class ScrubLocationState extends DefaultAPLocationState {

    #price = 0;

    #scrubPricesObserver;

    constructor(ref, props) {
        super(ref, props);
        /* STORAGE */
        this.#scrubPricesObserver = new ObservableStorageObserver(STORAGES.scrubPrices, ref);
        this.#price = this.#scrubPricesObserver.value;
        this.#scrubPricesObserver.onChange((event) => {
            this.price = event.value;
        });
        /* EVENTS */
        WALLET.addEventListener("value", () => {
            this.refreshAccess();
        });
        this.refreshAccess();
    }

    get reachable() {
        if (WALLET_CAPACITIES[WALLET.value] < this.#price) {
            return false;
        }
        return super.reachable;
    }

    set price(value) {
        if (typeof value !== "number" || isNaN(value)) {
            value = null;
        }
        if (value !== this.#price) {
            this.#price = value;
            this.#scrubPricesObserver.value = value;
            this.refreshAccess();
            // external
            const event = new Event("price");
            event.value = value;
            this.dispatchEvent(event);
        }
    }

    get price() {
        return this.#price;
    }

}

LocationStateManager.register("scrub", ScrubLocationState);
