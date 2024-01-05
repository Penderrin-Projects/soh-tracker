/**
 * move to serverside earliest past 2023‑09‑27
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
            exitBindings: {},
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

    res.data.options["shuffle_expensive_merchants"] = res.data.options["shuffleMediCarpet"];

    res.data.songNotes["song_zelda"] = res.data.songNotes["zelda"] ?? "LURLUR";
    res.data.songNotes["song_epona"] = res.data.songNotes["epona"] ?? "ULRULR";
    res.data.songNotes["song_saria"] = res.data.songNotes["saria"] ?? "DRLDRL";
    res.data.songNotes["song_sun"] = res.data.songNotes["sun"] ?? "RDURDU";
    res.data.songNotes["song_time"] = res.data.songNotes["time"] ?? "RADRAD";
    res.data.songNotes["song_storm"] = res.data.songNotes["storm"] ?? "ADUADU";
    res.data.songNotes["song_scarecrow"] = res.data.songNotes["scarecrow"] ?? "";
    res.data.songNotes["song_woods"] = res.data.songNotes["woods"] ?? "";

    return res;
});

