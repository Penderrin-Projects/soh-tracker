import ObservableDefaultValueStorage from "/emcJS/data/storage/observable/ObservableDefaultValueStorage.js";
import ObservableStorage from "/emcJS/data/storage/observable/ObservableStorage.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import TrackerLogicDataCollector from "/GameTrackerJS/util/logic/TrackerLogicDataCollector.js";

const STORAGES = {
    items: Savestate.getStorage("items"),
    startItems: Savestate.getStorage("startItems"),
    locations: Savestate.getStorage("locations")
};

export const AP_STORAGES = {
    items: new ObservableDefaultValueStorage(0),
    locations: new ObservableDefaultValueStorage(false),
    hints: new ObservableStorage()
};

function joinValuesItem(newData) {
    const res = {};
    for (const [key, value] of Object.entries(newData)) {
        const startValue = STORAGES.startItems.get(key);
        const apValue = AP_STORAGES.items.get(key);
        if (startValue != null) {
            res[key] = Math.max(startValue, value) + apValue;
        } else {
            res[key] = value + apValue;
        }
    }
    return res;
}

function joinValuesStartItem(newData) {
    const res = {};
    for (const [key, startValue] of Object.entries(newData)) {
        const value = STORAGES.items.get(key);
        const apValue = AP_STORAGES.items.get(key);
        if (startValue != null) {
            res[key] = Math.max(startValue, value) + apValue;
        } else {
            res[key] = value + apValue;
        }
    }
    return res;
}

function joinValuesAPItem(newData) {
    const res = {};
    for (const [key, apValue] of Object.entries(newData)) {
        const value = STORAGES.items.get(key);
        const startValue = STORAGES.startItems.get(key);
        if (startValue != null) {
            res[key] = Math.max(startValue, value) + apValue;
        } else {
            res[key] = value + apValue;
        }
    }
    return res;
}

function joinValuesLocation(newData) {
    const res = {};
    for (const [key, value] of Object.entries(newData)) {
        const apValue = AP_STORAGES.locations.get(key);
        res[key] = value || apValue;
    }
    return res;
}

function joinValuesAPLocation(newData) {
    const res = {};
    for (const [key, apValue] of Object.entries(newData)) {
        const value = STORAGES.locations.get(key);
        res[key] = value || apValue;
    }
    return res;
}

window.AP_STORAGES = AP_STORAGES;

TrackerLogicDataCollector.registerStorage(STORAGES.items, "item[", "]", joinValuesItem);
TrackerLogicDataCollector.registerStorage(STORAGES.startItems, "item[", "]", joinValuesStartItem);
TrackerLogicDataCollector.registerStorage(AP_STORAGES.items, "item[", "]", joinValuesAPItem);
Savestate.registerStorage("APItems", AP_STORAGES.items);

TrackerLogicDataCollector.registerStorage(STORAGES.locations, "location[", "]", joinValuesLocation);
TrackerLogicDataCollector.registerStorage(AP_STORAGES.locations, "location[", "]", joinValuesAPLocation);
Savestate.registerStorage("APLocations", AP_STORAGES.locations);

Savestate.registerStorage("APHints", AP_STORAGES.hints);
