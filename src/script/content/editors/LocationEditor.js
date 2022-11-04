// frameworks
import IDBStorage from "/emcJS/data/storage/IDBStorage.js";
import FileSystem from "/emcJS/util/file/FileSystem.js";
import "/editors/modules/properties/Editor.js";

// GameTrackerJS
import WorldResource from "/GameTrackerJS/data/resource/WorldResource.js";
import FilterResource from "/GameTrackerJS/data/resource/FilterResource.js";
// Track-OOT
import LogicResource from "/script/resource/LogicResource.js";
import LocationListsCreator from "../locations/LocationListsCreator.js";

export default async function(editorChoice) {
    const DataStorage = new IDBStorage("locations");
    const locationEditor = document.createElement("ted-properties-editor");

    const filter = FilterResource.get();
    const logic = LogicResource.get("edges");

    const locations = new Set();

    for (const region in logic) {
        for (const ch in logic[region]) {
            if (ch.startsWith("reach_location[")) {
                locations.add(ch);
            }
        }
    }

    const detailConfig = {
        "category": {
            "title": "Category",
            "type": "choice",
            "values": ["", "entrance", "area", "location"]
        },
        "type": {
            "title": "Type",
            "type": "choice",
            "values": ["", "area", "chest", "skulltula", "scrub", "gossipstone", "cow", "bean"]
        },
        "access": {
            "title": "Logic reference",
            "type": "select",
            "values": Array.from(locations)
        },
        "visible": {
            "title": "Visibility logic",
            "type": "logic",
            "operators": await LocationListsCreator.createOperators()
        }
    };

    for (const name in filter) {
        detailConfig[`filter/${name}`] = {
            "title": `Filter [${name}]`,
            "type": "list",
            "values": filter[name].values
        };
    }

    locationEditor.setDetailConfig(detailConfig);

    // refresh
    async function refreshLocationEditor() {
        const lists = await LocationListsCreator.createLists();
        locationEditor.loadList(lists);
        const intData = {};
        const data = WorldResource.get();
        for (const name in data) {
            intData[name] = {};
            for (const key in data[name]) {
                if (key != "filter") {
                    intData[name][key] = data[name][key];
                }
            }
            for (const key in filter) {
                if (data[name].filter[key] == null) {
                    intData[name][`filter/${key}`] = filter[key].values;
                } else {
                    const vals = data[name].filter[key];
                    intData[name][`filter/${key}`] = filter[key].values.filter((i) => vals[i] == null || !!vals[i]);
                }
            }
        }
        locationEditor.setData(intData);
        const patch = await DataStorage.getAll();
        locationEditor.setPatch(patch);
    }

    await refreshLocationEditor();
    // register
    locationEditor.addEventListener("save", async (event) => {
        await DataStorage.set(event.key, event.data);
    });
    locationEditor.addEventListener("clear", async (event) => {
        await DataStorage.delete(event.key);
    });
    const NAV = [{
        "content": "FILE",
        "submenu": [{
            "content": "SAVE DATA",
            "handler": async () => {
                const data = WorldResource.get();
                const patch = await DataStorage.getAll();
                for (const name in patch) {
                    if (data[name] == null) {
                        data[name] = {
                            "category": "",
                            "type": "",
                            "access": "",
                            "visible": null,
                            "filter": {}
                        };
                    }
                    for (const key in patch[name]) {
                        if (key.startsWith("filter/")) {
                            const fKey = key.slice(7);
                            data[name].filter[fKey] = {};
                            for (const i of filter[fKey].values) {
                                data[name].filter[fKey][i] = patch[name][key].indexOf(i) >= 0;
                            }
                        } else {
                            data[name][key] = patch[name][key];
                        }
                    }
                }
                FileSystem.save(JSON.stringify(data, " ", 4), "world.json");
            }
        }, {
            "content": "LOAD PATCH",
            "handler": async () => {
                const res = await FileSystem.load(".json");
                if (!!res && !!res.data) {
                    const data = res.data;
                    const intData = {};
                    for (const name in data) {
                        intData[name] = {};
                        for (const key in data[name]) {
                            if (key != "filter") {
                                intData[name][key] = data[name][key];
                            }
                        }
                        for (const key in filter) {
                            if (data[name].filter[key] == null) {
                                intData[name][`filter/${key}`] = filter[key].values;
                            } else {
                                const vals = data[name].filter[key];
                                intData[name][`filter/${key}`] = filter[key].values.filter((i) => vals[i] == null || !!vals[i]);
                            }
                        }
                    }
                    await DataStorage.setAll(intData);
                    // refresh
                    await refreshLocationEditor();
                    //logicEditor.reset();
                }
            }
        }, {
            "content": "SAVE PATCH",
            "handler": async () => {
                const data = {};
                const patch = await DataStorage.getAll();
                for (const name in patch) {
                    if (data[name] == null) {
                        data[name] = {
                            "category": "",
                            "type": "",
                            "access": "",
                            "visible": null,
                            "filter": {}
                        };
                    }
                    for (const key in patch[name]) {
                        if (key.startsWith("filter/")) {
                            const fKey = key.slice(7);
                            data[name].filter[fKey] = {};
                            for (const i of filter[fKey].values) {
                                data[name].filter[fKey][i] = patch[name][key].indexOf(i) >= 0;
                            }
                        } else {
                            data[name][key] = patch[name][key];
                        }
                    }
                }
                FileSystem.save(JSON.stringify(data, " ", 4), `world.${(new Date).valueOf()}.json`);
            }
        }, {
            "content": "REMOVE PATCH",
            "handler": async () => {
                await DataStorage.clear();
                await refreshLocationEditor();
                //logicEditor.reset();
            }
        }, {
            "content": "EXIT EDITOR",
            "handler": () => {
                locationEditor.reset();
                editorChoice.closeCurrent();
            }
        }]
    }];
    // register
    editorChoice.register(locationEditor, "Locations", NAV, refreshLocationEditor);
}
