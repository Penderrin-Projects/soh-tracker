/**
 * move to serverside earliest past 2023‑09‑27
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";

const URL = import.meta.url;
const VER_REGEX = /([0-9]+)\.js$/;

// LOAD PREVIOUS CONVERTER
const FORMER_CONVERTER_URL = URL.replace(VER_REGEX, (_, ver) => `${parseInt(ver) - 1}.js`);
await import(FORMER_CONVERTER_URL);

// REGISTER CONVERTER
const GATEWAY_IN_REGEX = /temple_([a-z]+?)_boss_gateway/;
const GATEWAY_OUT_REGEX = /boss_temple_([a-z]+?)_gateway/;

SavestateConverter.register(function(state) {
    state = state ?? {};

    // remove read of altered data
    const res = {
        meta: state.meta ?? {},
        data: {
            // GameTrackerJS
            "": state.data?.[""] ?? {},
            items: state.data?.items ?? {},
            locations: state.data?.locations ?? {},
            exitBindings: {},
            areaHints: state.data?.areaHints ?? {},
            locationItems: state.data?.locationItems ?? {},
            startItems: state.data?.startItems ?? {},
            options: state.data?.options ?? {},
            filter: state.data?.filter ?? {},
            // Track-OOT
            dungeonRewards: state.data?.dungeonRewards ?? {},
            dungeonTypes: state.data?.dungeonTypes ?? {},
            shopItems: state.data?.shopItems ?? {},
            shopItemsPrice: state.data?.shopItemsPrice ?? {},
            shopItemsBought: state.data?.shopItemsBought ?? {},
            shopItemsName: state.data?.shopItemsName ?? {},
            songNotes: state.data?.songNotes ?? {},
            gossipstoneLocations: state.data?.gossipstoneLocations ?? {},
            gossipstoneItems: state.data?.gossipstoneItems ?? {},
            parseSpoiler: state.data?.parseSpoiler ?? {}
        },
        notes: state.notes ?? "",
        autosave: state.autosave ?? false,
        timestamp: state.timestamp ?? new Date(),
        name: state.name ?? ""
    };

    // options

    for (const [key, value] of Object.entries(state.data?.exitBindings ?? {})) {
        const newKey = key.raplace(GATEWAY_IN_REGEX, "$1_temple_boss_gateway").replace(GATEWAY_OUT_REGEX, "boss_$1_temple_gateway");
        const newValue = value.raplace(GATEWAY_IN_REGEX, "$1_temple_boss_gateway").replace(GATEWAY_OUT_REGEX, "boss_$1_temple_gateway");
        res.data.exitBindings[newKey] = newValue;
    }

    return res;
});

