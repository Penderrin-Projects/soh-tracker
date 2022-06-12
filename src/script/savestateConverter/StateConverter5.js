/**
 * move to serverside earliest past 2021‑11‑01
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";
import "./StateConverter4.js";

SavestateConverter.register(function(state) {
    state = state ?? {};
    const res = {
        data: {},
        extra: state.extra ?? {},
        notes: state.notes ?? "",
        autosave: state.autosave ?? false,
        timestamp: state.timestamp ?? new Date(),
        name: state.name ?? ""
    };
    res.extra.dungeonreward = {};
    res.extra.dungeontype = {};
    for (const i of Object.keys(state.data ?? {})) {
        if (i.startsWith("dungeonRewards.")) {
            const key = i.slice(15);
            res.extra.dungeonreward[key] = state.data[i];
        } else if (i.startsWith("dungeonTypes.")) {
            const key = i.slice(13);
            res.extra.dungeontype[key] = state.data[i];
        } else {
            res.data[i] = state.data[i];
        }
    }
    return res;
});
