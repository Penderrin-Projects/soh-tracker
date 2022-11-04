/**
 * move to serverside earliest past 2022‑09‑10
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
            options: {},
            filter: {},
            // Track-OOT
            dungeonRewards: state.data?.dungeonRewards ?? {},
            dungeonTypes: state.data?.dungeonTypes ?? {},
            shopItems: {},
            shopItemsPrice: {},
            shopItemsBought: {},
            shopItemsName: {},
            songNotes: {},
            gossipstoneLocations: state.data?.gossipstoneLocations ?? {},
            gossipstoneItems: state.data?.gossipstoneItems ?? {},
            parseSpoiler: {}
        },
        notes: state.notes ?? "",
        autosave: state.autosave ?? false,
        timestamp: state.timestamp ?? new Date(),
        name: state.name ?? ""
    };

    // GameTrackerJS
    for (const [key, value] of Object.entries(state.data?.exitBindings ?? {})) {
        const resKey = key.split(" -> ").map((s) => s.replace("region.", "")).join(" -> ");
        const resValue = value.split(" -> ").map((s) => s.replace("region.", "")).join(" -> ");
        res.data.exitBindings[resKey] = resValue;
    }
    for (const [key, value] of Object.entries(state.data?.filter ?? {})) {
        const resKey = key.replace("filter.", "");
        res.data.filter[resKey] = value;
    }
    for (const [key, value] of Object.entries(state.data?.options ?? {})) {
        const resKey = key.replace("option.", "");
        res.data.options[resKey] = value;
    }

    // Track-OOT
    for (const [key, value] of Object.entries(state.data?.songNotes ?? {})) {
        const resKey = key.replace("song.", "");
        res.data.songNotes[resKey] = value;
    }

    for (const [key, value] of Object.entries(state.data?.shopItems ?? {})) {
        const resKey = key.replace("shop.", "");
        res.data.shopItems[resKey] = value;
    }
    for (const [key, value] of Object.entries(state.data?.shopItemsPrice ?? {})) {
        const resKey = key.replace("shop.", "");
        res.data.shopItemsPrice[resKey] = value;
    }
    for (const [key, value] of Object.entries(state.data?.shopItemsBought ?? {})) {
        const resKey = key.replace("shop.", "");
        res.data.shopItemsBought[resKey] = value;
    }
    for (const [key, value] of Object.entries(state.data?.shopItemsName ?? {})) {
        const resKey = key.replace("shop.", "");
        res.data.shopItemsName[resKey] = value;
    }
    for (const [key, value] of Object.entries(state.data?.parseSpoiler ?? {})) {
        const resKey = key.replace("parse.", "");
        res.data.parseSpoiler[resKey] = value;
    }

    return res;
});
