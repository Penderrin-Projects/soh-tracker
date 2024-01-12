import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
import "./AugmentOptions.js";

export function augment(cache) {
    // augment zoras letter
    if (cache.hasChange("item[zora_letter]") || cache.hasChange("option[doors_open_zora]")) {
        if (cache.get("option[doors_open_zora]") == "doors_open_zora_both") {
            cache.setAugmented("item[zora_letter]", 1);
        }
    }
}

LogicCaller.registerAugment(augment);
