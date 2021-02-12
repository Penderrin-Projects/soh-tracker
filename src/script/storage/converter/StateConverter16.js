/**
 * move to serverside earliest past TBD
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";

SavestateConverter.register(function(state) {
    const res = {
        data: {
            "": {},
            ...state.extra
        },
        options: {},
        filter: {}
    };
    
    for (const [key, value] of Object.entries(state.data)) {
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
