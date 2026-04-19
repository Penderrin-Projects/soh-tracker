/**
 * SoH save file parser
 * 
 * Reads a Ship of Harkinian file1.sav and returns a normalized state object.
 * The file is JSON (with CRLF line endings, UTF-8).
 * 
 * This runs in the Electron main process (Node.js), not the renderer.
 */

'use strict';

const fs = require('node:fs').promises;

/**
 * Equipment bitfield (u16). Each nibble is a category.
 * Layout from SoH's `EquipInv*` enums in z64item.h.
 *
 * Nibble 0 (bits 0-3)  = swords
 * Nibble 1 (bits 4-7)  = shields
 * Nibble 2 (bits 8-11) = tunics
 * Nibble 3 (bits 12-15) = boots
 */
const EQUIP_FLAGS = {
  // Swords
  KOKIRI_SWORD:   0x0001,  // bit 0 EQUIP_INV_SWORD_KOKIRI
  MASTER_SWORD:   0x0002,  // bit 1 EQUIP_INV_SWORD_MASTER
  BIGGORON_SWORD: 0x0004,  // bit 2 EQUIP_INV_SWORD_BIGGORON (post-trade, intact)
  GIANT_KNIFE:    0x0008,  // bit 3 EQUIP_INV_SWORD_BROKENGIANTKNIFE (broken form)
  // Shields
  KOKIRI_SHIELD:  0x0010,  // bit 4 (a.k.a. Deku shield)
  HYLIAN_SHIELD:  0x0020,  // bit 5
  MIRROR_SHIELD:  0x0040,  // bit 6
  // Tunics
  KOKIRI_TUNIC:   0x0100,  // bit 8
  GORON_TUNIC:    0x0200,  // bit 9
  ZORA_TUNIC:     0x0400,  // bit 10
  // Boots
  KOKIRI_BOOTS:   0x1000,  // bit 12
  IRON_BOOTS:     0x2000,  // bit 13
  HOVER_BOOTS:    0x4000,  // bit 14
};

/**
 * Upgrades bitfield — 3 bits each, packed in this exact order.
 * Authoritative layout comes from OoT's `gUpgradeMasks`/`gUpgradeShifts`
 * arrays (see the CUR_UPG_VALUE macro in soh/include/macros.h), indexed
 * by the UpgradeType enum (UPG_QUIVER=0, UPG_BOMB_BAG=1, UPG_STRENGTH=2,
 * UPG_SCALE=3, UPG_WALLET=4, UPG_BULLET_BAG=5, UPG_DEKU_STICKS=6,
 * UPG_DEKU_NUTS=7). OCARINA is not stored here (it's in questItems).
 */
const UPGRADE_FLAGS = {
  BOW:         0x00000007, // bits 0-2   (UPG_QUIVER)
  BOMB_BAG:    0x00000038, // bits 3-5
  STRENGTH:    0x000001C0, // bits 6-8
  SCALE:       0x00000E00, // bits 9-11
  WALLET:      0x00007000, // bits 12-14
  SLINGSHOT:   0x00038000, // bits 15-17 (UPG_BULLET_BAG)
  STICK_UPG:   0x001C0000, // bits 18-20
  NUT_UPG:     0x00E00000, // bits 21-23
};

/**
 * Quest items bitfield (u32). Layout from SoH's `QuestItem` enum (z64item.h):
 *
 *  bits 0-5   : medallions (forest, fire, water, spirit, shadow, light)
 *  bits 6-11  : WARP songs (minuet, bolero, serenade, requiem, nocturne, prelude)
 *  bits 12-17 : OCARINA songs (lullaby, epona, saria, sun, time, storms)
 *  bits 18-20 : stones (kokiri emerald, goron ruby, zora sapphire)
 *  bit 21     : stone of agony
 *  bit 22     : gerudo card
 *  bit 23     : skull token (flag only; real count is inventory.gsTokens)
 *  bit 24     : heart piece (tally flag)
 */
const QUEST_FLAGS = {
  // Medallions
  MEDALLION_FOREST:  1 << 0,
  MEDALLION_FIRE:    1 << 1,
  MEDALLION_WATER:   1 << 2,
  MEDALLION_SPIRIT:  1 << 3,
  MEDALLION_SHADOW:  1 << 4,
  MEDALLION_LIGHT:   1 << 5,
  // Warp songs (bits 6-11)
  SONG_MINUET:       1 << 6,
  SONG_BOLERO:       1 << 7,
  SONG_SERENADE:     1 << 8,
  SONG_REQUIEM:      1 << 9,
  SONG_NOCTURNE:     1 << 10,
  SONG_PRELUDE:      1 << 11,
  // Ocarina songs (bits 12-17)
  SONG_LULLABY:      1 << 12,
  SONG_EPONA:        1 << 13,
  SONG_SARIA:        1 << 14,
  SONG_SUN:          1 << 15,
  SONG_TIME:         1 << 16,
  SONG_STORMS:       1 << 17,
  // Spiritual stones
  STONE_KOKIRI:      1 << 18,
  STONE_GORON:       1 << 19,
  STONE_ZORA:        1 << 20,
  // Misc
  STONE_OF_AGONY:    1 << 21,
  GERUDO_CARD:       1 << 22,
};

/**
 * B-button item slot IDs (ITEM_ constants in SoH)
 * SoH uses 255 (0xFF) to mean "empty slot"
 */
const ITEM_NONE = 255;
const ITEM_STICK = 0;
const ITEM_NUT = 1;
const ITEM_BOMB = 2;
const ITEM_BOW = 3;
const ITEM_ARROW_FIRE = 4;
const ITEM_DINS_FIRE = 5;
const ITEM_SLINGSHOT = 6;
const ITEM_OCARINA_FAIRY = 7;
const ITEM_OCARINA_OOT = 8;
const ITEM_BOMBCHU = 9;
const ITEM_HOOKSHOT = 10;
const ITEM_LONGSHOT = 11;
const ITEM_ARROW_ICE = 12;
const ITEM_FARORES_WIND = 13;
const ITEM_BOOMERANG = 14;
const ITEM_LENS = 15;
const ITEM_BEAN = 16;
const ITEM_HAMMER = 17;
const ITEM_ARROW_LIGHT = 18;
const ITEM_NAYRUS_LOVE = 19;

// Bottles
const ITEM_BOTTLE = 20;
const ITEM_BOTTLE_POTION_RED = 21;
const ITEM_BOTTLE_POTION_GREEN = 22;
const ITEM_BOTTLE_POTION_BLUE = 23;
const ITEM_BOTTLE_FAIRY = 24;
const ITEM_BOTTLE_FISH = 25;
const ITEM_BOTTLE_MILK_FULL = 26;
const ITEM_BOTTLE_LETTER = 27;
const ITEM_BOTTLE_FIRE = 28;
const ITEM_BOTTLE_BUG = 29;
const ITEM_BOTTLE_POE_BIG = 30;
const ITEM_BOTTLE_MILK_HALF = 31;
const ITEM_BOTTLE_POE = 32;

// Trade / quest items
const ITEM_WEIRD_EGG = 33;
const ITEM_CHICKEN = 34;
const ITEM_LETTER_ZELDA = 35;
const ITEM_MASK_KEATON = 36;
const ITEM_MASK_SKULL = 37;
const ITEM_MASK_SPOOKY = 38;
const ITEM_MASK_BUNNY = 39;
const ITEM_MASK_GORON = 40;
const ITEM_MASK_ZORA = 41;
const ITEM_MASK_GERUDO = 42;
const ITEM_MASK_TRUTH = 43;
const ITEM_SOLD_OUT = 44;
const ITEM_POCKET_EGG = 45;
const ITEM_POCKET_CUCCO = 46;
const ITEM_COJIRO = 47;
const ITEM_ODD_MUSHROOM = 48;
const ITEM_ODD_POTION = 49;
const ITEM_SAW = 50;
const ITEM_SWORD_BROKEN = 51;
const ITEM_PRESCRIPTION = 52;
const ITEM_FROG = 53;
const ITEM_EYEDROPS = 54;
const ITEM_CLAIM_CHECK = 55;

/**
 * Dungeon indices for dungeonItems[] and dungeonKeys[] arrays
 * Matches SoH's SCENE_* enum order for main dungeons
 */
const DUNGEON_INDEX = {
  DEKU_TREE:      0,
  DODONGOS_CAVERN: 1,
  JABU_JABU:      2,
  FOREST_TEMPLE:  3,
  FIRE_TEMPLE:    4,
  WATER_TEMPLE:   5,
  SPIRIT_TEMPLE:  6,
  SHADOW_TEMPLE:  7,
  BOTTOM_OF_WELL: 8,
  ICE_CAVERN:     9,
  GANONS_TOWER:   10,
  GTG:            11,
  GANONS_CASTLE:  13,  // note: 12 is ganons_tower_collapse
  // 14+ are treasure box minigame, etc.
};

// dungeonItems[i] is a bitmask: 1=boss_key, 2=compass, 4=map
const DITEM_BOSS_KEY = 0x01;
const DITEM_COMPASS  = 0x02;
const DITEM_MAP      = 0x04;

/**
 * Parse a SoH save file from disk.
 * 
 * @param {string} savPath - Absolute path to file1.sav
 * @returns {Promise<object>} Normalized state object
 */
async function parseSaveFile(savPath) {
  const text = await fs.readFile(savPath, 'utf8');
  const sav = JSON.parse(text);
  return parseState(sav);
}

/**
 * Parse an already-loaded save JSON object.
 */
function parseState(sav) {
  if (!sav || !sav.sections) {
    throw new Error('Save file has no sections — not a valid SoH save');
  }

  const base = sav.sections.base?.data || {};
  const rando = sav.sections.randomizer?.data || {};
  const tracker = sav.sections.trackerData?.data || {};

  const inv = base.inventory || {};

  return {
    meta: {
      version: sav.version,
      fileType: sav.fileType,
      playerName: base.playerName,
      isMasterQuest: !!base.isMasterQuest,
    },
    // Current player location
    currentScene: base.savedSceneNum ?? null,
    linkAge: base.linkAge ?? null,

    // Raw inventory fields (for downstream item mapping)
    inventory: {
      items:         inv.items || [],
      ammo:          inv.ammo || [],
      equipment:     inv.equipment || 0,
      upgrades:      inv.upgrades || 0,
      questItems:    inv.questItems || 0,
      dungeonItems:  inv.dungeonItems || [],
      dungeonKeys:   inv.dungeonKeys || [],
      gsTokens:      inv.gsTokens || 0,
    },

    // Randomizer seed settings (where we detect MQ dungeons, entrance shuffle)
    rando: {
      masterQuestDungeons: rando.masterQuestDungeons || [],
      requiredTrials:      rando.requiredTrials || [],
      entrances:           rando.entrances || [],
      settings:            rando.randoSettings || {},
      seed:                rando.finalSeed ?? rando.seed,
      // Seed placements: array indexed by RC ID, each entry { rgID: number }
      // Used by the Item Spoiler Lookup window.
      itemLocations:       rando.itemLocations || [],
    },

    // Check statuses - this is the main input for "what has the player collected"
    // An array of { randomizerCheck, skipped, status }
    // status === 5 means Checked (collected)
    checkStatus: tracker.checkStatus || [],
    areasSpoiled: tracker.areasSpoiled || [],
  };
}

/**
 * Given a parsed state, return the set of SoH RC IDs that are collected.
 */
function collectedChecks(state) {
  const out = new Set();
  for (const entry of state.checkStatus) {
    if (entry.status === 5) {
      out.add(entry.randomizerCheck);
    }
  }
  return out;
}

/**
 * Given a parsed state, return the set of SoH RC IDs that have been seen (not necessarily collected).
 * Useful for "grayed out but visible" UI states.
 */
function seenChecks(state) {
  const out = new Set();
  for (const entry of state.checkStatus) {
    // 2=Seen, 3=Hinted both imply the player knows about it
    if (entry.status === 2 || entry.status === 3) {
      out.add(entry.randomizerCheck);
    }
  }
  return out;
}

module.exports = {
  parseSaveFile,
  parseState,
  collectedChecks,
  seenChecks,
  EQUIP_FLAGS,
  UPGRADE_FLAGS,
  QUEST_FLAGS,
  DUNGEON_INDEX,
  DITEM_BOSS_KEY,
  DITEM_COMPASS,
  DITEM_MAP,
  // Item IDs for downstream inventory translation
  ITEM_NONE,
  ITEM_STICK, ITEM_NUT, ITEM_BOMB, ITEM_BOW,
  ITEM_ARROW_FIRE, ITEM_ARROW_ICE, ITEM_ARROW_LIGHT,
  ITEM_DINS_FIRE, ITEM_FARORES_WIND, ITEM_NAYRUS_LOVE,
  ITEM_SLINGSHOT, ITEM_OCARINA_FAIRY, ITEM_OCARINA_OOT,
  ITEM_BOMBCHU, ITEM_HOOKSHOT, ITEM_LONGSHOT,
  ITEM_BOOMERANG, ITEM_LENS, ITEM_BEAN, ITEM_HAMMER,
  ITEM_BOTTLE, ITEM_WEIRD_EGG, ITEM_CHICKEN, ITEM_LETTER_ZELDA,
  ITEM_MASK_KEATON, ITEM_MASK_SKULL, ITEM_MASK_SPOOKY,
  ITEM_MASK_BUNNY, ITEM_MASK_GORON, ITEM_MASK_ZORA,
  ITEM_MASK_GERUDO, ITEM_MASK_TRUTH,
  ITEM_POCKET_EGG, ITEM_POCKET_CUCCO, ITEM_COJIRO,
  ITEM_ODD_MUSHROOM, ITEM_ODD_POTION, ITEM_SAW,
  ITEM_SWORD_BROKEN, ITEM_PRESCRIPTION, ITEM_FROG,
  ITEM_EYEDROPS, ITEM_CLAIM_CHECK,
};
