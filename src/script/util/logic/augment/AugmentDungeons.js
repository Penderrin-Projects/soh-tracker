// GameTrackerJS
import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
// Track-OOT
import DungeonstateResource from "/script/resource/DungeonstateResource.js";

// TODO change key options to have different values
// keysy, vanilla, own dungeon, overworld only, any dungeon, keysanity

const ACCEPTED_KEY_GROUPS = [
    "dungeon",
    "gerudo",
    "ganon"
];

const ACCEPTED_BOSSKEY_GROUPS = [
    "dungeon"
];

const KEY_VNL_AUGMENTS = {
    "v": {"temple_fire": 1},
    "mq": {"temple_spirit": 3}
};
const KEY_SAN_AUGMENTS = {};

function getDungeonType(type, hasmq) {
    if (hasmq) {
        if (type == "v" || type == "mq") {
            return type;
        }
        return "n";
    }
    return "v";
}

function augmentKeys(cache, ref, type, keys, group) {
    if (ACCEPTED_KEY_GROUPS.includes(group) && !cache.get("track_keys")) {
        return 9999;
    }
    const ks = cache.get("keysanity_small");
    const aug = !ks ? KEY_VNL_AUGMENTS : KEY_SAN_AUGMENTS;
    if (!type || type == "n") {
        const vAug = aug["v"]?.[ref] ?? 0;
        const mqAug = aug["mq"]?.[ref] ?? 0;
        return keys + Math.max(vAug, mqAug);
    }
    return keys + (aug[type]?.[ref] ?? 0);
}

function augmentBossKeys(cache, keys, group) {
    if (ACCEPTED_BOSSKEY_GROUPS.includes(group) && !cache.get("track_bosskeys")) {
        return 9999;
    }
    return keys;
}

function augmentGanonBossKey(cache, keys) {
    if (!cache.get("track_bosskeys")) {
        return 9999;
    }
    if (cache.get("ganon_boss_door_open")) {
        return 9999;
    }
    return keys;
}

function augment(cache, data) {
    const dungeonData = DungeonstateResource.get();
    const res = {};
    for (const [ref, dData] of Object.entries(dungeonData)) {
        // augment dungeontypes
        const dTypeKey = `dungeontype.${ref}`;
        if (data[dTypeKey] != null) {
            res[dTypeKey] = getDungeonType(data[dTypeKey], dData.hasmq);
        }
        // augment keys
        if (dData.keys) {
            if (data["track_keys"] != null || data[dData.keys] != null || data[dTypeKey] != null) {
                const augKeys = augmentKeys(cache, ref, res[dTypeKey] ?? getDungeonType(cache.get(dTypeKey), dData.hasmq), cache.get(dData.keys) ?? 0, dData.keys_group);
                res[dData.keys] = augKeys;
            }
        }
        // augment bosskeys
        if (dData.bosskey) {
            if (ref == "castle_ganon") {
                if (data["ganon_boss_door_open"] != null || data["track_bosskeys"] != null || data[dData.bosskey] != null) {
                    const augKeys = augmentGanonBossKey(cache, cache.get(dData.bosskey) ?? 0);
                    res[dData.bosskey] = augKeys;
                }
            } else if (data["track_bosskeys"] != null || data[dData.bosskey] != null) {
                const augKeys = augmentBossKeys(cache, cache.get(dData.bosskey) ?? 0, dData.bosskey_group);
                res[dData.bosskey] = augKeys;
            }
        }
    }
    return res;
}

LogicCaller.registerAugment(augment);
