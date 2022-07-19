/**
 * move to serverside earliest past 2020‑12‑31
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";

// LOAD PREVIOUS CONVERTER
// const FORMER_CONVERTER_URL = URL.replace(VER_REGEX, (_, ver) => `${parseInt(ver) - 1}.js`);
// await import(FORMER_CONVERTER_URL);

// REGISTER CONVERTER
SavestateConverter.register(function(state) {
    if (!state["data"] != null) {
        state = {data: state ?? {}};
    }
    const res = {
        data: {},
        autosave: false,
        timestamp: new Date(),
        name: state.name ?? ""
    };
    for (const i of Object.keys(state.data ?? {})) {
        if (i != "meta") {
            for (const j of Object.keys(state.data[i])) {
                if (i == "extras") {
                    res.data[j] = state.data[i][j];
                } else {
                    res.data[`${i}.${j}`] = state.data[i][j];
                }
            }
        } else {
            res.name = state.data["meta"]["active_state"] ?? "";
        }
    }
    return res;
});
