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
    const exits = {};
    for (const i of Object.keys(state.extra?.exits ?? {})) {
        exits[translation[i] ?? i] = translation[state.extra.exits[i]] ?? state.extra.exits[i];
    }
    res.extra = {...state.extra, exits};
    return res;
});

const translation = {
    "region.shadow_temple_entrence -> region.shadow_temple_gateway": "region.shadow_temple_entrance -> region.shadow_temple_gateway",
    "region.shadow_temple_gateway -> region.shadow_temple_entrence": "region.shadow_temple_gateway -> region.shadow_temple_entrance"
};
