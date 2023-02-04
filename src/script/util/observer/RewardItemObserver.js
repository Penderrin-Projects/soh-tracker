// frameworks
import {
    filterObject
} from "/emcJS/util/helper/collection/ObjectContent.js";
import ObservableStorageObserver from "/emcJS/util/observer/ObservableStorageObserver.js";
// GameTrackerJS
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
// Track-OOT
import DungeonstateResource from "../../resource/DungeonstateResource.js";
import "../registerStorages.js";

const STORAGES = {dungeonRewards: Savestate.getStorage("dungeonRewards")};

const INSTANCES = new Map();

function getInstance(key) {
    return INSTANCES.get(key);
}

function setInstance(key, inst) {
    INSTANCES.set(key, inst);
}

function getRewardDungeons() {
    const resource = DungeonstateResource.get();
    const filtered = filterObject(resource, (key, entry) => entry.boss_reward);
    return Object.keys(filtered);
}

const REWARD_DUNGEONS = getRewardDungeons();
const DUNGEON = new Map();

for (const dungeon of REWARD_DUNGEONS) {
    const dungeonRewardsObserver = new ObservableStorageObserver(STORAGES.dungeonRewards, dungeon);
    const value = dungeonRewardsObserver.value;
    DUNGEON.set(value, dungeon);
    dungeonRewardsObserver.addEventListener("change", (event) => {
        DUNGEON.set(event.value, dungeon);
        // ---
        const oldInst = getInstance(event.oldValue);
        if (oldInst != null) {
            const ev = new Event("change");
            ev.value = "";
            oldInst.dispatchEvent(ev);
        }
        // ---
        const inst = getInstance(event.value);
        if (inst != null) {
            const ev = new Event("change");
            ev.value = dungeon;
            inst.dispatchEvent(ev);
        }
    });
}

const KEY = new WeakMap();

export default class RewardItemObserver extends EventTarget {

    constructor(key) {
        const inst = getInstance(key);
        if (inst != null) {
            return inst;
        }
        super();
        /* --- */
        KEY.set(this, key);
        /* --- */
        setInstance(key, this);
    }

    get key() {
        return KEY.get(this);
    }

    get value() {
        return DUNGEON.get(this.key) ?? "";
    }

}
