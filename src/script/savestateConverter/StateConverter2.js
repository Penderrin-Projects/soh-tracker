/**
 * move to serverside earliest past 2021‑05‑16
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";

const URL = import.meta.url;
const VER_REGEX = /([0-9]+)\.js$/;

// LOAD PREVIOUS CONVERTER
const FORMER_CONVERTER_URL = URL.replace(VER_REGEX, (_, ver) => `${parseInt(ver) - 1}.js`);
await import(FORMER_CONVERTER_URL);

// REGISTER CONVERTER
SavestateConverter.register(function(state) {
    state = state ?? {};
    const res = {
        data: {},
        autosave: state.autosave ?? false,
        timestamp: state.timestamp ?? new Date(),
        name: state.name ?? ""
    };
    for (const i of Object.keys(state.data ?? {})) {
        switch (i) {
            case "skips.wt_bosskey_noitem":
                res.data["skip.wt_bosskey_noitem"] = state.data[i];
                break;
            case "option.doors_open_zora":
                res.data[i] = state.data[i] ? "doors_open_zora_both" : "doors_open_zora_closed";
                break;
            case "shop.kokiri":
            case "shop.goron":
            case "shop.zora":
            case "shop.bombchu":
            case "shop.basar_child":
            case "shop.magic_child":
            case "shop.basar_adult":
            case "shop.magic_adult":
                res.data[i] = state.data[i].map(convertShopItem);
                break;
            default:
                res.data[i] = state.data[i];
                break;
        }
    }
    return res;
});

function convertShopItem(item) {
    if (!item.item.startsWith("item.")) {
        item.item = `item.${item.item}`;
    }
    return item;
}
