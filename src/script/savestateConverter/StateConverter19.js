/**
 * move to serverside earliest past 2022‑??‑??
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";
import "./StateConverter18.js";

SavestateConverter.register(function(state) {
    state = state ?? {};

    const {exits = {}, ...data} = state.data ?? {};

    const res = {
        data: {...data, exits: {}},
        options: state.options ?? {},
        filter: state.filter ?? {},
        notes: state.notes ?? "",
        autosave: state.autosave ?? false,
        timestamp: state.timestamp ?? new Date(),
        name: state.name ?? ""
    };
    
    for (const [key, value] of Object.entries(exits)) {
        const [k1, k2] = key.split(" -> ");
        const [v1, v2] = value.split(" -> ");
        res.data.exits[`${EXIT_TRANS[k1] || k1} -> ${EXIT_TRANS[k2] || k2}`] = `${EXIT_TRANS[v1] || v1} -> ${EXIT_TRANS[v2] || v2}`;
    }

    return res;
});

const EXIT_TRANS = {
    "region.graveyard_composers_grave": "region.graveyard_royal_familys_tomb"
};
 