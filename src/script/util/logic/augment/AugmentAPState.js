import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";

export function augment(cache) {
    // augment AP state
    if (Savestate.getMeta("archipelago")) {
        cache.setAugmented("$IS_AP_STATE", 1);
    } else {
        cache.deleteAugmented("$IS_AP_STATE");
    }
}

LogicCaller.registerAugment(augment);
