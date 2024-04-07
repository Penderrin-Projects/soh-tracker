import fs from "fs";

const transFileName = "./src/database/options_trans.json";
const transData = JSON.parse(fs.readFileSync(transFileName));

const apFileName = "./test/archipelago_ids.json";
const apData = JSON.parse(fs.readFileSync(apFileName));

const outFileName = "./test/ap_translated.json";
const outData = {
    items: {},
    locations: {},
    missing_items: [],
    missing_locations: []
};

const {item_name_to_id, location_name_to_id} = apData["Ocarina of Time"];

for (const itemName in item_name_to_id) {
    if (itemName in transData.itemList && !!transData.itemList[itemName]) {
        outData.items[itemName] = transData.itemList[itemName];
    } else {
        outData.missing_items.push(itemName);
    }
}

for (const locationName in location_name_to_id) {
    if (locationName in transData.locations && !!transData.locations[locationName]) {
        outData.locations[locationName] = transData.locations[locationName];
    } else {
        outData.missing_locations.push(locationName);
    }
}

fs.writeFileSync(outFileName, JSON.stringify(outData, null, 4));
