import OptionsTransResource from "../../resource/OptionsTransResource.js";

const trans = OptionsTransResource.get();

const itemList = trans["itemList"] ?? {};
const locations = trans["locations"] ?? {};

export function translateItem(itemName) {
    return itemList[itemName];
}

export function translateLocation(locationName) {
    return locations[locationName];
}
