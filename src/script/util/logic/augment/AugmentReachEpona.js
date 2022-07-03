import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
import "./AugmentOptions.js";

export function augment(cache) {
    // augment epona
    if (cache.hasChange("option[skip_epona_race]")) {
        if (cache.get("option[skip_epona_race]")) {
            LogicCaller.addReachable("event.epona");
        } else {
            LogicCaller.deleteReachable("event.epona");
        }
    }
}

LogicCaller.registerAugment(augment);
