// frameworks
import {
    deepClone
} from "/emcJS/util/helper/DeepClone.js";

// GameTrackerJS
import {
    getRegion
} from "/GameTrackerJS/data/resource/WorldResource.js";
import Logic from "/GameTrackerJS/util/logic/Logic.js";
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import SettingsObserver from "/GameTrackerJS/util/observer/SettingsObserver.js";
// Track-OOT
import LogicResource from "/script/resource/LogicResource.js";
import LogicGlitchedResource from "/script/resource/LogicGlitchedResource.js";
import LogicStorage from "../../content/logic/storages/LogicStorage.js";
import LogicGlitchedStorage from "../../content/logic/storages/LogicGlitchedStorage.js";

const logicRuleTypeObserver = new OptionsObserver("logic_rules");
const useCustomLogicObserver = new SettingsObserver("use_custom_logic");

function getLogicData() {
    switch (logicRuleTypeObserver.value) {
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
    switch (logicRuleTypeObserver.value) {
        case "logic_rules_glitched": {
            return LogicGlitchedStorage.getAll() ?? {edges:{}, logic:{}};
        }
        case "logic_rules_glitchless":
        default: {
            return LogicStorage.getAll() ?? {edges:{}, logic:{}};
        }
    }
}

function augmentLogic(logic) {
    const res = deepClone(logic);
    const customLogic = getCustomLogicData();
    for (const l in customLogic) {
        const value = customLogic[l];
        if (l.indexOf(" -> ") >= 0) {
            const [key, target] = l.split(" -> ");
            res.edges[key] = res.edges[key] ?? {};
            res.edges[key][target] = value;
        } else {
            res.logic[l] = value;
        }
    }
    return res;
}

function update() {
    const logic = getLogicData();
    if (useCustomLogicObserver.value) {
        const customLogic = augmentLogic(logic);
        Logic.setLogic(customLogic, getRegion());
    } else {
        Logic.setLogic(logic, getRegion());
    }
}

// register event for (de-)activate entrances
logicRuleTypeObserver.addEventListener("change", () => {
    update();
});
// register event for (de-)activate custom logic
useCustomLogicObserver.addEventListener("change", () => {
    update();
});
// register event for changing custom logic
LogicStorage.addEventListener("change", () => {
    if (useCustomLogicObserver.value && logicRuleTypeObserver.value == "logic_rules_glitchless") {
        update();
    }
});
LogicGlitchedStorage.addEventListener("change", () => {
    if (useCustomLogicObserver.value && logicRuleTypeObserver.value == "logic_rules_glitched") {
        update();
    }
});

update();
