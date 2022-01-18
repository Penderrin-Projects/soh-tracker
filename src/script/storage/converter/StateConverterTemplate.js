/**
 * move to serverside earliest past {YYYY+1}‑MM‑DD
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";
import "./StateConverter{^-1}.js";

SavestateConverter.register(function(state) {
    state = state ?? {};

    const {
        data: {
            "": main = {},
            area_hint = {},
            dungeonreward = {},
            dungeontype = {},
            exits = {},
            gossipstone = {},
            item_location = {},
            meta = {},
            parseSpoiler = {},
            shops = {},
            songs = {},
            ...data
        } = {},
        options = {},
        filter = {},
        notes = "",
        autosave = false,
        timestamp = new Date(),
        name = ""
    } = state ?? {};

    // example - BEGIN

    const res_dungeonreward = {};

    for (const [key, value] of Object.entries(dungeonreward)) {
        if (key == "area/gerudo_fortress") {
            res.data.dungeonreward["area/gerudo"] = value;
        } else {
            res.data.dungeonreward[key] = value;
        }
    }

    return {
        data: {
            ...data,
            "": main,
            area_hint,
            dungeonreward: res_dungeonreward,
            dungeontype,
            exits,
            gossipstone,
            item_location,
            meta,
            parseSpoiler,
            shops,
            songs
        },
        options,
        filter,
        notes,
        autosave,
        timestamp,
        name
    };

    // example - END

    /* return {
        data: {
            ...data,
            "": main,
            area_hint,
            dungeonreward,
            dungeontype,
            exits,
            gossipstone,
            item_location,
            meta,
            parseSpoiler,
            shops,
            songs
        },
        options,
        filter,
        notes,
        autosave,
        timestamp,
        name
    }; */

});
  