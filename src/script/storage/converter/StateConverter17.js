/**
 * move to serverside earliest past TBD
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";
import "./StateConverter16.js";

SavestateConverter.register(function(state) {
    const {dungeontype = {}, dungeonreward = {}, ...data} = state.data;

    const res = {
        data: {...data, dungeontype: {}, dungeonreward: {}},
        options: state.options,
        filter: state.filter
    };
    
    for (const [key, value] of Object.entries(dungeontype)) {
        if (key == "area/gerudo_fortress") {
            res.data.dungeontype["area/gerudo"] = value;
        } else {
            res.data.dungeontype[key] = value;
        }
    }
    
    for (const [key, value] of Object.entries(dungeonreward)) {
        if (key == "area/gerudo_fortress") {
            res.data.dungeonreward["area/gerudo"] = value;
        } else {
            res.data.dungeonreward[key] = value;
        }
    }

    return res;
});
