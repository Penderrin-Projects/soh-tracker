import fs from "fs";

/* files */

const inFileName = "./src/database/world.json";
const outFileName = "./src/database/world.json";

/* modificator */

function modify(source = {}, target = {}) {
    // location
    console.log("location");
    const location = {};
    for (const ref in source.location) {
        console.log(ref);
        const oldProps = source.location[ref];
        const newProps = {
            type: oldProps.type,
            logicAccess: oldProps.logicAccess,
            visible: oldProps.visible,
            visibleRootOnly: oldProps.visibleRootOnly,
            filter: oldProps.filter,
            icon: oldProps.icon,
            shop: oldProps.shop,
            tags: oldProps.tags
        };
        location[ref] = newProps;
    }
    console.log("-----------------------");

    // collection
    console.log("collection");
    const collection = {};
    for (const ref in source.collection) {
        console.log(ref);
        const oldProps = source.collection[ref];
        const newProps = {
            map: oldProps.map,
            list: oldProps.list
        };
        collection[ref] = newProps;
    }
    console.log("-----------------------");

    // area
    console.log("area");
    const area = {};
    for (const ref in source.area) {
        console.log(ref);
        const oldProps = source.area[ref];
        const newProps = {
            type: oldProps.type,
            category: oldProps.category,
            visible: oldProps.visible,
            visibleRootOnly: oldProps.visibleRootOnly,
            filter: oldProps.filter,
            listContents: oldProps.listContents,
            accessPenetration: oldProps.accessPenetration,
            icon: oldProps.icon,
            map: oldProps.map,
            connections: oldProps.connections,
            list: oldProps.list,
            list_mq: oldProps.list_mq,
            areaTags: oldProps.areaTags,
            tags: oldProps.tags
        };
        area[ref] = newProps;
    }
    console.log("-----------------------");

    // exit
    console.log("exit");
    const exit = {};
    for (const ref in source.exit) {
        console.log(ref);
        const oldProps = source.exit[ref];
        const newProps = {
            type: oldProps.type,
            target: oldProps.target,
            logicAccess: oldProps.logicAccess,
            area: oldProps.area,
            visible: oldProps.visible,
            visibleRootOnly: oldProps.visibleRootOnly,
            filter: oldProps.filter,
            icon: oldProps.icon,
            bindsTo: oldProps.bindsTo,
            unbindable: oldProps.unbindable,
            ignoreBound: oldProps.ignoreBound,
            entranceActive: oldProps.entranceActive,
            includeInactiveEntrances: oldProps.includeInactiveEntrances,
            isBiDir: oldProps.isBiDir,
            ignoreMixedEntrances: oldProps.ignoreMixedEntrances,
            tags: oldProps.tags
        };
        exit[ref] = newProps;
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
