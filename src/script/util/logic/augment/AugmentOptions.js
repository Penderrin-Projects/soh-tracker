import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";

// ref: World.py -> self.keysanity = settings.shuffle_smallkeys in ...
const KEYSANITY = ["keylogic_keysanity", "keylogic_remove", "keylogic_any_dungeon", "keylogic_overworld"]

function augment(cache) {
    // small keys
    if (cache.hasChange("option[small_key_logic]")) {
        const keyLogic = cache.get("option[small_key_logic]");
        if (KEYSANITY.includes(keyLogic)) {
            cache.set("option[small_key_logic]", "keylogic_keysanity");
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
                cache.set("option[doors_open_forest]", "doors_open_forest_deku");
            }
        }
    }
}

LogicCaller.registerAugment(augment);
