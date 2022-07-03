/**
 * move to serverside earliest past {YYYY+1}‑MM‑DD
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";
import "./StateConverter22.js";

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
            locationItems: state.data?.locationItems ?? {},
            startItems: state.data?.startItems ?? {},
            options: {},
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

    for (const [key, value] of Object.entries(state.data?.options ?? {})) {
        if (key != "keysanity_small" && key != "track_keys" && key != "track_bosskeys" && key != "ganon_boss_door_open") {
            res.data.options[key] = value;
        }
    }

    if (state.data?.options["track_keys"]) {
        if (state.data?.options["keysanity_small"]) {
            res.data.options["small_key_logic"] = "keylogic_keysanity";
            res.data.options["gerudo_key_logic"] = "keylogic_keysanity";
        } else {
            res.data.options["small_key_logic"] = "keylogic_vanilla";
            res.data.options["gerudo_key_logic"] = "keylogic_vanilla";
        }
    } else {
        res.data.options["small_key_logic"] = "keylogic_keysy";
        res.data.options["gerudo_key_logic"] = "keylogic_vanilla";
    }

    if (state.data?.options["track_bosskeys"]) {
        res.data.options["boss_key_logic"] = "keylogic_vanilla";
    } else {
        res.data.options["boss_key_logic"] = "keylogic_keysy";
    }

    if (state.data?.options["ganon_boss_door_open"]) {
        res.data.options["ganon_key_logic"] = "keylogic_keysy";
    } else {
        res.data.options["ganon_key_logic"] = "keylogic_vanilla";
    }

    return res;
});
