// Track-OOT
import OptionsTransResource from "/script/resource/OptionsTransResource.js";

import parseSettings from "./parseSettings.js";
import parseStartingItems from "./parseStartingItems.js";
import parseItemLocations from "./parseItemLocations.js";
import parseWoth from "./parseWoth.js";
import parseBarren from "./parseBarren.js";
import parseShops from "./parseShops.js";
import parseTrials from "./parseTrials.js";
import parseDungeonTypes from "./parseDungeonTypes.js";
import parseDungeonRewards from "./parseDungeonRewards.js";
import parseEntrances from "./parseEntrances.js";
import parseDisabledLocations from "./parseDisabledLocations.js";

const DEFAULT_DATA = {
    "": {},
    area_hint: {},
    dungeonreward: {},
    dungeontype: {},
    exits: {},
    gossipstone: {},
    item_location: {},
    meta: {},
    parseSpoiler: {},
    shops: {},
    songs: {}
};

function getVersionType(version) {
    if (version.split(" ")[1] === "Release") return "prod";
    if (version.split(" ")[1] === "f.LUM") return "dev";
}

function getWorldNumber(multiWorld, worldCount) {
    if (Number.isNaN(worldCount)) {
        worldCount = 0;
    }
    if (multiWorld > worldCount) throw new Error(`World index (${multiWorld}) is higher than the maximum world count (${worldCount})`);
    if (worldCount > 1) return multiWorld;
}

function getWorldData(data, world) {
    if (world != null) {
        return data["World " + world];
    }
    return data;
}

class SpoilerParser {

    parse(spoiler, settings) {
        const mainData = {};
        const extraData = {};
        const options = {};
        const areahint = {};
        const trans = OptionsTransResource.get();

        const version = getVersionType(spoiler[":version"]);
        if (version == null) {
            throw new Error("Not a valid OOTR Spoiler log found");
        }
        
        const world = getWorldNumber(settings["parse.multiworld"], spoiler["settings"]?.["world_count"]);

        if (settings["parse.settings"]) parseSettings(options, spoiler["settings"], trans);
        if (settings["parse.starting_items"]) parseStartingItems(mainData, getWorldData(spoiler["starting_items"], world), trans);
        if (settings["parse.random_settings"]) parseSettings(options, getWorldData(spoiler["randomized_settings"], world), trans);
        if (settings["parse.item_association"]) parseItemLocations(extraData, getWorldData(spoiler["locations"], world), world, trans);
        if (settings["parse.woth_hints"]) parseWoth(areahint, getWorldData(spoiler[":woth_locations"], world), trans);
        if (settings["parse.barren"]) parseBarren(areahint, getWorldData(spoiler[":barren_regions"], world), trans);
        if (settings["parse.shops"]) parseShops(extraData, getWorldData(spoiler["locations"], world), trans, spoiler.settings["shopsanity"]);
        // if(settings["parse.gossip_stones"]) parseStones(extraData, getWorldData(spoiler["gossip_stones"], world), trans);
        if (settings["parse.trials"]) parseTrials(options, getWorldData(spoiler["trials"], world), trans);
        if (settings["parse.dungeonReward"]) parseDungeonRewards(extraData, getWorldData(spoiler["locations"], world), trans);
        if (settings["parse.dungeons"]) parseDungeonTypes(extraData, getWorldData(spoiler["dungeons"], world), trans);
        if (settings["parse.disabled_locations"]) parseDisabledLocations(mainData, spoiler["settings"]?.["disabled_locations"], trans);

        parseEntrances(extraData, getWorldData(spoiler["entrances"], world), trans, {
            dungeon: settings["parse.entro_dungeons"],
            grottos: settings["parse.entro_grottos"],
            indoors: settings["parse.entro_indoors"],
            overworld: settings["parse.entro_overworld"],
            owls: settings["parse.entro_owls"],
            spawns: settings["parse.entro_spawns"],
            warps: settings["parse.entro_warps"]
        });

        if (version == "prod") {
            // nothing
        }

        if (version == "dev") {
            // nothing
        }

        return {
            data: {
                ...DEFAULT_DATA,
                ...extraData,
                "": mainData,
                "area_hint": areahint
            },
            options
        };
    }

}

export default new SpoilerParser();
