/**
 * move to serverside earliest past 2023‑07‑03
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

    // exitBindings

    for (const [key, value] of Object.entries(state.data?.exitBindings ?? {})) {
        const transKey = FULL_TRANSLATION[key] ?? key.split(" -> ").map((e) => {
            return TRANSLATION[e] ?? e;
        }).join(" -> ") ?? key;
        const transValue = FULL_TRANSLATION[value] ?? value?.split(" -> ").map((e) => {
            return TRANSLATION[e] ?? e;
        }).join(" -> ") ?? value;
        res.data.exitBindings[transKey] = transValue;
    }

    return res;
});

const FULL_TRANSLATION = {
    "adult_spawn -> temple_of_time": "adult_spawn_temple_of_time_gateway -> temple_of_time_adult_spawn_gateway",
    "temple_of_time -> adult_spawn": "temple_of_time_adult_spawn_gateway -> adult_spawn_temple_of_time_gateway",
    "child_spawn -> kf_links_house": "child_spawn_links_house_gateway -> links_house_child_spawn_gateway",
    "kf_links_house -> child_spawn": "links_house_child_spawn_gateway -> child_spawn_links_house_gateway",
    "child_spawn -> links_house_kokiri_gateway": "child_spawn_links_house_gateway -> links_house_child_spawn_gateway",
    "links_house_kokiri_gateway -> child_spawn": "links_house_child_spawn_gateway -> child_spawn_links_house_gateway",
    "prelude_of_light_warp -> temple_of_time": "prelude_temple_of_time_gateway -> temple_of_time_prelude_gateway",
    "temple_of_time -> prelude_of_light_warp": "temple_of_time_prelude_gateway -> prelude_temple_of_time_gateway",
    "tot_entrance -> temple_of_time": "tot_entrance_temple_of_time_gateway -> temple_of_time_tot_entrance_gateway",
    "temple_of_time -> tot_entrance": "temple_of_time_tot_entrance_gateway -> tot_entrance_temple_of_time_gateway"
}

const TRANSLATION = {
    "minuet_of_forest_warp": "minuet_meadow_gateway",
    "sacred_forest_meadow": "meadow_minuet_gateway",
    "bolero_of_fire_warp": "bolero_crater_gateway",
    "dmc_central_local": "crater_bolero_gateway",
    "serenade_of_water_warp": "serenade_lake_gateway",
    "lake_hylia": "lake_serenade_gateway",
    "nocturne_of_shadow_warp": "nocturne_graveyard_gateway",
    "graveyard_warp_pad_region": "graveyard_nocturne_gateway",
    "requiem_of_spirit_warp": "requiem_colossus_gateway",
    "desert_colossus": "colossus_requiem_gateway"
}
