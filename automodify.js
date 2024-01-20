import fs from "fs";

/* files */

const inFileName = "./src/database/world.json";
const outFileName = "./src/database/world.json";

/* modificator */

function modify(source = {}, target = {}) {
    // location
    console.log("locations");
    const locations = {};
    for (const ref in source.locations) {
        // console.log(ref);
        const oldProps = source.locations[ref];
        const newProps = {
            type: oldProps.type ?? "",
            logicAccess: oldProps.logicAccess ?? "",
            visible: oldProps.visible ?? true,
            visibleRootOnly: oldProps.visibleRootOnly ?? false,
            filter: oldProps.filter ?? {},
            icon: oldProps.icon ?? "",
            tags: oldProps.tags ?? []
        };
        locations[ref] = newProps;
    }
    console.log("-----------------------");

    // collections
    console.log("collections");
    const collections = {};
    for (const ref in source.collections) {
        // console.log(ref);
        const oldProps = source.collections[ref];
        const newProps = {
            map: convertMapConfig(oldProps.map),
            list: convertEntryList(oldProps.list)
        };
        collections[ref] = newProps;
    }
    console.log("-----------------------");

    // area
    console.log("areas");
    const areas = {};
    for (const ref in source.areas) {
        // console.log(ref);
        const oldProps = source.areas[ref];
        const newProps = {
            type: oldProps.type ?? "",
            category: oldProps.category ?? "",
            visible: oldProps.visible ?? true,
            visibleIfEmpty: oldProps.visibleIfEmpty ?? !(oldProps.type === "interior" || oldProps.type === "grotto"),
            visibleRootOnly: oldProps.visibleRootOnly ?? false,
            filter: oldProps.filter ?? {},
            listContents: !!(oldProps.listContents ?? false),
            accessPenetration: oldProps.accessPenetration ?? false,
            icon: oldProps.icon ?? "",
            map: convertMapConfig(oldProps.map),
            connections: oldProps.connections ?? [],
            lists: oldProps.lists != null ? convertEntryLists(oldProps.lists) : {
                v: convertEntryList(oldProps.list),
                mq: convertEntryList(oldProps.list_mq)
            },
            areaContentHints: oldProps.areaContentHints || {},
            tags: oldProps.tags ?? []
        };
        areas[ref] = newProps;
    }
    console.log("-----------------------");

    // exit
    console.log("exits");
    const exits = {};
    for (const ref in source.exits) {
        // console.log(ref);
        const oldProps = source.exits[ref];
        const newProps = {
            type: oldProps.type ?? "",
            target: convertRelation(oldProps.target, "Exit"),
            logicAccess: oldProps.logicAccess ?? "",
            area: convertRelation(oldProps.area, "Area"),
            visible: oldProps.visible ?? true,
            visibleRootOnly: oldProps.visibleRootOnly ?? false,
            filter: oldProps.filter ?? {},
            icon: oldProps.icon ?? "",
            bindsTo: oldProps.bindsTo ?? [],
            unbindable: oldProps.unbindable ?? false,
            ignoreBound: oldProps.ignoreBound ?? false,
            entranceActive: oldProps.entranceActive ?? true,
            includeInactiveEntrances: oldProps.includeInactiveEntrances ?? false,
            isBiDir: oldProps.isBiDir ?? false,
            ignoreMixedEntrances: oldProps.ignoreMixedEntrances ?? false,
            tags: oldProps.tags ?? []
        };
        exits[ref] = newProps;
    }
    console.log("-----------------------");

    // write all
    target.config = source.config;
    target.locations = locations;
    target.collections = collections;
    target.areas = areas;
    target.exits = exits;
}

function convertMapConfig(oldConfig) {
    return {
        active: oldConfig.active ?? false,
        backgroundColor: oldConfig.backgroundColor ?? getColor(oldConfig.color),
        backgroundImage: oldConfig.backgroundImage ?? oldConfig.background ?? "",
        width: oldConfig.width ?? 0,
        height: oldConfig.height ?? 0,
        zoom: oldConfig.zoom == null || oldConfig.zoom === 0 ? 100 : oldConfig.zoom
    };
}

function getColor(color) {
    if (color == null || color === "" || color === "black") {
        return "#000000";
    }
    return color;
}

function convertEntryLists(lists) {
    const res = {};
    for (const key in lists) {
        res[key] = convertEntryList(lists[key]);
    }
    return res;
}

function convertEntryList(oldList) {
    if (oldList == null) {
        return;
    }
    return oldList.map((entry) => {
        return {
            ref: entry.ref ?? {
                type: entry.entity?.type ?? upperCaseFirstLetter(entry.category),
                name: entry.entity?.name ?? entry.id
            },
            pos: {
                x: entry.pos?.x ?? 0,
                y: entry.pos?.y ?? 0,
                scale: entry.pos?.scale ?? 100
            },
            visible: entry.visible ?? true,
            listHidden: entry.listHidden ?? false
        };
    });
}

function convertRelation(relation, type) {
    if (relation.type === type) {
        return relation;
    }
    return {
        type: type,
        name: relation.name ?? relation
    }
}

function upperCaseFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/* module */

const inData = JSON.parse(fs.readFileSync(inFileName));
const outData = {};
modify(inData, outData);
fs.writeFileSync(outFileName, JSON.stringify(outData, null, 4));
