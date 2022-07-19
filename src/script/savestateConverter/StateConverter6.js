/**
 * move to serverside earliest past 2021‑11‑01
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
        data: {},
        extra: state.extra ?? {},
        notes: state.notes ?? "",
        autosave: state.autosave ?? false,
        timestamp: state.timestamp ?? new Date(),
        name: state.name ?? ""
    };
    for (const i of Object.keys(state.data ?? {})) {
        if (i == "location.kokiri.c_midos_house") {
            const val = state.data["location.kokiri.c_midos_house"];
            res.data["location.kokiri.c_midos_house_1"] = val;
            res.data["location.kokiri.c_midos_house_2"] = val;
            res.data["location.kokiri.c_midos_house_3"] = val;
            res.data["location.kokiri.c_midos_house_4"] = val;
        } else {
            res.data[i] = state.data[i];
        }
    }
    return res;
});
