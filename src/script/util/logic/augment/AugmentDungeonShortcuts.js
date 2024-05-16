import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
import "./AugmentOptions.js";

const SHORTCUTS = Object.entries({
    "dungeon_shortcuts.deku": "deku_boss_gateway -> boss_deku_gateway",
    "dungeon_shortcuts.dodongo": "dodongo_boss_gateway -> boss_dodongo_gateway",
    "dungeon_shortcuts.jabu": "jabu_boss_gateway -> boss_jabu_gateway",
    "dungeon_shortcuts.temple_forest": "forest_temple_boss_gateway -> boss_forest_temple_gateway",
    "dungeon_shortcuts.temple_fire": "fire_temple_boss_gateway -> boss_fire_temple_gateway",
    "dungeon_shortcuts.temple_water": "water_temple_boss_gateway -> boss_water_temple_gateway",
    "dungeon_shortcuts.temple_shadow": "shadow_temple_boss_gateway -> boss_shadow_temple_gateway",
    "dungeon_shortcuts.temple_spirit": "spirit_temple_boss_gateway -> boss_spirit_temple_gateway"
});

const TARGET_GATEWAY = "boss_dodongo_gateway -> dodongo_boss_gateway";

export function augment(cache) {
    // augment king dodongo boss room shortcut
    const [shortcut] = SHORTCUTS.find((el) => cache.get(`exitBindings[${el[1]}]`) === TARGET_GATEWAY) ?? [];
    if (shortcut != null && cache.get(`option[${shortcut}]`)) {
        cache.setAugmented("calculated[king_dodongo_shortcuts]", 1);
    } else {
        cache.deleteAugmented("calculated[king_dodongo_shortcuts]");
    }
}

LogicCaller.registerAugment(augment);
