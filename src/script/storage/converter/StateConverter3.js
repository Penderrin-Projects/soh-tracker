/**
 * move to serverside earliest past 2021‑06-23
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";
import "./StateConverter2.js";

SavestateConverter.register(function(state) {
    const res = {
        data: {},
        autosave: state.autosave,
        timestamp: state.timestamp,
        name: state.name
    };
    for (const i of Object.keys(state.data)) {
        if (i.startsWith("dungeonRewards.")) {
            res.data[i] = REWARDS[state.data[i]];
        } else {
            res.data[i] = state.data[i];
        }
    }
    return res;
});

const REWARDS = [
    "",
    "item.stone_forest",
    "item.stone_fire",
    "item.stone_water",
    "item.medallion_forest",
    "item.medallion_fire",
    "item.medallion_water",
    "item.medallion_spirit",
    "item.medallion_shadow",
    "item.medallion_light"
];
