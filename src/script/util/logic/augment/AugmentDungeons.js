import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
import DungeonstateResource from "/script/resource/DungeonstateResource.js";
import "./AugmentOptions.js";

// ref: ItemPool.py -> world.settings.shuffle_smallkeys

function getDungeonType(type, hasmq) {
    if (hasmq) {
        if (type == "v" || type == "mq") {
            return type;
        }
        return "n";
    }
    return "v";
}

function augmentKeys(keyLogic, keys = 0, ref = "", type = "") {
    if (keyLogic == "keylogic_keysy") {
        return 9999;
    }
    if (!type || type == "n") {
        const vKeys = augmentKeys(keyLogic, keys, ref, "v");
        const mqKeys = augmentKeys(keyLogic, keys, ref, "mq");
        return Math.max(vKeys, mqKeys);
    }
    if (ref == "temple_fire" && type != "mq" && keyLogic != "keylogic_keysanity") {
        return keys + 1;
    }
    if (ref == "temple_spirit" && type == "mq" && keyLogic == "keylogic_vanilla") {
        return keys + 3;
    }
    return keys;
}

function augmentGerudoKeys(keyLogic, keys) {
    if (keyLogic == "keylogic_vanilla") {
        return 9999;
    }
    return keys;
}

function augmentBossKeys(keyLogic, keys) {
    if (keyLogic == "keylogic_keysy") {
        return 9999;
    }
    return keys;
}

function augmentGanonBossKey(keyLogic, keys) {
    if (keyLogic == "keylogic_keysy" || keyLogic == "vanilla") {
        return 9999;
    }
    return keys;
}

function augment(cache) {
    const dungeonData = DungeonstateResource.get();
    for (const [ref, dData] of Object.entries(dungeonData)) {
        // augment dungeontypes
        const dTypeKey = `dungeontype[${ref}]`;
        if (cache.hasChange(dTypeKey)) {
            const dungeonType = getDungeonType(cache.get(dTypeKey), dData.hasmq);
            cache.set(dTypeKey, dungeonType);
        }
        // augment keys
        if (dData.keys) {
            const keyRef = `item[${dData.keys}]`;
            const keyGroup = dData.keys_group;
            if (keyGroup == "gerudo") {
                if (cache.hasChange("option[gerudo_key_logic]") || cache.hasChange(keyRef) || cache.hasChange(dTypeKey)) {
                    const keyLogic = cache.get("option[gerudo_key_logic]");
                    const augKeys = augmentGerudoKeys(keyLogic, cache.get(keyRef) ?? 0);
                    cache.set(keyRef, augKeys);
                }
            } else if (keyGroup == "dungeon" || keyGroup == "ganon") {
                if (cache.hasChange("option[small_key_logic]") || cache.hasChange(keyRef) || cache.hasChange(dTypeKey)) {
                    const keyLogic = cache.get("option[small_key_logic]");
                    const augKeys = augmentKeys(keyLogic, cache.get(keyRef) ?? 0, ref, getDungeonType(cache.get(dTypeKey), dData.hasmq));
                    cache.set(keyRef, augKeys);
                }
            }
        }
        // augment bosskeys
        if (dData.bosskey) {
            const bossKeyRef = `item[${dData.bosskey}]`;
            const keyGroup = dData.keys_group;
            if (keyGroup == "ganon") {
                if (cache.hasChange("option[ganon_key_logic]") || cache.hasChange(bossKeyRef)) {
                    const keyLogic = cache.get("option[ganon_key_logic]");
                    const augKeys = augmentGanonBossKey(keyLogic, cache.get(bossKeyRef) ?? 0);
                    cache.set(bossKeyRef, augKeys);
                }
            } else if (keyGroup == "dungeon") {
                if (cache.hasChange("option[boss_key_logic]") || cache.hasChange(bossKeyRef)) {
                    const keyLogic = cache.get("option[boss_key_logic]");
                    const augKeys = augmentBossKeys(keyLogic, cache.get(bossKeyRef) ?? 0);
                    cache.set(bossKeyRef, augKeys);
                }
            }
        }
    }
}

LogicCaller.registerAugment(augment);
