import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
import MetaObserver from "/GameTrackerJS/util/observer/MetaObserver.js";

const archipelagoActiveObserver = new MetaObserver("archipelago");

export function augment(cache) {
    // augment AP state
    if (archipelagoActiveObserver.value) {
        cache.setAugmented("$IS_AP_STATE", 1);
    } else {
        cache.deleteAugmented("$IS_AP_STATE");
    }
}

LogicCaller.registerAugment(augment);
