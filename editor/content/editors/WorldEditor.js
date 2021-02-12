/* asym-import: off */
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import FileSystem from "/emcJS/util/FileSystem.js";
import Helper from "/emcJS/util/Helper.js";
import "/editors/modules/world/Editor.js";
/* asym-import: on */

// GameTrackerJS
import WorldResource from "/GameTrackerJS/resource/WorldResource.js";
import FilterResource from "/GameTrackerJS/resource/FilterResource.js";
// Track-OOT
import WorldListsCreator from "../world/WorldListsCreator.js";

const AREA_TYPES = [
    "area",
    "dungeon"
];
const SUBAREA_TYPES = [
    "interior",
    "grotto"
];
const LOCATION_TYPES = [
    "chest",
    "skulltula",
    "scrub",
    "gossipstone",
    "cow",
    "bean"
];
const EXCLUDE_FILTER = [
    "filter.era_apply"
];
const LOCATION_ONLY_FILTER = [
    "filter.chests",
    "filter.skulltulas",
    "filter.gossipstones"
];

async function createMarkerDetailConfig(category, types, accessValues = [""]) {
    const filter = FilterResource.get();
    const res = {
        "type": {
            "title": "Type",
            "type": "choice",
            "values": types
        },
        "access": {
            "title": "Logic reference",
            "type": "select",
            "values": accessValues
        },
        "visible": {
            "title": "Visibility logic",
            "type": "logic",
            "operators": await WorldListsCreator.createOperators()
        }
    };
    for (let name in filter) {
        if (EXCLUDE_FILTER.indexOf(name) >= 0) {
            continue;
        }
        if (category != "location" && LOCATION_ONLY_FILTER.indexOf(name) >= 0) {
            continue;
        }
        res[`filter/${name}`] = {
            "title": `Filter [${name}]`,
            "type": "list",
            "values": filter[name].values
        };
    }
    return res;
}

export default async function() {
    const WorldStorage = new IDBStorage("world");
    const worldEditor = document.createElement("jse-world-editor");
    // marker
    worldEditor.addMarkerCategory("area", await createMarkerDetailConfig("area", AREA_TYPES));
    worldEditor.addMarkerCategory("subarea", await createMarkerDetailConfig("subarea", SUBAREA_TYPES));
    worldEditor.addMarkerCategory("exit", await createMarkerDetailConfig("exit", AREA_TYPES));
    worldEditor.addMarkerCategory("subexit", await createMarkerDetailConfig("subexit", SUBAREA_TYPES));
    worldEditor.addMarkerCategory("location", await createMarkerDetailConfig("location", LOCATION_TYPES));
    // refresh
    async function refreshWorldEditor() {
        // TODO
        let lists = await WorldListsCreator.createLists();
        worldEditor.loadList(lists);
        worldEditor.setData(WorldResource.get());
    }
    await refreshWorldEditor();
    // events
    worldEditor.addEventListener("save", async event => {
        await WorldStorage.set(event.key, event.logic);
    });
    worldEditor.addEventListener("clear", async event => {
        await WorldStorage.delete(event.key);
    });
    // navigation
    const NAV = [{
        "content": "FILE",
        "submenu": [{
            "content": "SAVE WORLD",
            "handler": async () => {
                const patch = await WorldStorage.getAll();
                const world = Helper.elevate(patch, "/", WorldResource.get());
                FileSystem.save(JSON.stringify(world, " ", 4), "world.json");
            }
        },{
            "content": "LOAD PATCH",
            "handler": async () => {
                const res = await FileSystem.load(".json");
                if (!!res && !!res.data) {
                    const data = res.data;
                    const world = Helper.flatten(data, "/");
                    // load logic
                    await WorldStorage.setAll(world);
                    // refresh
                    await refreshWorldEditor();
                    //worldEditor.reset();
                }
            }
        },{
            "content": "SAVE PATCH",
            "handler": async () => {
                const patch = await WorldStorage.getAll();
                const world = Helper.elevate(patch, "/");
                FileSystem.save(JSON.stringify(world, " ", 4), `world.${(new Date).valueOf()}.json`);
            }
        },{
            "content": "REMOVE PATCH",
            "handler": async () => {
                await WorldStorage.clear();
                await refreshWorldEditor();
                //worldEditor.reset();
            }
        },{
            "content": "EXIT EDITOR",
            "handler": () => {
                worldEditor.reset();
                const event = new Event('close');
                worldEditor.dispatchEvent(event);
            }
        }]
    }];

    return {
        name: "World",
        panel: worldEditor,
        navigation: NAV,
        refreshFn: refreshWorldEditor
    }
};
