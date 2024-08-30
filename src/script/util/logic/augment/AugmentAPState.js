import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
import ArchipelagoController from "../../archipelago/ArchipelagoController.js";

export function augment(cache) {
    // augment AP state
    if (ArchipelagoController.isConnected()) {
        cache.setAugmented("$AP_IS_CONNECTED", 1);
    } else {
        cache.deleteAugmented("$AP_IS_CONNECTED");
    }
}

LogicCaller.registerAugment(augment);
