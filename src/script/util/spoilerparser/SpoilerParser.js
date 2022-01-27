// frameworks
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";

// GameTrackerJS
import BusyIndicator from "/GameTrackerJS/ui/BusyIndicator.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";

// Track-OOT
import OptionsTransResource from "/script/resource/OptionsTransResource.js";
import parseSettings from "./parseSettings.js";
import parseStartingInventory from "./parseStartingInventory.js";
import parseItemLocations from "./parseItemLocations.js";
import parseWoth from "./parseWoth.js";
import parseBarren from "./parseBarren.js";
import parseShops from "./parseShops.js";
import parseTrials from "./parseTrials.js";
import parseDungeonTypes from "./parseDungeonTypes.js";
import parseDungeonRewards from "./parseDungeonRewards.js";
import parseEntrances from "./parseEntrances.js";
import parseDisabledLocations from "./parseDisabledLocations.js";
import ErrorDialogHandler from "../ErrorDialogHandler.js";

const errorDialogHandler = new ErrorDialogHandler(
    "Spoiler Loaded Partially",
    `Not all settings in your spoiler log were loaded correctly.
Please report this issue on discord and provide the affected spoiler log and the errors listed below.

The following errors were recorded:`
);

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
    if (version.split(" ")[1] === "Release") {
        return "prod";
    }
    if (version.split(" ")[1] === "f.LUM") {
        return "dev";
    }
    if (version != null) {
        return "unknown";
    }
}

function getWorldNumber(multiWorld, worldCount) {
    if (Number.isNaN(worldCount)) {
        worldCount = 0;
    }
    if (multiWorld > worldCount) {
        throw new Error(`World index (${multiWorld}) is higher than the maximum world count (${worldCount})`);
    }
    if (worldCount > 1) {
        return multiWorld;
    }
}

function getWorldData(data, world) {
    if (world != null) {
        return data["World " + world];
    }
    return data;
}

class SpoilerParser {

    async parse(spoiler, settings) {
        const mainData = {};
        const startitems = {};
        const extraData = {};
        const options = {};
        const areahint = {};
        const trans = OptionsTransResource.get();

        const version = getVersionType(spoiler[":version"]);
        if (version == null) {
            throw new Error("Not a valid OOTR Spoiler log found");
        }
        if (version == "unknown") {
            await BusyIndicator.unbusy();
            const cont = await Dialog.confirm("Unknown Spoiler log version", "The file you loaded might not be a valid OOTR Spoiler log.<br>This could break the Tracker.<br>Do you want to continue loading the file?");
            await BusyIndicator.busy();
            if (!cont) {
                return;
            }
        }
        
        const world = getWorldNumber(settings["parse.multiworld"], spoiler["settings"]?.["world_count"]);

        const debugSpoiler = SettingsStorage.get("debug_spoiler")
            
        if (debugSpoiler || settings["parse.settings"]) {
            parseSettings(errorDialogHandler, options, spoiler["settings"], trans);
        }
        if (debugSpoiler || settings["parse.starting_items"]) {
            parseStartingInventory(errorDialogHandler, startitems, spoiler["settings"], trans);
        }
        if (debugSpoiler || settings["parse.random_settings"]) {
            parseSettings(errorDialogHandler, options, getWorldData(spoiler["randomized_settings"], world), trans);
        }
        if (debugSpoiler || settings["parse.item_association"]) {
            parseItemLocations(errorDialogHandler, extraData, getWorldData(spoiler["locations"], world), world, debugSpoiler || settings["parse.ignore_world_locking"], trans);
        }
        if (debugSpoiler || settings["parse.woth_hints"]) {
            parseWoth(errorDialogHandler, areahint, getWorldData(spoiler[":woth_locations"], world), trans);
        }
        if (debugSpoiler || settings["parse.barren"]) {
            parseBarren(errorDialogHandler, areahint, getWorldData(spoiler[":barren_regions"], world), trans);
        }
        if (debugSpoiler || settings["parse.shops"]) {
            parseShops(errorDialogHandler, extraData, getWorldData(spoiler["locations"], world), trans, spoiler.settings["shopsanity"]);
        }
        // if(debugSpoiler || settings["parse.gossip_stones"]) parseStones(spoilerErrorAlert, extraData, getWorldData(spoiler["gossip_stones"], world), trans);
        if (debugSpoiler || settings["parse.trials"]) {
            parseTrials(errorDialogHandler, options, getWorldData(spoiler["trials"], world), trans);
        }
        if (debugSpoiler || settings["parse.dungeonReward"]) {
            parseDungeonRewards(errorDialogHandler, extraData, getWorldData(spoiler["locations"], world), trans);
        }
        if (debugSpoiler || settings["parse.dungeons"]) {
            parseDungeonTypes(errorDialogHandler, extraData, getWorldData(spoiler["dungeons"], world), trans);
        }
        if (debugSpoiler || settings["parse.disabled_locations"]) {
            parseDisabledLocations(errorDialogHandler, mainData, spoiler["settings"]?.["disabled_locations"], trans);
        }

        parseEntrances(errorDialogHandler, extraData, getWorldData(spoiler["entrances"], world), trans, {
            dungeon: debugSpoiler || settings["parse.entro_dungeons"],
            grottos: debugSpoiler || settings["parse.entro_grottos"],
            indoors: debugSpoiler || settings["parse.entro_indoors"],
            overworld: debugSpoiler || settings["parse.entro_overworld"],
            owls: debugSpoiler || settings["parse.entro_owls"],
            spawns: debugSpoiler || settings["parse.entro_spawns"],
            warps: debugSpoiler || settings["parse.entro_warps"]
        });
        
        if (version == "prod") {
            // nothing
        }

        if (version == "dev") {
            // nothing
        }
        
        errorDialogHandler.send();

        return {
            data: {
                ...DEFAULT_DATA,
                ...extraData,
                "": mainData,
                "area_hint": areahint
            },
            options,
            startitems
        };
    }

}

export default new SpoilerParser();
