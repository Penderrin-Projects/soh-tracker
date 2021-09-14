// GameTrackerJS
import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";

export function prerun(cache, data) {
    // augment epona
    if (data["option.skip_epona_race"] != null) {
        if (data["option.skip_epona_race"]) {
            LogicCaller.addReachable("event.epona");
        } else {
            LogicCaller.deleteReachable("event.epona");
        }
    }
}

LogicCaller.registerPrerun(augment);
