/* asym-import: off */
import IDBStorage from "/emcJS/storage/IDBStorage.js";
/* asym-import: on */

// GameTrackerJS
import WorldResource from "/GameTrackerJS/resource/WorldResource.js";
import OptionsResource from "/GameTrackerJS/resource/OptionsResource.js";

let DataStorage = new IDBStorage("world");

const LOGIC_OPERATORS = [
    // literals
    "jse-logic-false",
    "jse-logic-true",
    // operators
    "jse-logic-not",
    "jse-logic-and",
    "jse-logic-nand",
    "jse-logic-or",
    "jse-logic-nor",
    "jse-logic-xor",
    "jse-logic-xnor",
    "jse-logic-min",
    "jse-logic-max",
    // comparators
    "jse-logic-eq",
    "jse-logic-gt",
    "jse-logic-gte",
    "jse-logic-lt",
    "jse-logic-lte",
    "jse-logic-neq",
    // math
    "jse-logic-add",
    "jse-logic-sub",
    "jse-logic-mul",
    "jse-logic-div",
    "jse-logic-mod",
    "jse-logic-pow"
];

class WorldListsCreator {

    async createLists() {

        const world = WorldResource.get();
        const custom_data = await DataStorage.getAll();

        const result = {
            marker: {
                "area": createMarkerList("area", world, custom_data),
                "subarea": createMarkerList("subarea", world, custom_data),
                "exit": createMarkerList("exit", world, custom_data),
                "subexit": createMarkerList("subexit", world, custom_data),
                "location": createMarkerList("location", world, custom_data)
            },
            areas: [],
            exits: []
        };

        return result;
    }

    async createOperators() {
        const result = [];
        const randomizer_options = OptionsResource.get();
        result.push(createDefaultOperatorCategory());
        result.push(createSettingsOperatorCategory(randomizer_options.options, "option"));
        return result;
    }

}

export default new WorldListsCreator();

// MARKERS
// -------------------

function createMarkerList(category, world, custom_data) {
    const result = [];
    const names = new Set();
    for (const name in world.marker[category]) {
        names.add(name);
    }
    for (const name in custom_data) {
        if (name.startsWith(`marker/${category}/`)) {
            names.add(name.slice(12));
        }
    }
    for (const name of names) {
        result.push({
            "ref": name,
            "content": name
        });
    }
    return result;
}

// OPERATORS
// -------------------
function createDefaultOperatorCategory() {
    const res = {
        "type": "group",
        "caption": "default",
        "children": []
    };
    for (const i in LOGIC_OPERATORS) {
        res.children.push({
            "type": LOGIC_OPERATORS[i]
        });
    }
    return res;
}

function createSettingsOperatorCategory(data, ref) {
    const res = {
        "type": "group",
        "caption": ref,
        "children": []
    };
    for (const i in data) {
        const opt = data[i];
        if (!!opt.type && opt.type.startsWith("-")) continue;
        if (opt.type === "choice") {
            for (const j of opt.values) {
                res.children.push({
                    "type": "tracker-logic-custom",
                    "ref": i,
                    "value": j,
                    "category": ref
                });
            }
        } else {
            if (opt.type === "list") {
                for (const j of opt.values) {
                    res.children.push({
                        "type": "tracker-logic-custom",
                        "ref": j,
                        "category": ref
                    });
                }
            } else {
                res.children.push({
                    "type": "tracker-logic-custom",
                    "ref": i,
                    "category": ref
                });
            }
        }
    }
    return res;
}
