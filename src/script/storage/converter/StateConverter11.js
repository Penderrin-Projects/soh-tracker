/**
 * move to serverside earliest past 2022‑06‑27
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";
import "./StateConverter10.js";

SavestateConverter.register(function(state) {
    state = state ?? {};
    const res = {
        data: state.data ?? {},
        extra: {},
        notes: state.notes ?? "",
        autosave: state.autosave ?? false,
        timestamp: state.timestamp ?? new Date(),
        name: state.name ?? ""
    };
    // change dungeonreward
    const dungeonreward = {};
    for (const i of Object.keys(state.extra?.dungeonreward ?? {})) {
        dungeonreward[translation[i] ?? i] = translation[state.extra.dungeonreward[i]] ?? state.extra.dungeonreward[i];
    }
    // change dungeontype
    const dungeontype = {};
    for (const i of Object.keys(state.extra?.dungeontype ?? {})) {
        dungeontype[translation[i] ?? i] = translation[state.extra.dungeontype[i]] ?? state.extra.dungeontype[i];
    }
    // collect data
    res.extra = {...state.extra, dungeonreward, dungeontype};
    return res;
});

const translation = {
    "pocket": "area/pocket"
};
