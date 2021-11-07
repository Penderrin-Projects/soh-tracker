// GameTrackerJS
import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";

export function augment(cache, data) {
    const res = {};
    // augment zoras letter
    if (data["item[zora_letter]"] != null || data["option.doors_open_zora"] != null) {
        if ((data["option.doors_open_zora"] ?? cache.get("option.doors_open_zora")) == "doors_open_zora_both") {
            res["item[zora_letter]"] = 1;
        } else {
            res["item[zora_letter]"] = data["item[zora_letter]"] ?? cache.get("item[zora_letter]")
        }
    }
    return res;
}

LogicCaller.registerAugment(augment);
