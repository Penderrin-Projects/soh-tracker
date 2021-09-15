// GameTrackerJS
import ItemStateManager from "/GameTrackerJS/state/item/ItemStateManager.js";
import DefaultItemState from "/GameTrackerJS/state/item/DefaultState.js";
// Track-OOT
import RewardItemObserver from "../../util/observer/RewardItemObserver.js";

const DUNGEON = new WeakMap();

function internalRewardChange(event) {
    const ref = this.ref;
    const dungeon = DUNGEON.get(this);
    // savesatate
    const change = event.data;
    if (change != null) {
        if (change.ref == dungeon && change.value != ref) {
            this./*#*/__setDungeon("");
        } else if (change.value == ref) {
            this./*#*/__setDungeon(change.ref);
        }
    }
}

export default class RewardItemState extends DefaultItemState {

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        const rewardItemObserver = new RewardItemObserver(ref);
        DUNGEON.set(this, rewardItemObserver.value);
        rewardItemObserver.addEventListener("change", (event) => {
            this./*#*/__setDungeon(event.data);
        });
    }

    /*#*/__setDungeon(newValue) {
        const dungeon = DUNGEON.get(this);
        if (dungeon != newValue) {
            DUNGEON.set(this, newValue);
            // external
            const event = new Event("dungeon");
            event.data = newValue;
            this.dispatchEvent(event);
        }
    }

    get dungeon() {
        return DUNGEON.get(this);
    }

}

ItemStateManager.register("dungeonreward", RewardItemState);
