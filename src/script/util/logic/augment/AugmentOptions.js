import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
import MetaObserver from "/GameTrackerJS/util/observer/MetaObserver.js";

const archipelagoActiveObserver = new MetaObserver("archipelago");

// ref: World.py -> self.keysanity = settings.shuffle_smallkeys in ...
const KEYSANITY = ["keylogic_keysanity", "keylogic_remove", "keylogic_any_dungeon", "keylogic_overworld", "keylogic_regional"];
// ref (AP): Init.py -> self.keysanity = settings.shuffle_smallkeys in ...
const KEYSANITY_AP = ["keylogic_keysanity", "keylogic_remove", "keylogic_any_dungeon", "keylogic_overworld"];

function augment(cache) {
    // small keys
    if (cache.hasChange("option[small_key_logic]")) {
        const keyLogic = cache.get("option[small_key_logic]");
        if (archipelagoActiveObserver.value && KEYSANITY_AP.includes(keyLogic)
            || !archipelagoActiveObserver.value && KEYSANITY.includes(keyLogic)) {
            cache.setAugmented("option[small_key_logic]", "keylogic_keysanity");
        } else {
            cache.deleteAugmented("option[small_key_logic]");
        }
    }
    // open forest
    if (
        cache.hasChange("option[doors_open_forest]") ||
        cache.hasChange("option[entrance_shuffle_interior]") ||
        cache.hasChange("option[shuffle_warps]") ||
        cache.hasChange("option[shuffle_spawns]") ||
        cache.hasChange("option[shuffle_overworld]")
    ) {
        const openForest = cache.get("option[doors_open_forest]");
        if (openForest == "doors_open_forest_closed") {
            const shuffleSpecialInterior = cache.get("option[entrance_shuffle_interior]") == "entrance_shuffle_all";
            const shuffleWarps = cache.get("option[shuffle_warps]");
            const shuffleSpawns = cache.get("option[shuffle_spawns]");
            const shuffleOverworld = cache.get("option[shuffle_overworld]");
            if (shuffleSpecialInterior || shuffleOverworld || shuffleWarps || shuffleSpawns) {
                cache.setAugmented("option[doors_open_forest]", "doors_open_forest_deku");
            } else {
                cache.deleteAugmented("option[doors_open_forest]");
            }
        }
    }
}

LogicCaller.registerAugment(augment);
