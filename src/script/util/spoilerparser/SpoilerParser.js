// frameworks
import Helper from "/emcJS/util/helper/Helper.js";
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import BusyIndicator from "/emcJS/ui/BusyIndicator.js";

// GameTrackerJS
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

function addError(error) {
    console.warn(error);
    errorDialogHandler.add(error);
}

function getVersionType(version) {
    if (typeof version != "string") {
        throw Error("The file you loaded is not a valid OOTR Spoiler Log.");
    }
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
        const result = Helper.deepClone(DEFAULT_DATA);
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

        const world = getWorldNumber(settings["multiworld"], spoiler["settings"]?.["world_count"]);

        const debugSpoiler = SettingsStorage.get("debug_spoiler")
        if (debugSpoiler || settings["settings"]) {
            // options
            parseSettings(addError, result, spoiler["settings"], trans);
        }
        if (debugSpoiler || settings["starting_items"]) {
            // startItems
            parseStartingInventory(addError, result, spoiler["settings"], trans);
        }
        if (debugSpoiler || settings["random_settings"]) {
            // options
            parseSettings(addError, result, getWorldData(spoiler["randomized_settings"], world), trans);
        }
        if (debugSpoiler || settings["item_association"]) {
            // locationItems
            parseItemLocations(addError, result, getWorldData(spoiler["locations"], world), world, debugSpoiler || settings["ignore_world_locking"], trans);
        }
        if (debugSpoiler || settings["woth_hints"]) {
            // areaHints
            parseWoth(addError, result, getWorldData(spoiler[":woth_locations"], world), trans);
        }
        if (debugSpoiler || settings["barren"]) {
            // areaHints
            parseBarren(addError, result, getWorldData(spoiler[":barren_regions"], world), trans);
        }
        if (debugSpoiler || settings["shops"]) {
            // shopItems, shopItemsPrice, shopItemsBought, shopItemsName
            parseShops(addError, result, getWorldData(spoiler["locations"], world), trans, spoiler.settings["shopsanity"]);
        }
        if (debugSpoiler || settings["gossip_stones"]) {
            // gossipstoneLocations, gossipstoneItems
            // parseStones(addError, result, getWorldData(spoiler["gossip_stones"], world), trans);
        }
        if (debugSpoiler || settings["trials"]) {
            // options
            parseTrials(addError, result, getWorldData(spoiler["trials"], world), trans);
        }
        if (debugSpoiler || settings["dungeonReward"]) {
            // dungeonRewards
            parseDungeonRewards(addError, result, getWorldData(spoiler["locations"], world), trans);
        }
        if (debugSpoiler || settings["dungeons"]) {
            // dungeonTypes
            parseDungeonTypes(addError, result, getWorldData(spoiler["dungeons"], world), trans);
        }
        if (debugSpoiler || settings["disabled_locations"]) {
            // locations
            parseDisabledLocations(addError, result, spoiler["settings"]?.["disabled_locations"], trans);
        }

        // exitBindings
        parseEntrances(addError, result, getWorldData(spoiler["entrances"], world), trans, {
            dungeon: debugSpoiler || settings["entro_dungeons"],
            bossarea: debugSpoiler || settings["entro_bosses"],
            grottos: debugSpoiler || settings["entro_grottos"],
            indoors: debugSpoiler || settings["entro_indoors"],
            overworld: debugSpoiler || settings["entro_overworld"],
            owls: debugSpoiler || settings["entro_owls"],
            spawns: debugSpoiler || settings["entro_spawns"],
            warps: debugSpoiler || settings["entro_warps"]
        });

        if (versionType == "prod") {
            // nothing
        }

        if (versionType == "dev") {
            // nothing
        }

        errorDialogHandler.send();

        return {
            ...DEFAULT_DATA,
            ...result
        };
    }

}

export default new SpoilerParser();
