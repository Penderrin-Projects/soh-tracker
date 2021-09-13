// frameworks
import Helper from "/emcJS/util/helper/Helper.js";
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";
// GameTrackerJS
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
// Track-OOT
import DungeonstateResource from "../../resource/DungeonstateResource.js";

const INSTANCES = new Map();

function getInstance(key) {
    return INSTANCES.get(key);
}

function setInstance(key, inst) {
    INSTANCES.set(key, inst);
}

function getRewardDungeons() {
    const resource = DungeonstateResource.get();
    const filtered = Helper.Object.filter(resource, (key, entry) => entry.boss_reward);
    return Object.keys(filtered);
}

const REWARD_DUNGEONS = getRewardDungeons();
const STORAGE = Savestate.getStorage("dungeonRewards");
const DUNGEON = new Map();

for (const dungeon of REWARD_DUNGEONS) {
    const dungeonRewardsObserver = new DataStorageValueObserver(STORAGE, dungeon, "");
    const value = dungeonRewardsObserver.value;
    DUNGEON.set(value, dungeon);
    dungeonRewardsObserver.addEventListener("change", (event) => {
        DUNGEON.set(event.data, dungeon);
        const inst = getInstance(event.data);
        if (inst != null) {
            const ev = new Event("change");
            ev.data = dungeon;
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
