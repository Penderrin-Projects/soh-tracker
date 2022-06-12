/**
 * move to serverside earliest past 2022‑06‑27
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";
import "./StateConverter16.js";

SavestateConverter.register(function(state) {
    state = state ?? {};
    const {dungeontype = {}, dungeonreward = {}, ...data} = state.data ?? {};
    const res = {
        data: {...data, dungeontype: {}, dungeonreward: {}},
        options: state.options ?? {},
        filter: state.filter ?? {},
        notes: state.notes ?? "",
        autosave: state.autosave ?? false,
        timestamp: state.timestamp ?? new Date(),
        name: state.name ?? ""
    };

    for (const [key, value] of Object.entries(dungeontype)) {
        if (key == "area/gerudo_fortress") {
            res.data.dungeontype["area/gerudo"] = value;
        } else {
            res.data.dungeontype[key] = value;
        }
    }

    for (const [key, value] of Object.entries(dungeonreward)) {
        if (key == "area/gerudo_fortress") {
            res.data.dungeonreward["area/gerudo"] = value;
        } else {
            res.data.dungeonreward[key] = value;
        }
    }

    return res;
});
