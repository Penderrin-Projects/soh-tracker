// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";
import Helper from "/emcJS/util/helper/Helper.js";

import Savestate from "../../../savestate/Savestate.js";
import Logic from "../../../util/logic/Logic.js";
import VisibilityState from "../VisibilityState.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";
import ItemStateManager from "../../item/ItemStateManager.js";

const STORAGES = {
    locations: Savestate.getStorage("locations"),
    locationItems: Savestate.getStorage("locationItems"),
};

const ACCESS = new WeakMap();
const REACHABLE = new WeakMap();
const VALUE = new WeakMap();
const ITEM = new WeakMap();
const ITEM_DATA = new WeakMap();

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
    return res;
}

export default class DefaultLocationState extends VisibilityState {

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        const locationsObserver = new DataStorageValueObserver(STORAGES.locations, ref, false);
        VALUE.set(this, locationsObserver.value);
        locationsObserver.addEventListener("change", (event) => {
            this.value = event.data;
        });
        
        const locationItemsObserver = new DataStorageValueObserver(STORAGES.locationItems, ref, "");
        ITEM.set(this, locationItemsObserver.value);
        locationItemsObserver.addEventListener("change", (event) => {
            this.item = event.data;
        });

        if (this.item) {
            const itemData = ItemStateManager.get(this.item);
            ITEM_DATA.set(this, itemData?.props);
        }
        
        REACHABLE.set(this, Logic.getValue(props.logicAccess));
        ACCESS.set(this, getLogicAccess(this.value, this.reachable));

        /* LOGIC */
        Logic.addEventListener("change", () => {
            const reachable = Logic.getValue(props.logicAccess);
            if (reachable != null) {
                const old = REACHABLE.get(this);
                if (reachable != old) {
                    REACHABLE.set(this, reachable);
                    this.refreshAccess();
                }
            }
        });
    }

    refreshAccess() {
        const access = getLogicAccess(this.value, this.reachable);
        const old = ACCESS.get(this);
        if (!Helper.isEqual(access, old)) {
            ACCESS.set(this, access);
            // external
            const ev = new Event("access");
            ev.data = access;
            this.dispatchEvent(ev);
        }
    }

    get reachable() {
        return REACHABLE.get(this);
    }

    get defaultAccess() {
        return {
            done: 0,
            unopened: 0,
            reachable: 0,
            total: 1,
            value: AccessStateEnum.OPENED,
            entrances: 0
        };
    }

    get access() {
        return ACCESS.get(this) ?? this.defaultAccess;
    }

    /*#*/__setValue(value) {
        return value;
    }

    set value(value) {
        if (typeof value != "boolean") {
            value = !!value;
        }
        const old = VALUE.get(this);
        if (value != old) {
            const ref = this.ref;
            VALUE.set(this, value);
            STORAGES.locations.set(ref, value);
            this.refreshAccess();
            // external
            const event = new Event("value");
            event.data = value;
            this.dispatchEvent(event);
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
            STORAGES.locationItems.set(ref, value);
            // item data
            if (value) {
                const itemData = ItemStateManager.get(value);
                ITEM_DATA.set(this, itemData?.props);
            } else {
                ITEM_DATA.delete(this);
            }
            // external
            const event = new Event("item");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get item() {
        return ITEM.get(this);
    }

    get itemData() {
        if (ITEM_DATA.has(this)) {
            return ITEM_DATA.get(this);
        }
    }

}
