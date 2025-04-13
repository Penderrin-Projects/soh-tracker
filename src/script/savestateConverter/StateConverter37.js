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
            locations: state.data?.locations ?? {},
            exitBindings: state.data?.exitBindings ?? {},
            areaHints: state.data?.areaHints ?? {},
            areaActiveLists: state.data?.areaActiveLists ?? {},
            locationItems: {},
            startItems: state.data?.startItems ?? {},
            options: state.data?.options ?? {},
            filter: state.data?.filter ?? {},
            // Track-OOT
            dungeonRewards: state.data?.dungeonRewards ?? {},
            shopItemsPrice: {},
            shopItemsName: {},
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

    const CONVERSION_MAP = {
        "kokiri/0": "kokiri.kokiri_shop_8",
        "kokiri/1": "kokiri.kokiri_shop_6",
        "kokiri/2": "kokiri.kokiri_shop_2",
        "kokiri/3": "kokiri.kokiri_shop_4",
        "kokiri/4": "kokiri.kokiri_shop_7",
        "kokiri/5": "kokiri.kokiri_shop_5",
        "kokiri/6": "kokiri.kokiri_shop_1",
        "kokiri/7": "kokiri.kokiri_shop_3",
        "goron/0": "goron.goron_shop_8",
        "goron/1": "goron.goron_shop_6",
        "goron/2": "goron.goron_shop_2",
        "goron/3": "goron.goron_shop_4",
        "goron/4": "goron.goron_shop_7",
        "goron/5": "goron.goron_shop_5",
        "goron/6": "goron.goron_shop_1",
        "goron/7": "goron.goron_shop_3",
        "zora/0": "zoras.zoras_shop_8",
        "zora/1": "zoras.zoras_shop_6",
        "zora/2": "zoras.zoras_shop_2",
        "zora/3": "zoras.zoras_shop_4",
        "zora/4": "zoras.zoras_shop_7",
        "zora/5": "zoras.zoras_shop_5",
        "zora/6": "zoras.zoras_shop_1",
        "zora/7": "zoras.zoras_shop_3",
        "bombchu/0": "castle_town.shop_bombchu_8",
        "bombchu/1": "castle_town.shop_bombchu_6",
        "bombchu/2": "castle_town.shop_bombchu_2",
        "bombchu/3": "castle_town.shop_bombchu_4",
        "bombchu/4": "castle_town.shop_bombchu_7",
        "bombchu/5": "castle_town.shop_bombchu_5",
        "bombchu/6": "castle_town.shop_bombchu_1",
        "bombchu/7": "castle_town.shop_bombchu_3",
        "basar_child/0": "castle_town.shop_bazaar_8",
        "basar_child/1": "castle_town.shop_bazaar_6",
        "basar_child/2": "castle_town.shop_bazaar_2",
        "basar_child/3": "castle_town.shop_bazaar_4",
        "basar_child/4": "castle_town.shop_bazaar_7",
        "basar_child/5": "castle_town.shop_bazaar_5",
        "basar_child/6": "castle_town.shop_bazaar_1",
        "basar_child/7": "castle_town.shop_bazaar_3",
        "magic_child/0": "castle_town.shop_magic_8",
        "magic_child/1": "castle_town.shop_magic_6",
        "magic_child/2": "castle_town.shop_magic_2",
        "magic_child/3": "castle_town.shop_magic_4",
        "magic_child/4": "castle_town.shop_magic_7",
        "magic_child/5": "castle_town.shop_magic_5",
        "magic_child/6": "castle_town.shop_magic_1",
        "magic_child/7": "castle_town.shop_magic_3",
        "basar_adult/0": "kakariko.shop_bazaar_8",
        "basar_adult/1": "kakariko.shop_bazaar_6",
        "basar_adult/2": "kakariko.shop_bazaar_2",
        "basar_adult/3": "kakariko.shop_bazaar_4",
        "basar_adult/4": "kakariko.shop_bazaar_7",
        "basar_adult/5": "kakariko.shop_bazaar_5",
        "basar_adult/6": "kakariko.shop_bazaar_1",
        "basar_adult/7": "kakariko.shop_bazaar_3",
        "magic_adult/0": "kakariko.shop_magic_8",
        "magic_adult/1": "kakariko.shop_magic_6",
        "magic_adult/2": "kakariko.shop_magic_2",
        "magic_adult/3": "kakariko.shop_magic_4",
        "magic_adult/4": "kakariko.shop_magic_7",
        "magic_adult/5": "kakariko.shop_magic_5",
        "magic_adult/6": "kakariko.shop_magic_1",
        "magic_adult/7": "kakariko.shop_magic_3"
    };

    const ITEM_NAME_TRANSLATION = {
        "silver_rupee_castle_ganon_trial_forest": "silver_rupee_ganon_trial_forest",
        "silver_rupee_castle_ganon_trial_fire": "silver_rupee_ganon_trial_fire",
        "silver_rupee_castle_ganon_trial_water": "silver_rupee_ganon_trial_water",
        "silver_rupee_castle_ganon_trial_shadow": "silver_rupee_ganon_trial_shadow",
        "silver_rupee_castle_ganon_trial_spirit": "silver_rupee_ganon_trial_spirit",
        "silver_rupee_castle_ganon_trial_light": "silver_rupee_ganon_trial_light"
    };

    for (const [key, value] of Object.entries(state.data?.locationItems ?? {})) {
        if (value) {
            res.data.locationItems[key] = ITEM_NAME_TRANSLATION[value] ?? value;
        }
    }

    for (const [key, value] of Object.entries(state.data?.shopItems ?? {})) {
        if (value) {
            res.data.locationItems[CONVERSION_MAP[key] ?? key] = ITEM_NAME_TRANSLATION[value] ?? value;
        }
    }

    for (const [key, value] of Object.entries(state.data?.shopItemsBought ?? {})) {
        res.data.locations[CONVERSION_MAP[key] ?? key] = !!value;
    }

    for (const [key, value] of Object.entries(state.data?.shopItemsPrice ?? {})) {
        if (typeof value === "number" && !isNaN(value)) {
            res.data.shopItemsPrice[CONVERSION_MAP[key] ?? key] = value;
        }
    }

    for (const [key, value] of Object.entries(state.data?.shopItemsName ?? {})) {
        if (value) {
            res.data.shopItemsName[CONVERSION_MAP[key] ?? key] = value;
        }
    }

    return res;
});

