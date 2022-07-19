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
        data: {
            "": {},
            ...state.extra
        },
        options: {},
        filter: {},
        notes: state.notes ?? "",
        autosave: state.autosave ?? false,
        timestamp: state.timestamp ?? new Date(),
        name: state.name ?? ""
    };

    for (const [key, value] of Object.entries(state.data ?? {})) {
        if (key.startsWith("option.") || key.startsWith("skip.")) {
            res.options[key] = value;
        } else if (key.startsWith("filter.")) {
            res.filter[key] = value;
        } else {
            res.data[""][key] = value;
        }
    }

    return res;
});
