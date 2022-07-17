/**
 * move to serverside earliest past 2023‑07‑03
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";
import "./StateConverter24.js";

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
            dungeonRewards: state.data?.dungeonTypes ?? {},
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

    // example - BEGIN

    for (const [key, value] of Object.entries(state.data?.exitBindings ?? {})) {
        const transKey = key.split(" -> ").map((e) => TRANSLATION[e] ?? e).join(" -> ");
        const transValue = value?.split(" -> ").map((e) => TRANSLATION[e] ?? e).join(" -> ");
        res.data.exitBindings[transKey] = transValue;
    }

    return res;
});

const TRANSLATION = {
    "lh_owl_flight": "lake_owl_gateway",
    "hyrule_field": "owl_lake_gateway",
    "dmt_owl_flight": "mountain_owl_gateway",
    "kak_impas_rooftop": "owl_mountain_gateway"
}
