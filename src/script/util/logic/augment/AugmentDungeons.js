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

// ItemPool.py -> world.settings.shuffle_smallkeys
const KEY_VNL_AUGMENTS = {
    "v": {"temple_fire": 1},
    "mq": {"temple_spirit": 3} // XXX only in vanilla small key option
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
    if (ACCEPTED_KEY_GROUPS.includes(group) && !cache.get("option[track_keys]")) {
        return 9999;
    }
    const ks = cache.get("option[keysanity_small]");
    const aug = !ks ? KEY_VNL_AUGMENTS : KEY_SAN_AUGMENTS;
    if (!type || type == "n") {
        const vAug = aug["v"]?.[ref] ?? 0;
        const mqAug = aug["mq"]?.[ref] ?? 0;
        return keys + Math.max(vAug, mqAug);
    }
    return keys + (aug[type]?.[ref] ?? 0);
}

function augmentBossKeys(cache, keys, group) {
    if (ACCEPTED_BOSSKEY_GROUPS.includes(group) && !cache.get("option[track_bosskeys]")) {
        return 9999;
    }
    return keys;
}

function augmentGanonBossKey(cache, keys) {
    if (!cache.get("option[track_bosskeys]")) {
        return 9999;
    }
    if (cache.get("option[ganon_boss_door_open]")) {
        return 9999;
    }
    return keys;
}

function augment(cache, data) {
    const dungeonData = DungeonstateResource.get();
    const res = {};
    for (const [ref, dData] of Object.entries(dungeonData)) {
        // augment dungeontypes
        const dTypeKey = `dungeontype[${ref}]`;
        if (data[dTypeKey] != null) {
            res[dTypeKey] = getDungeonType(data[dTypeKey], dData.hasmq);
        }
        // augment keys
        if (dData.keys) {
            const keyRef = `item[${dData.keys}]`;
            if (data["option[track_keys]"] != null || data[keyRef] != null || data[dTypeKey] != null) {
                const augKeys = augmentKeys(cache, ref, res[dTypeKey] ?? getDungeonType(cache.get(dTypeKey), dData.hasmq), cache.get(keyRef) ?? 0, dData.keys_group);
                res[keyRef] = augKeys;
            }
        }
        // augment bosskeys
        if (dData.bosskey) {
            const bossKeyRef = `item[${dData.bosskey}]`;
            if (ref == "castle_ganon") {
                if (data["option[ganon_boss_door_open]"] != null || data["option[track_bosskeys]"] != null || data[bossKeyRef] != null) {
                    const augKeys = augmentGanonBossKey(cache, cache.get(bossKeyRef) ?? 0);
                    res[bossKeyRef] = augKeys;
                }
            } else if (data["option[track_bosskeys]"] != null || data[bossKeyRef] != null) {
                const augKeys = augmentBossKeys(cache, cache.get(bossKeyRef) ?? 0, dData.bosskey_group);
                res[bossKeyRef] = augKeys;
            }
        }
    }
    return res;
}

LogicCaller.registerAugment(augment);
