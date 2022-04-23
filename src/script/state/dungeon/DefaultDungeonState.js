// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

// GameTrackerJS
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import AreaStateManager from "/GameTrackerJS/statemanager/world/area/AreaStateManager.js";
import DataState from "/GameTrackerJS/state/DataState.js";
// Track-OOT
import "../world/WorldStates.js";

const STORAGES = {dungeonRewards: Savestate.getStorage("dungeonRewards")};

const AREA = new WeakMap();
const REWARD = new WeakMap();

export default class DefaultDungeonState extends DataState {

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        const area = AreaStateManager.get(ref);
        if (area != null) {
            AREA.set(this, area);
            if (area.props.list_mq != null) {
                area.addEventListener("type", (event) => {
                    const ev = new Event("type");
                    ev.data = event.data;
                    this.dispatchEvent(ev);
                });
            }
        }

        const dungeonRewardsObserver = new DataStorageValueObserver(STORAGES.dungeonRewards, ref, "");
        REWARD.set(this, dungeonRewardsObserver.value);
        dungeonRewardsObserver.addEventListener("change", (event) => {
            this.reward = event.data;
        });
    }

    set type(value) {
        const area = AREA.get(this);
        if (area != null) {
            area.type = value;
        }
    }

    get type() {
        const area = AREA.get(this);
        if (area != null) {
            return area.type;
        }
        return "v";
    }

    set reward(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        const old = this.reward;
        if (value != old) {
            REWARD.set(this, value);
            STORAGES.dungeonRewards.set(ref, value);
            // external
            const event = new Event("reward");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get reward() {
        return REWARD.get(this);
    }

}
