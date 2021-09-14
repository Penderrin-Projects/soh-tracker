const fs = require("fs");

/* files */

const inFileName = "./_old/world.json";
const outFileName = "./src/database/world.json";

/* modificator */

const exitBindings = new Map();

function getAreaName(name) {
    if (name.startsWith("subarea/")) {
        return name.slice(8);
    }
    if (name.startsWith("area/")) {
        return name.slice(5);
    }
    return name;
}

function createExitData(props = {}, data = {}, type = "", ref = "", reverseRef = "", isBiDir = false, visibleRootOnly = false, bindsTo = []) {
    const access = ref.split(" -> ")[0];
    return {
        "type": type,
        "target": reverseRef,
        "logicAccess": access,
        "area": getAreaName(data.area ?? ""),
        "categories": props.categories ?? [],
        "visible": props.visible ?? true,
        "visibleRootOnly": visibleRootOnly,
        "filter": props.filter ?? {},
        "icon": props.icon ?? "",
        "bindsTo": bindsTo,
        "ignoreBound": data.ignoreBound ?? false,
        "active": data.active ?? true,
        "includeInactiveEntrances": data.includeInactiveEntrances ?? false,
        "isBiDir": isBiDir
    };
}

function addExit(target = {}, props = {}, data = {}, ref = "", reverseRef = "") {
    const isBiDir = data.isBiDir ?? true;
    const type = data.type;
    if (type == "overworld") {
        target[ref] = createExitData(props, data, "overworld", ref, reverseRef, isBiDir, false, [
            "overworld"
        ]);
    } else if (data.type == "special") {
        target[ref] = createExitData(props, data, "special", ref, reverseRef, isBiDir, false, [
            "special",
            "overworld",
            "interior_outer",
            "interior_inner",
            "grotto_outer",
            "grotto_inner"
        ]);
    } else if (data.type == "dungeon") {
        target[ref] = createExitData(props, data, "dungeon_outer", ref, reverseRef, isBiDir, false, [
            "dungeon_inner"
        ]);
        target[reverseRef] = createExitData(props, data, "dungeon_inner", reverseRef, ref, isBiDir, true, [
            "dungeon_outer"
        ]);
    } else if (data.type == "interior") {
        target[ref] = createExitData(props, data, "interior_outer", ref, reverseRef, isBiDir, false, [
            "interior_inner"
        ]);
        target[reverseRef] = createExitData(props, data, "interior_inner", reverseRef, ref, isBiDir, true, [
            "interior_outer"
        ]);
    } else if (data.type == "grotto") {
        target[ref] = createExitData(props, data, "grotto_outer", ref, reverseRef, isBiDir, false, [
            "grotto_inner"
        ]);
        target[reverseRef] = createExitData(props, data, "grotto_inner", reverseRef, ref, isBiDir, true, [
            "grotto_outer"
        ]);
    }
}

function correctListEntries(entry = {}) {
    if (entry.category == "subarea") {
        entry.category = "area";
    } else if (entry.category == "subexit") {
        entry.category = "exit";
    }
    if (entry.category == "exit") {
        entry.id = exitBindings.get(entry.id) ?? entry.id
    }
    return entry;
}

function addArea(target = {}, props = {}, data = {}, ref = "", listContents = false, accessPenetration = false) {
    const newProps = {
        "type": props.type,
        "categories": props.categories ?? [],
        "visible": props.visible ?? true,
        "filter": props.filter ?? false,
        "listContents": !!listContents,
        "accessPenetration": !!accessPenetration,
        "icon": props.icon ?? "",
        "areaTags": false,
        "map": {
            "color": data.color ?? "",
            "border": data.border ?? "",
            "background": data.background ?? "",
            "width": data.width ?? 0,
            "height": data.height ?? 0
        },
        "list": (data.lists?.v ?? data.list ?? []).map(correctListEntries)
    };
    if (data.lists?.mq != null) {
        newProps["list_mq"] = data.lists.mq.map(correctListEntries);
    }
    target[ref] = newProps;
}

function addOverworld(target = {}, data = {}, ref = "") {
    const newProps = {
        "type": "overworld",
        "map": {
            "color": data.color ?? "",
            "border": data.border ?? "",
            "background": data.background ?? "",
            "width": data.width ?? 0,
            "height": data.height ?? 0
        },
        "list": (data.lists?.v ?? data.list ?? []).map(correctListEntries)
    };
    target[ref] = newProps;
}

function modify(source = {}, target = {}) {

    // location
    console.log("location");
    const location = {};
    for (const ref in source.marker.location) {
        console.log(ref);
        const props = source.marker.location[ref];
        location[ref] = {
            "type": props.type,
            "logicAccess": props.access,
            "visible": props.visible ?? true,
            "filter": props.filter ?? {},
            "icon": props.icon ?? ""
        };
        if (props.type == "shopslot") {
            location[ref]["shop"] = ref;
        }
    }
    console.log("-----------------------");

    // exit
    console.log("exit");
    const exit = {};
    for (const ref in source.marker.exit) {
        console.log(ref);
        const props = source.marker.exit[ref];
        const exitRef = props.access;
        exitBindings.set(ref, exitRef);
        const data = source.exit[exitRef];
        const reverseRef = data.target ?? exitRef.split(" -> ").reverse().join(" -> ");
        addExit(exit, props, data, exitRef, reverseRef);
    }
    for (const ref in source.marker.subexit) {
        console.log(ref);
        const props = source.marker.subexit[ref];
        const exitRef = props.access;
        exitBindings.set(ref, exitRef);
        const data = source.exit[exitRef];
        const reverseRef = data.target ?? exitRef.split(" -> ").reverse().join(" -> ");
        addExit(exit, props, data, exitRef, reverseRef);
    }
    console.log("-----------------------");

    // area
    console.log("area");
    const area = {};
    console.log("overworld");
    addOverworld(area, source.overworld, "hyrule");
    for (const ref in source.marker.area) {
        console.log(ref);
        const props = source.marker.area[ref];
        const data = source.area[ref];
        addArea(area, props, data, ref, false, false);
    }
    for (const ref in source.marker.subarea) {
        console.log(ref);
        const props = source.marker.subarea[ref];
        const data = source.subarea[ref];
        addArea(area, props, data, ref, true, true);
    }
    console.log("-----------------------");
    
    // collection
    console.log("collection");
    const collection = {};
    for (const ref in source.collection) {
        console.log(ref);
        const props = source.collection[ref];
        collection[ref] = {
            "map": {
                "color": props.map.color ?? "",
                "border": props.map.border ?? "",
                "background": props.map.background ?? "",
                "width": props.map.width ?? 0,
                "height": props.map.height ?? 0
            },
            "list": (props.list ?? []).map(correctListEntries)
        };
    }
    console.log("-----------------------");

    // write all
    target.config = source.config;
    target.location = location;
    target.collection = collection;
    target.area = area;
    target.exit = exit;
}

/* module */

const inData = JSON.parse(fs.readFileSync(inFileName));
const outData = {};
modify(inData, outData);
fs.writeFileSync(outFileName, JSON.stringify(outData, null, 4));
