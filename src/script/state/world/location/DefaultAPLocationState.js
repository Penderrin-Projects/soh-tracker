import {
    mix
} from "/emcJS/util/Mixin.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import {
    immute
} from "/emcJS/data/Immutable.js";
import ObservableStorageObserver from "/emcJS/util/observer/ObservableStorageObserver.js";
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";
import ItemStateManager from "/GameTrackerJS/statemanager/item/ItemStateManager.js";
import {
    getDefaultAccess
} from "/GameTrackerJS/util/helper/ListAccessHelper.js";
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";
import Logic from "/GameTrackerJS/util/logic/Logic.js";
import DataState from "/GameTrackerJS/state/DataState.js";
import StateVisibilityMixin from "/GameTrackerJS/state/mixins/StateVisibilityMixin.js";
import StateFilterMixin from "/GameTrackerJS/state/mixins/StateFilterMixin.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import LocationStateManager from "/GameTrackerJS/statemanager/world/location/LocationStateManager.js";
import {
    AP_STORAGES
} from "../../../util/archipelago/storage/RegisterAPStorage.js";

const STORAGES = {
    locations: Savestate.getStorage("locations"),
    locationItems: Savestate.getStorage("locationItems")
};

function getLogicAccess(checked, reachable) {
    const res = {
        done: 0,
        unopened: 0,
        reachable: 0,
        total: 1,
        value: AccessStateEnum.OPENED,
        entrances: 0
    };
    if (checked) {
        res.done = 1;
    } else if (reachable) {
        res.unopened = 1;
        res.reachable = 1;
        res.value = AccessStateEnum.AVAILABLE;
    } else {
        res.unopened = 1;
        res.value = AccessStateEnum.UNAVAILABLE;
    }
    return immute(res);
}

const BaseClass = mix(
    DataState
).with(
    StateVisibilityMixin,
    StateFilterMixin
);

export default class DefaultAPLocationState extends BaseClass {

    #value = false;

    #apValue = false;

    #item = "";

    #itemData = null;

    #reachable = false;

    #access = this.defaultAccess;

    #visible = true;

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        const apLocationsObserver = new ObservableStorageObserver(AP_STORAGES.locations, ref);
        this.setAPValue(apLocationsObserver.value, true);
        apLocationsObserver.addEventListener("change", (event) => {
            this.setAPValue(event.value);
        });

        const locationsObserver = new ObservableStorageObserver(STORAGES.locations, ref);
        this.#value = locationsObserver.value;
        locationsObserver.addEventListener("change", (event) => {
            this.value = event.value;
        });

        const locationItemsObserver = new ObservableStorageObserver(STORAGES.locationItems, ref);
        this.#item = locationItemsObserver.value;
        locationItemsObserver.addEventListener("change", (event) => {
            this.item = event.value;
        });

        if (this.item) {
            const itemData = ItemStateManager.get(this.item);
            this.#itemData = itemData?.props;
        }

        /* LOGIC */
        const logicAccess = props.logicAccess ?? "";
        this.#reachable = !!Logic.getValue(logicAccess);
        setTimeout(() => {
            this.#access = getLogicAccess(this.value, this.reachable);
            this.setLogicData("$IS_DONE", this.#access.value === AccessStateEnum.OPENED);
        }, 0);
        Logic.addEventListener("change", () => {
            const reachable = !!Logic.getValue(logicAccess);
            if (reachable != this.#reachable) {
                this.#reachable = reachable;
                this.refreshAccess();
                // external
                const ev = new Event("reachable");
                ev.value = reachable;
                this.dispatchEvent(ev);
            }
        });

        /* EVENT */
        this.addEventListener("visible", () => {
            this.checkVisibility();
        });
        this.addEventListener("filtered", () => {
            this.checkVisibility();
        });
        this.checkVisibility();
    }

    checkVisibility = debounce(() => {
        const value = this.visible && !this.filtered;
        if (this.#visible != value) {
            this.#visible = value;
            // external
            const ev = new Event("visibility");
            ev.value = value;
            this.dispatchEvent(ev);
        }
    });

    refreshAccess() {
        const access = getLogicAccess(this.value, this.reachable);
        if (!isEqual(access, this.#access)) {
            this.#access = access;
            // external
            const ev = new Event("access");
            ev.value = access;
            this.dispatchEvent(ev);
            // logic data
            this.setLogicData("$IS_DONE", access.value === AccessStateEnum.OPENED);
        }
    }

    get reachable() {
        return this.#reachable;
    }

    get defaultAccess() {
        const access = getDefaultAccess();
        access.total = 1;
        return access;
    }

    get access() {
        return this.#access ?? this.defaultAccess;
    }

    set value(value) {
        if (typeof value != "boolean") {
            value = !!value;
        }
        if (value != this.#value) {
            const oldResValue = this.value;
            const ref = this.ref;
            this.#value = value;
            STORAGES.locations.set(ref, value);
            const newResValue = this.value;
            if (newResValue != oldResValue) {
                this.refreshAccess();
                // external
                const event = new Event("value");
                event.value = newResValue;
                this.dispatchEvent(event);
            }
        }
    }

    get value() {
        return this.#value || this.#apValue;
    }

    set item(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        if (value != this.#item) {
            this.#item = value;
            STORAGES.locationItems.set(ref, value);
            // item data
            if (value) {
                const itemData = ItemStateManager.get(value);
                this.#itemData = itemData?.props;
            } else {
                this.#itemData = null;
            }
            // external
            const event = new Event("item");
            event.value = value;
            this.dispatchEvent(event);
        }
    }

    get item() {
        return this.#item;
    }

    get itemData() {
        return this.#itemData;
    }

    isVisible() {
        return this.#visible;
    }

    setAPValue(value, silent = false) {
        if (typeof value != "boolean") {
            value = !!value;
        }
        if (silent) {
            this.#apValue = value;
        } else {
            const old = this.#apValue;
            if (value != old) {
                const oldResValue = this.value;
                this.#apValue = value;
                const newResValue = this.value;
                if (newResValue != oldResValue) {
                    this.refreshAccess();
                    // external
                    const event = new Event("value");
                    event.value = newResValue;
                    this.dispatchEvent(event);
                }
            }
        }
    }

}

LocationStateManager.setDefaultState(DefaultAPLocationState);
