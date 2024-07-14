import OptionsTransResource from "../../resource/OptionsTransResource.js";

const trans = OptionsTransResource.get();

export function translateItem(itemName) {
    const itemList = trans["itemList"] ?? {};
    return itemList[itemName];
}

export function translateLocation(locationName) {
    const locations = trans["locations"] ?? {};
    return locations[locationName];
}
