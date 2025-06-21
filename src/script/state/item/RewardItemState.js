import ItemStateManager from "/GameTrackerJS/statemanager/item/ItemStateManager.js";
import RewardItemObserver from "../../util/observer/RewardItemObserver.js";
import DefaultAPItemState from "./DefaultAPItemState.js";

const DUNGEON = new WeakMap();

// function internalRewardChange(event) {
//     const ref = this.ref;
//     const dungeon = DUNGEON.get(this);
//     // savesatate
//     const change = event.value;
//     if (change != null) {
//         if (change.ref == dungeon && change.value != ref) {
//             this.#setDungeon("");
//         } else if (change.value == ref) {
//             this.#setDungeon(change.ref);
//         }
//     }
// }

export default class RewardItemState extends DefaultAPItemState {

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        const rewardItemObserver = new RewardItemObserver(ref);
        DUNGEON.set(this, rewardItemObserver.value);
        rewardItemObserver.onChange((event) => {
            this.#setDungeon(event.value);
        });
    }

    #setDungeon(newValue) {
        const dungeon = DUNGEON.get(this);
        if (dungeon != newValue) {
            DUNGEON.set(this, newValue);
            // external
            const event = new Event("dungeon");
            event.value = newValue;
            this.dispatchEvent(event);
        }
    }

    get dungeon() {
        return DUNGEON.get(this);
    }

}

ItemStateManager.register("dungeonreward", RewardItemState);
