import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import ItemStates from "/script/state/ItemStates.js";
import DefaultState from "/script/state/items/DefaultState.js";

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

function internalChange(event) {
    const ref = this.ref;
    const dungeon = this.dungeon;
    // savesatate
    const change = event.data;
    if (change != null) {
        if (change.ref == dungeon && change.newValue != ref) {
            this.dungeon = "";
        } else if (change.newValue == ref) {
            this.dungeon = change.ref;
        }
    }
}

function dungeonRewardUpdate(event) {
    const ref = this.ref;
    const dungeon = this.dungeon;
    // savesatate
    const data = event.data[dungeon];
    if (data != null && data.newValue != ref) {
        this.dungeon = "";
    } else {
        for (const name in event.data) {
            if (ref == event.data[name].newValue) {
                this.dungeon = name;
                return;
            }
        }
    }
}

export default class RewardItemState extends DefaultState {

    constructor(ref, props) {
        super(ref, props, 0, props.max);
        /* --- */
        this.dungeon = getDisplayDungeon(ref);
        /* EVENTS */
        EventBus.register("state_dungeonreward", internalChange.bind(this));
        EventBus.register("statechange_dungeonreward", dungeonRewardUpdate.bind(this)); // TODO remove later
    }

    stateLoaded(event) {
        const ref = this.ref;
        // savesatate
        super.stateLoaded(event);
        // dungeon
        this.dungeon = getDisplayDungeon(ref);
    }

    get max() {
        return super.max;
    }

    get min() {
        return super.min;
    }

    set dungeon(value) {
        const dungeon = DUNGEON.get(this);
        DUNGEON.set(this, value);
        if (dungeon != value) {
            // external
            const event = new Event("dungeon");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get dungeon() {
        return DUNGEON.get(this);
    }

}

ItemStates.register("dungeonreward", RewardItemState);
