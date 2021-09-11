/**
 * move to serverside earliest past 2022‑06‑27
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";
import "./StateConverter15.js";

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
