import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
import DungeonstateResource from "/script/resource/DungeonstateResource.js";
import "./AugmentOptions.js";
import KEY_LOCATION_INDEX from "./AugmentDungeonState.js.json" assert {type: "json"};

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

function augmentGerudoKeys(keyLogic, keyRef, keys) {
    const keyLocationList = KEY_LOCATION_INDEX[keyRef] ?? [];
    if (keyLogic === "keylogic_vanilla") {
        for (const location of keyLocationList) {
            LogicCaller.addCollectible(location, keyRef);
        }
        return 0;
    }
    for (const location of keyLocationList) {
        LogicCaller.deleteCollectible(location);
    }
    return keys;
}

function augmentTCGKeys(keyLogic, keyRef, keys) {
    const keyLocationList = KEY_LOCATION_INDEX[keyRef] ?? [];
    if (keyLogic === "keylogic_vanilla") {
        for (const location of keyLocationList) {
            LogicCaller.addCollectible(location, keyRef);
        }
        return 0;
    }
    for (const location of keyLocationList) {
        LogicCaller.deleteCollectible(location);
    }
    if (keyLogic == "keylogic_keysy") {
        return 9999;
    }
    return keys;
}

function augmentSilverRupees(keyLogic, keyRef, keys) {
    const keyLocationList = KEY_LOCATION_INDEX[keyRef] ?? [];
    if (keyLogic === "keylogic_vanilla") {
        for (const location of keyLocationList) {
            LogicCaller.addCollectible(location, keyRef);
        }
        return 0;
    }
    for (const location of keyLocationList) {
        LogicCaller.deleteCollectible(location);
    }
    if (keyLogic == "keylogic_keysy") {
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
        // augment keys
        if (dData.keys) {
            const keyRef = `item[${dData.keys}]`;
            const keyGroup = dData.keys_group;
            if (keyGroup === "treasure_game") {
                if (cache.hasChange("option[shuffle_tcgkeys]") || cache.hasChange(keyRef)) {
                    const keyLogic = cache.get("option[shuffle_tcgkeys]");
                    const augKeys = augmentTCGKeys(keyLogic, keyRef, cache.get(keyRef) ?? 0);
                    cache.setAugmented(keyRef, augKeys);
                }
            } else if (keyGroup === "gerudo") {
                if (cache.hasChange("option[gerudo_key_logic]") || cache.hasChange(keyRef)) {
                    const keyLogic = cache.get("option[gerudo_key_logic]");
                    const augKeys = augmentGerudoKeys(keyLogic, keyRef, cache.get(keyRef) ?? 0);
                    cache.setAugmented(keyRef, augKeys);
                }
            } else if (keyGroup === "dungeon" || keyGroup == "ganon") {
                const dTypeKey = `arealist[${ref}]`;
                if (cache.hasChange("option[small_key_logic]") || cache.hasChange(keyRef) || cache.hasChange(dTypeKey)) {
                    const keyLogic = cache.get("option[small_key_logic]");
                    const augKeys = augmentKeys(keyLogic, cache.get(keyRef) ?? 0, ref, getDungeonType(cache.get(dTypeKey), dData.hasmq));
                    cache.setAugmented(keyRef, augKeys);
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
                    cache.setAugmented(bossKeyRef, augKeys);
                }
            } else if (keyGroup == "dungeon") {
                if (cache.hasChange("option[boss_key_logic]") || cache.hasChange(bossKeyRef)) {
                    const keyLogic = cache.get("option[boss_key_logic]");
                    const augKeys = augmentBossKeys(keyLogic, cache.get(bossKeyRef) ?? 0);
                    cache.setAugmented(bossKeyRef, augKeys);
                }
            }
        }
        // augment silver rupees
        if (dData.silver_rupees) {
            for (const silver_rupee_key of Object.values(dData.silver_rupees)) {
                const keyRef = `item[${silver_rupee_key}]`;
                if (cache.hasChange("option[shuffle_silver_rupees]") || cache.hasChange(keyRef)) {
                    const keyLogic = cache.get("option[shuffle_silver_rupees]");
                    const augKeys = augmentSilverRupees(keyLogic, keyRef, cache.get(keyRef) ?? 0);
                    cache.setAugmented(keyRef, augKeys);
                }
            }
        }
    }
}

LogicCaller.registerAugment(augment);
