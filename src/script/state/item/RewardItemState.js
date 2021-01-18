import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateManager from "/GameTrackerJS/state/item/StateManager.js";
import DefaultState from "/GameTrackerJS/state/item/DefaultState.js";

const ALL_DUNGEONS = [
    'area/pocket',
    'area/deku',
    'area/dodongo',
    'area/jabujabu',
    'area/temple_forest',
    'area/temple_fire',
    'area/temple_shadow',
    'area/temple_water',
    'area/temple_spirit'
];

const DUNGEON = new WeakMap();

function getDisplayDungeon(ref) {
    for (const dungeon of ALL_DUNGEONS) {
        const rewardValue = StateStorage.readExtra("dungeonreward", dungeon, "");
        if (rewardValue == ref) {
            return dungeon;
        }
    }
    return "";
}

function internalRewardChange(event) {
    const ref = this.ref;
    const dungeon = DUNGEON.get(this);
    // savesatate
    const change = event.data;
    if (change != null) {
        if (change.ref == dungeon && change.value != ref) {
            this./*#*/__applyDungeonValue("");
        } else if (change.value == ref) {
            this./*#*/__applyDungeonValue(change.ref);
        }
    }
}

export default class RewardItemState extends DefaultState {

    constructor(ref, props) {
        super(ref, props, 0, props.max);
        /* --- */
        this./*#*/__applyDungeonValue(getDisplayDungeon(ref));
        /* EVENTS */
        EventBus.register("state::dungeonreward", internalRewardChange.bind(this));
    }

    /*#*/__applyDungeonValue(newValue) {
        const dungeon = DUNGEON.get(this);
        if (dungeon != newValue) {
            DUNGEON.set(this, newValue);
            // external
            const event = new Event("dungeon");
            event.data = newValue;
            this.dispatchEvent(event);
        }
    }

    stateLoaded(event) {
        const ref = this.ref;
        // savesatate
        super.stateLoaded(event);
        // dungeon
        this./*#*/__applyDungeonValue(getDisplayDungeon(ref));
    }

    get max() {
        return super.max;
    }

    get min() {
        return super.min;
    }

    get dungeon() {
        return DUNGEON.get(this);
    }

}

StateManager.register("dungeonreward", RewardItemState);
