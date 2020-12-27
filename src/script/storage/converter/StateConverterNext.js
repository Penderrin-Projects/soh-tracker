/**
 * move to serverside past TBD
 */

import StateConverter from "../StateConverter.js";

const TEST_ITEM = /location\/[^.]+\.g_[^.]+\.item/;
const TEST_LOCATION = /location\/[^.]+\.g_[^.]+\.location/;

StateConverter.register(function(state) {
    const res = {
        data: {},
        extra: {},
        notes: state.notes,
        autosave: state.autosave,
        timestamp: state.timestamp,
        name: state.name
    };
    // move gossipstone data
    for (const i of Object.keys(state.data)) {
        if (TEST_ITEM.test(i)) {
            const value = res.data[i.slice(0, -5)] ?? {};
            value.item = state.data[i];
            res.data[i.slice(0, -5)] = value;
        } else if (TEST_LOCATION.test(i)) {
            const value = res.data[i.slice(0, -9)] ?? {};
            value.location = state.data[i];
            res.data[i.slice(0, -9)] = value;
        } else {
            res.data[i] = state.data[i];
        }
    }
    // collect data
    return res;
});
