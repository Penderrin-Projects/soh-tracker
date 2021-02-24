/* asym-import: off */
import IDBStorage from "/emcJS/storage/IDBStorage.js";
/* asym-import: on */

// GameTrackerJS
import WorldResource from "/GameTrackerJS/resource/WorldResource.js";
import OptionsResource from "/GameTrackerJS/resource/OptionsResource.js";

let DataStorage = new IDBStorage("locations");

const LOGIC_OPERATORS = [
    "ted-logic-false",
    "ted-logic-true",
    "ted-logic-not",
    "ted-logic-and",
    "ted-logic-nand",
    "ted-logic-or",
    "ted-logic-nor",
    "ted-logic-xor",
    "ted-logic-xnor",
    "ted-logic-min",
    "ted-logic-max"
];
const CUSTOM_OPERATOR_GROUP = [
    "location"
];

class LocationListsCreator {

    async createLists() {

        let result = [];

        let world = WorldResource.get();
        let custom_data = await DataStorage.getAll();

        let names = new Set();
        for (let name in world) {
            names.add(name);
        }
        for (let name in custom_data) {
            names.add(name);
        }

        for (let name of names) {
            result.push({
                "ref": name,
                "content": name
            });
        }

        return result;
    }

    async createOperators() {

        let result = [];

        let randomizer_options = OptionsResource.get();

        result.push(createDefaultOperatorCategory());
        result.operators.push(createOptionsOperatorCategory(randomizer_options));
        result.operators.push(createSettingsOperatorCategory(tracker_settings));

        return result;
    }

}

export default new LocationListsCreator();

// OPERATORS
// -------------------
function createDefaultOperatorCategory() {
    let res = {
        "type": "group",
        "caption": "default",
        "children": []
    };
    for (let i in LOGIC_OPERATORS) {
        res.children.push({
            "type": LOGIC_OPERATORS[i]
        });
    }
    return res;
}

function createOptionsOperatorCategory(data) {
    const res = {};
    for (const i in data) {
        const opt = data[i];
        if (res[opt.category] == null) {
            res[opt.category] = {
                "type": "group",
                "caption": opt.category,
                "children": []
            };
        }
        if (!!opt.type && opt.type.startsWith("-")) continue;
        if (opt.type === "choice") {
            if (Array.isArray(opt.values)) {
                for (const j of opt.values) {
                    res[opt.category].children.push({
                        "type": "tracker-logic-custom",
                        "ref": i,
                        "value": j,
                        "category": opt.category
                    });
                }
            }
        } else if (opt.type === "list") {
            if (Array.isArray(opt.values)) {
                for (const j of opt.values) {
                    res[opt.category].children.push({
                        "type": "tracker-logic-custom",
                        "ref": j,
                        "category": opt.category
                    });
                }
            }
        } else {
            res[opt.category].children.push({
                "type": "tracker-logic-custom",
                "ref": i,
                "category": opt.category
            });
        }
    }
    return {
        "type": "group",
        "caption": "options",
        "children": Object.values(res)
    };
}

function createSettingsOperatorCategory(data) {
    const res = {
        "type": "group",
        "caption": "settings",
        "children": []
    };
    for (const i in data) {
        const opt = data[i];
        if (!!opt.type && opt.type.startsWith("-")) continue;
        if (opt.type === "choice") {
            if (Array.isArray(opt.values)) {
                for (const j of opt.values) {
                    res.children.push({
                        "type": "tracker-logic-custom",
                        "ref": i,
                        "value": j,
                        "category": "settings"
                    });
                }
            }
        } else if (opt.type === "list") {
            if (Array.isArray(opt.values)) {
                for (const j of opt.values) {
                    res.children.push({
                        "type": "tracker-logic-custom",
                        "ref": j,
                        "category": "settings"
                    });
                }
            }
        } else {
            res.children.push({
                "type": "tracker-logic-custom",
                "ref": i,
                "category": "settings"
            });
        }
    }
    return res;
}
