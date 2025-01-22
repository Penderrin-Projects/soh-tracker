/**
 * move to serverside earliest past 2024‑07‑31
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";

const URL = import.meta.url;
const VER_REGEX = /([0-9]+)\.js$/;

// LOAD PREVIOUS CONVERTER
const FORMER_CONVERTER_URL = URL.replace(VER_REGEX, (_, ver) => `${parseInt(ver) - 1}.js`);
await import(FORMER_CONVERTER_URL);

SavestateConverter.register(function(state) {
    state = state ?? {};

    // remove read of altered data
    const res = {
        meta: state.meta ?? {},
        data: {
            // GameTrackerJS
            "": state.data?.[""] ?? {},
            items: state.data?.items ?? {},
            locations: {},
            exitBindings: state.data?.exitBindings ?? {},
            areaHints: state.data?.areaHints ?? {},
            areaActiveLists: state.data?.areaActiveLists ?? {},
            locationItems: state.data?.locationItems ?? {},
            startItems: state.data?.startItems ?? {},
            options: state.data?.options ?? {},
            filter: state.data?.filter ?? {},
            // Track-OOT
            dungeonRewards: state.data?.dungeonRewards ?? {},
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

    for (const [key, value] of Object.entries(state.data?.locations ?? {})) {
        if (value) {
            switch (key) {
                case "deku_mq.c_gohma": {
                    res.data.locations["deku.c_gohma"] = value;
                } break;
                case "dodongo_mq.c_chest_above_dodongo": {
                    res.data.locations["dodongo.c_chest_above_dodongo"] = value;
                } break;
                case "dodongo_mq.c_dodongo": {
                    res.data.locations["dodongo.c_dodongo"] = value;
                } break;
                case "jabujabu_mq.c_barinade": {
                    res.data.locations["jabujabu.c_barinade"] = value;
                } break;
                case "temple_forest_mq.c_phantomganon": {
                    res.data.locations["temple_forest.c_phantomganon"] = value;
                } break;
                case "temple_fire_mq.c_volvagia": {
                    res.data.locations["temple_fire.c_volvagia"] = value;
                } break;
                case "temple_water_mq.c_morpha": {
                    res.data.locations["temple_water.c_morpha"] = value;
                } break;
                case "temple_shadow_mq.c_bongobongo": {
                    res.data.locations["temple_shadow.c_bongobongo"] = value;
                } break;
                case "temple_spirit_mq.c_twinrova": {
                    res.data.locations["temple_spirit.c_twinrova"] = value;
                } break;
                case "castle_ganon_mq.c_boss_key": {
                    res.data.locations["castle_ganon.c_boss_key"] = value;
                } break;
                case "castle_ganon_mq.c_boss": {
                    res.data.locations["castle_ganon.c_boss"] = value;
                } break;
                case "ice_cavern_mq.c_sheik": {
                    res.data.locations["ice_cavern.c_sheik"] = value;
                } break;
                default: {
                    res.data.locations[key] = value;
                } break;
            }
        }
    }

    return res;
});

