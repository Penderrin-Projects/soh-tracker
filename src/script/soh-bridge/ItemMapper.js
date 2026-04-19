/**
 * ItemMapper - translates SoH save inventory into Track-OOT item values.
 *
 * SoH save stores inventory as:
 *   - items[]  : 24-slot array of ITEM_ ids, 255 = empty
 *   - ammo[]   : raw counts (bombs, arrows, etc.)
 *   - equipment  : 16-bit bitfield (swords, shields, tunics, boots)
 *   - upgrades   : 32-bit bitfield (bomb_bag, bow, wallet, etc. - 3 bits each)
 *   - questItems : 30-bit bitfield (medallions, songs, stones, agony, gerudo card)
 *   - dungeonItems[] : per-dungeon bitmask (bit0=boss_key, bit1=compass, bit2=map)
 *   - dungeonKeys[]  : per-dungeon small-key count (-1 = N/A)
 *   - gsTokens       : total skulltula token count
 *
 * Track-OOT items are numeric 0..max. We translate each relevant SoH source
 * into the right Track-OOT item storage key.
 */

// -- Equipment bitfield -------------------------------------------------------
const EQUIPMENT = [
    { mask: 0x0001, key: "sword_kokiri",   value: 1 },
    { mask: 0x0002, key: "sword_master",   value: 1 },
    // Either GIANT_KNIFE (0x0004, pre-break) or BIGGORON_SWORD (0x0008) maps
    // to sword_biggoron=1
    { mask: 0x0004, key: "sword_biggoron", value: 1 },
    { mask: 0x0008, key: "sword_biggoron", value: 1 },
    { mask: 0x0010, key: "shield_kokiri",  value: 1 },
    { mask: 0x0020, key: "shield_hylia",   value: 1 },
    { mask: 0x0040, key: "shield_mirror",  value: 1 },
    { mask: 0x0200, key: "tunic_fire",     value: 1 },
    { mask: 0x0400, key: "tunic_water",    value: 1 },
    { mask: 0x2000, key: "boots_iron",     value: 1 },
    { mask: 0x4000, key: "boots_hover",    value: 1 },
];

// -- Upgrades bitfield - each field is 3 bits, value is the count.
// Authoritative layout is OoT's gUpgradeMasks/gUpgradeShifts (CUR_UPG_VALUE
// macro). Order in this array doesn't matter; mask/shift is what counts.
const UPGRADES = [
    { mask: 0x00000007, shift: 0,  key: "bow" },           // UPG_QUIVER     bits 0-2
    { mask: 0x00000038, shift: 3,  key: "bombs" },         // UPG_BOMB_BAG   bits 3-5
    { mask: 0x000001C0, shift: 6,  key: "glove" },         // UPG_STRENGTH   bits 6-8
    { mask: 0x00000E00, shift: 9,  key: "scale" },         // UPG_SCALE      bits 9-11
    { mask: 0x00007000, shift: 12, key: "wallet" },        // UPG_WALLET     bits 12-14
    { mask: 0x00038000, shift: 15, key: "slingshot" },     // UPG_BULLET_BAG bits 15-17
    { mask: 0x001C0000, shift: 18, key: "stick_upgrade" }, // UPG_STICKS     bits 18-20
    { mask: 0x00E00000, shift: 21, key: "nut_upgrade" },   // UPG_NUTS       bits 21-23
];

// -- Quest items bitfield -----------------------------------------------------
const QUEST = [
    { bit: 1 << 0,  key: "medallion_forest" },
    { bit: 1 << 1,  key: "medallion_fire" },
    { bit: 1 << 2,  key: "medallion_water" },
    { bit: 1 << 3,  key: "medallion_spirit" },
    { bit: 1 << 4,  key: "medallion_shadow" },
    { bit: 1 << 5,  key: "medallion_light" },
    { bit: 1 << 6,  key: "song_zelda" },
    { bit: 1 << 7,  key: "song_epona" },
    { bit: 1 << 8,  key: "song_saria" },
    { bit: 1 << 9,  key: "song_sun" },
    { bit: 1 << 10, key: "song_time" },
    { bit: 1 << 11, key: "song_storm" },
    { bit: 1 << 12, key: "warp_forest" },
    { bit: 1 << 13, key: "warp_fire" },
    { bit: 1 << 14, key: "warp_water" },
    { bit: 1 << 15, key: "warp_spirit" },
    { bit: 1 << 16, key: "warp_shadow" },
    { bit: 1 << 17, key: "warp_light" },
    { bit: 1 << 18, key: "stone_forest" },
    { bit: 1 << 19, key: "stone_fire" },
    { bit: 1 << 20, key: "stone_water" },
    { bit: 1 << 21, key: "stone_of_agony" },
    { bit: 1 << 22, key: "membership" },
];

// -- B-button slot (items[]) ID mapping ---------------------------------------
// Many of these overlap with equipment/quest; we still set them (idempotent).
// Bottles are tricky - they occupy slots 20-32 with different contents. We
// count occupied bottle slots and set `bottle` = count.
const SLOT_ITEM = {
    0:  { key: "stick_upgrade", value: 1 }, // stick presence
    1:  { key: "nut_upgrade",   value: 1 }, // nut presence
    2:  { key: "bombs",         value: 1 }, // bomb presence (count overridden by upgrades)
    3:  { key: "bow",           value: 1 },
    4:  { key: "arrow_fire",    value: 1 },
    5:  { key: "magic_din",     value: 1 },
    6:  { key: "slingshot",     value: 1 },
    7:  { key: "ocarina",       value: 1 },
    8:  { key: "ocarina",       value: 2 },
    9:  { key: "bombchu",       value: 1 },
    10: { key: "hookshot",      value: 1 },
    11: { key: "hookshot",      value: 2 },
    12: { key: "arrow_ice",     value: 1 },
    13: { key: "magic_farore",  value: 1 },
    14: { key: "boomerang",     value: 1 },
    15: { key: "lens",          value: 1 },
    16: { key: "bean",          value: 1 },
    17: { key: "hammer",        value: 1 },
    18: { key: "arrow_light",   value: 1 },
    19: { key: "magic_nayru",   value: 1 },

    // Bottle slots - each one contributes to bottle count; content itself
    // also maps to a Track-OOT item flag.
    20: { key: null, bottle: 1 },                               // empty
    21: { key: "potion_red",    value: 1, bottle: 1 },
    22: { key: "potion_green",  value: 1, bottle: 1 },
    23: { key: "potion_blue",   value: 1, bottle: 1 },
    24: { key: "fairy_spirit",  value: 1, bottle: 1 },
    25: { key: "fish",          value: 1, bottle: 1 },
    26: { key: "milk",          value: 1, bottle: 1 },
    27: { key: "zora_letter",   value: 1, bottle: 1 },
    28: { key: "blue_fire",     value: 1, bottle: 1 },
    29: { key: "bugs",          value: 1, bottle: 1 },
    30: { key: "poe_big",       value: 1, bottle: 1 },
    31: { key: "milk",          value: 1, bottle: 1 },
    32: { key: "poe",           value: 1, bottle: 1 },

    33: { key: "weird_egg",     value: 1 },
    34: { key: "chicken",       value: 1 },
    35: { key: "zeldas_letter", value: 1 },
    36: { key: "mask_keaton",   value: 1 },
    37: { key: "mask_skull",    value: 1 },
    38: { key: "mask_spooky",   value: 1 },
    39: { key: "mask_bunny",    value: 1 },
    40: { key: "mask_goron",    value: 1 },
    41: { key: "mask_zora",     value: 1 },
    42: { key: "mask_gerudo",   value: 1 },
    43: { key: "mask_truth",    value: 1 },
    44: { key: "sold_out",      value: 1 },
    45: { key: "pocket_egg",    value: 1 },
    46: { key: "pocket_cucco",  value: 1 },
    47: { key: "cojiro",        value: 1 },
    48: { key: "odd_mushroom",  value: 1 },
    49: { key: "odd_potion",    value: 1 },
    50: { key: "poachers_saw",  value: 1 },
    51: { key: "broken_sword",  value: 1 },
    52: { key: "prescription",  value: 1 },
    53: { key: "eyeball_frog",  value: 1 },
    54: { key: "eyedrops",      value: 1 },
    55: { key: "claim_check",   value: 1 },
};

// -- Dungeon items (map/compass/boss_key per dungeon) -------------------------
// index into dungeonItems[] -> {map, compass, boss_key} Track-OOT keys (null if n/a)
const DUNGEON_ITEM_KEYS = {
    0:  { map: "dungeon_map_deku",          compass: "compass_deku",          boss_key: null },
    1:  { map: "dungeon_map_dodongo",       compass: "compass_dodongo",       boss_key: null },
    2:  { map: "dungeon_map_jabujabu",      compass: "compass_jabujabu",      boss_key: null },
    3:  { map: "dungeon_map_temple_forest", compass: "compass_temple_forest", boss_key: "key_boss_forest" },
    4:  { map: "dungeon_map_temple_fire",   compass: "compass_temple_fire",   boss_key: "key_boss_fire" },
    5:  { map: "dungeon_map_temple_water",  compass: "compass_temple_water",  boss_key: "key_boss_water" },
    6:  { map: "dungeon_map_temple_spirit", compass: "compass_temple_spirit", boss_key: "key_boss_spirit" },
    7:  { map: "dungeon_map_temple_shadow", compass: "compass_temple_shadow", boss_key: "key_boss_shadow" },
    8:  { map: "dungeon_map_well",          compass: "compass_well",          boss_key: null },
    9:  { map: "dungeon_map_ice",           compass: "compass_ice",           boss_key: null },
    10: { map: null, compass: null, boss_key: "key_boss_ganon" },
    13: { map: null, compass: null, boss_key: null }, // ganons castle (main)
};

// Small key storage key per dungeon index
const SMALL_KEY_KEYS = {
    3:  "key_small_forest",
    4:  "key_small_fire",
    5:  "key_small_water",
    6:  "key_small_spirit",
    7:  "key_small_shadow",
    8:  "key_small_well",
    11: "key_small_gerudo",
    12: "key_small_training",
    13: "key_small_ganon",
    14: "key_small_treasure_game",
};

// -- Bitmasks within dungeonItems[i] -----------------------------------------
const DI_BOSS_KEY = 0x01;
const DI_COMPASS  = 0x02;
const DI_MAP      = 0x04;

// ============================================================================
// Public: build a complete items-storage update from a parsed SoH state
// ============================================================================

/**
 * @param {object} state - parsed SoH state (from save-parser.js)
 * @returns {Object<string, number>} suitable for Savestate.getStorage("items").setAll(...)
 */
export function buildItemsUpdate(state) {
    const out = {};
    const inv = state.inventory || {};

    // --- equipment flags
    const eq = inv.equipment || 0;
    for (const f of EQUIPMENT) {
        if (eq & f.mask) {
            // Only set if we'd increase the value (prevents biggoron/giant knife
            // stepping on each other)
            out[f.key] = Math.max(out[f.key] || 0, f.value);
        }
    }

    // --- upgrades (progressive counts)
    const up = inv.upgrades || 0;
    for (const f of UPGRADES) {
        const count = (up & f.mask) >> f.shift;
        if (count > 0) {
            out[f.key] = Math.max(out[f.key] || 0, count);
        }
    }

    // --- quest items bitfield
    const q = inv.questItems || 0;
    for (const f of QUEST) {
        if (q & f.bit) {
            out[f.key] = 1;
        }
    }

    // --- B-button slots
    // Bottles: count occupied bottle slots
    let bottleCount = 0;
    const items = inv.items || [];
    for (let slot = 0; slot < items.length; slot++) {
        const id = items[slot];
        if (id === 255 || id === undefined || id === null) continue;
        const spec = SLOT_ITEM[id];
        if (!spec) continue;
        if (spec.bottle) bottleCount++;
        if (spec.key) {
            out[spec.key] = Math.max(out[spec.key] || 0, spec.value || 1);
        }
    }
    if (bottleCount > 0) {
        out.bottle = Math.max(out.bottle || 0, bottleCount);
    }

    // --- ocarina derived from equipment slot if not already set via items[]
    // (in case the ocarina is equipped but not in a quickslot - SoH still
    // tracks possession via items[] so the above handles most cases)

    // --- dungeon items (map/compass/boss_key)
    const dItems = inv.dungeonItems || [];
    for (let idx = 0; idx < dItems.length; idx++) {
        const mask = dItems[idx];
        if (!mask) continue;
        const keys = DUNGEON_ITEM_KEYS[idx];
        if (!keys) continue;
        if ((mask & DI_MAP) && keys.map) out[keys.map] = 1;
        if ((mask & DI_COMPASS) && keys.compass) out[keys.compass] = 1;
        if ((mask & DI_BOSS_KEY) && keys.boss_key) out[keys.boss_key] = 1;
    }

    // --- small keys
    const dKeys = inv.dungeonKeys || [];
    for (let idx = 0; idx < dKeys.length; idx++) {
        const n = dKeys[idx];
        if (n == null || n < 0) continue;
        const k = SMALL_KEY_KEYS[idx];
        if (!k) continue;
        if (n > 0) out[k] = n;
    }

    // --- skulltula token count
    if ((inv.gsTokens || 0) > 0) {
        out.skulltula = inv.gsTokens;
    }

    return out;
}

/**
 * Debug helper: describe which mappings fired for a given state.
 */
export function describeItems(state) {
    const update = buildItemsUpdate(state);
    const lines = [];
    for (const [k, v] of Object.entries(update).sort()) {
        lines.push(`  ${k} = ${v}`);
    }
    return lines.join("\n");
}
