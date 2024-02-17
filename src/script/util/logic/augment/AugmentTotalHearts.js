import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
import "./AugmentOptions.js";

export function augment(cache) {
    // augment total hearts
    if (cache.hasChange("item[heart_piece]") || cache.hasChange("item[heart_container]") || cache.hasChange("option[starting_hearts]")) {
        const starting = cache.get("option[starting_hearts]");
        const heartPieces = cache.get("item[heart_piece]");
        const heartContainers = cache.get("item[heart_container]");
        cache.setAugmented("calculated[hearts_total]", starting + heartContainers + Math.floor(heartPieces / 4));
    }
}

LogicCaller.registerAugment(augment);
