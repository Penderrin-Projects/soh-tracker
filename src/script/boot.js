
import EventBus from "/emcJS/event/EventBus.js";
import FileData from "/emcJS/data/FileData.js";
import Language from "/GameTrackerJS/util/Language.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import OptionsStorage from "/GameTrackerJS/storage/OptionsStorage.js";

const FILES = {
    "world":                {path: "/database/world.json",              type: "json"},
    "logic":                {path: "/database/logic.json",              type: "json"},
    "logic_glitched":       {path: "/database/logic_glitched.json",     type: "json"},
    "options_trans":        {path: "/database/options_trans.json",      type: "jsonc"},
    "items":                {path: "/database/items.json",              type: "jsonc"},
    "grids":                {path: "/database/grids.json",              type: "jsonc"},
    "dungeonstate":         {path: "/database/dungeonstate.json",       type: "jsonc"},
    "layouts":              {path: "/database/layouts.json",            type: "jsonc"},
    "songs":                {path: "/database/songs.json",              type: "jsonc"},
    "settings":             {path: "/database/settings.json",           type: "jsonc"},
    "rulesets":             {path: "/database/rulesets.json",           type: "jsonc"},
    "options":              {path: "/database/options.json",            type: "jsonc"},
    "spoiler_options":      {path: "/database/spoiler_options.json",    type: "jsonc"},
    "filter":               {path: "/database/filter.json",             type: "jsonc"},
    "shops":                {path: "/database/shops.json",              type: "jsonc"},
    "shop_items":           {path: "/database/shop_items.json",         type: "jsonc"}
};

function loadingMessage(msg) {
    console.log(msg);
}

export async function loadResources(updateLoadingMessage = loadingMessage) {
    updateLoadingMessage("load data...");
    await FileData.load(FILES);
    await SettingsStorage.init();
    await OptionsStorage.init();

    updateLoadingMessage("learn languages...");
    await Language.load(SettingsStorage.get("language"));
    
    updateLoadingMessage("initialize states...");
    const [
        StateInit
    ] = await $import.module([ // eslint-disable-line no-undef
        "/script/state/StateInit.js"
    ]);
    StateInit.init();
}

export async function registerWorker() {
    if ("SharedWorker" in window) {
        const EventBusModuleShare = (await import("/emcJS/event/module/EventBusModuleShare.js")).default;
        EventBus.addModule(EventBusModuleShare, {blacklist:["logic"]});
    }
}
