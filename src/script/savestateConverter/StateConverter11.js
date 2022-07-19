/**
 * move to serverside earliest past 2022‑06‑27
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";

const URL = import.meta.url;
const VER_REGEX = /([0-9]+)\.js$/;

// LOAD PREVIOUS CONVERTER
const FORMER_CONVERTER_URL = URL.replace(VER_REGEX, (_, ver) => `${parseInt(ver) - 1}.js`);
await import(FORMER_CONVERTER_URL);

// REGISTER CONVERTER
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

const translation = {"pocket": "area/pocket"};
