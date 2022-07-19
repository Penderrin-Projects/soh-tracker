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
        data: {},
        extra: state.extra ?? {},
        notes: state.notes ?? state.data.notes ?? "",
        autosave: state.autosave ?? false,
        timestamp: state.timestamp ?? new Date(),
        name: state.name ?? ""
    };
    // move gossipstone data
    for (const i of Object.keys(state.data ?? {})) {
        if (TEST_ITEM.test(i)) {
            res.extra.gossipstone = res.extra.gossipstone ?? {};
            const value = res.extra.gossipstone[i.slice(0, -5)] ?? {};
            value.item = state.data[i];
            res.extra.gossipstone[i.slice(0, -5)] = value;
        } else if (TEST_LOCATION.test(i)) {
            res.extra.gossipstone = res.extra.gossipstone ?? {};
            const value = res.extra.gossipstone[i.slice(0, -9)] ?? {};
            value.location = state.data[i];
            res.extra.gossipstone[i.slice(0, -9)] = value;
        } else {
            res.data[i] = state.data[i];
        }
    }
    const extra_shops = {};
    for (const [key, value] of Object.entries(state.extra?.shops_items ?? {})) {
        for (let i = 0; i < 8; ++i) {
            extra_shops[`${key}/${i}.item`] = value[i].item;
            extra_shops[`${key}/${i}.price`] = value[i].price;
        }
    }
    for (const [key, value] of Object.entries(state.extra?.shops_bought ?? {})) {
        for (let i = 0; i < 8; ++i) {
            extra_shops[`${key}/${i}.bought`] = !!value[i];
        }
    }
    for (const [key, value] of Object.entries(state.extra?.shops_names ?? {})) {
        for (let i = 0; i < 8; ++i) {
            extra_shops[`${key}/${i}.name`] = value[i];
        }
    }
    // collect data
    res.extra.shops = extra_shops;
    return res;
});

const TEST_ITEM = /location\/[^.]+\.g_[^.]+\.item/;
const TEST_LOCATION = /location\/[^.]+\.g_[^.]+\.location/;
