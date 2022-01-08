/**
 * move to serverside earliest past 2022‑09‑10
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";
import "./StateConverter20.js";

SavestateConverter.register(function(state) {
    state = state ?? {};

    const res = {
        meta: state.meta ?? state.data?.meta ?? {},
        data: {
            // GameTrackerJS
            "": state.data?.[""] ?? {},
            items: state.data?.items ?? {},
            locations: state.data?.locations ?? {},
            exitBindings: state.data?.exitBindings ?? state.data?.exits ?? {},
            areaHints: state.data?.areaHints ?? {},
            locationItems: state.data?.locationItems ?? {},
            startItems: state.data?.startItems ?? {},
            options: state.data?.options ?? state.options ?? {},
            filter: state.data?.filter ?? state.filter ?? {},
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

    // GameTrackerJS
    for (const [key, value] of Object.entries(state.data?.[""] ?? {})) {
        if (key.startsWith("item.")) {
            res.data.items[key.slice(5)] = value;
        } else if (key.startsWith("location/")) {
            res.data.locations[key.slice(9)] = value;
        } else {
            res.data[""][key] = value;
        }
    }
    for (const [key, value] of Object.entries(state.data?.area_hint ?? {})) {
        res.data.areaHints[key.slice(5)] = value;
    }
    for (const [key, value] of Object.entries(state.data?.item_location ?? {})) {
        res.data.locationItems[key.slice(9)] = value.slice(5);
    }
    for (const [key, value] of Object.entries(state.startitems ?? {})) {
        res.data.startItems[key.slice(5)] = value;
    }

    // Track-OOT
    for (const [key, value] of Object.entries(state.data?.dungeonreward ?? {})) {
        res.data.dungeonRewards[key.slice(5)] = value;
    }
    for (const [key, value] of Object.entries(state.data?.dungeontype ?? {})) {
        res.data.dungeonTypes[key.slice(5)] = value;
    }
    for (const [key, value] of Object.entries(state.data?.shops ?? {})) {
        const ref = key.slice(5);
        if (ref.endsWith(".item")) {
            res.data.shopItems[ref.slice(0, -5)] = value.slice(5);
        } else if (ref.endsWith(".price")) {
            res.data.shopItemsPrice[ref.slice(0, -6)] = value;
        } else if (ref.endsWith(".bought")) {
            res.data.shopItemsBought[ref.slice(0, -7)] = value;
        } else if (ref.endsWith(".name")) {
            res.data.shopItemsName[ref.slice(0, -5)] = value;
        } 
    }
    for (const [key, value] of Object.entries(state.data?.songs ?? {})) {
        res.data.songNotes[key.slice(5)] = value;
    }
    for (const [key, value] of Object.entries(state.data?.gossipstone ?? {})) {
        const ref = key.slice(9);
        res.data.gossipstoneLocations[ref] = value.location.slice(9);
        res.data.gossipstoneItems[ref] = value.location.slice(5);
    }

    return res;
}, true);
