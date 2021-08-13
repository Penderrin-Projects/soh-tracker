/**
 * move to serverside earliest past 2022‑08‑13
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";
import "./StateConverter16.js";

SavestateConverter.register(function(state) {
    state = state ?? {};

    const res = {
        data: state.data ?? {},
        startitems: state.startitems ?? {},
        options: state.options ?? {},
        filter: state.filter ?? {},
        notes: state.notes ?? "",
        autosave: state.autosave ?? false,
        timestamp: state.timestamp ?? new Date(),
        name: state.name ?? ""
    };

    return res;
});
