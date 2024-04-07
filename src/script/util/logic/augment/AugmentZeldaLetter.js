import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
import "./AugmentOptions.js";

export function augment(cache) {
    // augment zeldas letter
    if (cache.hasChange("item[zeldas_letter]") || cache.hasChange("option[skip_child_zelda]")) {
        if (cache.get("option[skip_child_zelda]")) {
            cache.setAugmented("item[zeldas_letter]", 1);
        } else {
            cache.deleteAugmented("item[zeldas_letter]");
        }
    }
}

LogicCaller.registerAugment(augment);
