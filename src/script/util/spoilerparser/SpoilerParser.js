// frameworks
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import BusyIndicator from "/emcJS/ui/BusyIndicator.js";

// GameTrackerJS
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

const DEFAULT_DATA = {
    items: {},
    locations: {},
    exitBindings: {},
    areaHints: {},
    locationItems: {},
    startItems: {},
    options: {},
    filter: {},
    // Track-OOT
    dungeonRewards: {},
    dungeonTypes: {},
    shopItems: {},
    shopItemsPrice: {},
    shopItemsBought: {},
    shopItemsName: {},
    songNotes: {},
    gossipstoneLocations: {},
    gossipstoneItems: {},
    parseSpoiler: {}
};

function getVersionType(version) {
    if (typeof version != "string") {
        throw Error("The file you loaded is not a valid OOTR Spoiler Log.");
    }
    if (version.split(" ")[1] === "Release") return "prod";
    if (version.split(" ")[1] === "f.LUM") return "dev";
    if (version != null) return "unknown";
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

    async parse(spoiler, settings) {
        const mainData = {};
        const startitems = {};
        const extraData = {};
        const options = {};
        const areahint = {};
        const trans = OptionsTransResource.get();

        const version = spoiler[":version"];
        const versionType = getVersionType(version);
        if (versionType == null) {
            throw new Error("Not a valid OOTR Spoiler log found");
        }
        if (versionType == "unknown") {
            await BusyIndicator.unbusy();
            const cont = await Dialog.confirm("Unknown Spoiler log version", "The file you loaded might not be a valid OOTR Spoiler log.<br>This could break the Tracker.<br>Do you want to continue loading the file?");
            await BusyIndicator.busy();
            if (!cont) {
                return;
            }
        }
        
        const world = getWorldNumber(settings["parse.multiworld"], spoiler["settings"]?.["world_count"]);

        if (settings["parse.settings"]) parseSettings(options, spoiler["settings"], trans);
        if (settings["parse.starting_items"]) parseStartingInventory(startitems, spoiler["settings"], trans);
        if (settings["parse.random_settings"]) parseSettings(options, getWorldData(spoiler["randomized_settings"], world), trans);
        if (settings["parse.item_association"]) parseItemLocations(extraData, getWorldData(spoiler["locations"], world), world, settings["parse.ignore_world_locking"], trans);
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

        if (versionType == "prod") {
            // nothing
        }

        if (versionType == "dev") {
            // nothing
        }

        return {
            ...DEFAULT_DATA,
            ...extraData,
            "": mainData,
            "areaHint": areahint,
            options,
            startitems
        };
    }

}

export default new SpoilerParser();
