// frameworks
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import EventBus from "/emcJS/event/EventBus.js";
import Helper from "/emcJS/util/helper/Helper.js";

// GameTrackerJS
import OptionsStorage from "/GameTrackerJS/savestate/storage/OptionsStorage.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import Logic from "/GameTrackerJS/util/logic/Logic.js";
// Track-OOT
import LogicResource from "/script/resource/LogicResource.js";
import LogicGlitchedResource from "/script/resource/LogicGlitchedResource.js";

// TODO create storage files for these
const LogicsStorage = new IDBStorage("logics");
const LogicsStorageGlitched = new IDBStorage("logics_glitched");

let logic_rule_type = OptionsStorage.get("option.logic_rules");
let use_custom_logic = SettingsStorage.get("use_custom_logic");

function getLogicData() {
    switch(logic_rule_type) {
        case "logic_rules_glitched": {
            return LogicGlitchedResource.get() ?? {edges:{}, logic:{}};
        }
        case "logic_rules_glitchless":
        default: {
            return LogicResource.get() ?? {edges:{}, logic:{}};
        }
    }
}

function getCustomLogicData() {
    switch(logic_rule_type) {
        case "logic_rules_glitched": {
            return LogicsStorageGlitched.getAll() ?? {edges:{}, logic:{}};
        }
        case "logic_rules_glitchless":
        default: {
            return LogicsStorage.getAll() ?? {edges:{}, logic:{}};
        }
    }
}

function augmentLogic(logic) {
    const res = Helper.deepClone(logic);
    const customLogic = getCustomLogicData();
    for (const l in customLogic) {
        const value = customLogic[l];
        if (l.indexOf(" -> ") >= 0) {
            const [key, target] = l.split(" -> ");
            res.edges[key] = res.edges[key] ?? {};
            res.edges[key][target] = value;
        } else {
            res.logic[key] = value;
        }
    }
    return res;
}

async function update() {
    const logic = getLogicData();
    if (use_custom_logic) {
        const customLogic = augmentLogic(logic);
        Logic.setLogic(customLogic, "region.root");
    } else {
        Logic.setLogic(logic, "region.root");
    }
}

// register event for (de-)activate entrances
EventBus.register("options", event => {
    if (event.data["option.logic_rules"] != null && logic_rule_type != event.data["option.logic_rules"]) {
        logic_rule_type = event.data["option.logic_rules"];
        update();
    }
});
// register event for (de-)activate custom logic
EventBus.register("settings", async event => {
    if (event.data["use_custom_logic"] != null) {
        if (use_custom_logic != event.data.use_custom_logic) {
            use_custom_logic = event.data.use_custom_logic;
            update();
        }
    }
});
// register event for changing custom logic
EventBus.register("custom_logic_update", async event => {
    // TODO make logic editor fire this event on logic changed if you exit editor
    if (use_custom_logic) {
        update();
    }
});

await update();
