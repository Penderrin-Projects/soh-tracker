/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */

// GameTrackerJS
import StateManager from "/GameTrackerJS/state/item/StateManager.js";
import DefaultState from "/GameTrackerJS/state/item/DefaultState.js";
// Track-OOT
import StateStorage from "/script/storage/StateStorage.js";

const TYPE = new WeakMap();

function getMaxValue(props, type = "n") {
    if (type == "v") {
        return props.max;
    } else if (type == "mq") {
        return props.maxmq;
    } else {
        return Math.max(props.maxmq, props.max);
    }
}

function internalTypeChange(event) {
    const props = this.props;
    // savesatate
    if (props["maxmq"] != null && props["related_dungeon"] != null) {
        const change = event.data;
        if (change != null && change.ref == props.related_dungeon) {
            this./*#*/__applyTypeValue(change.value || "n");
        }
    }
}

export default class KeyState extends DefaultState {

    constructor(ref, props) {
        super(ref, props, 0, getMaxValue(props));
        /* --- */
        if (props["maxmq"] != null && props["related_dungeon"] != null) {
            const value = StateStorage.readExtra("dungeontype", props.related_dungeon, "n");
            this./*#*/__applyTypeValue(value);
        } else {
            this./*#*/__applyTypeValue("v");
        }
        /* EVENTS */
        EventBus.register("state::dungeontype", internalTypeChange.bind(this));
        this.addEventListener("type", event => {
            const props = this.props;
            super.max = getMaxValue(props, event.data);
        });
    }

    /*#*/__applyTypeValue(newValue) {
        const type = TYPE.get(this);
        if (type != newValue) {
            TYPE.set(this, newValue);
            // external
            const event = new Event("type");
            event.data = newValue;
            this.dispatchEvent(event);
        }
    }

    stateLoaded(event) {
        const props = this.props;
        // type
        if (props["maxmq"] != null && props.hasOwnProperty["related_dungeon"] != null) {
            const types = event.data.extra.dungeontype;
            if (types != null) {
                this./*#*/__applyTypeValue(types[props.related_dungeon]);
            } else {
                this./*#*/__applyTypeValue("n");
            }
        }
        // savesatate
        super.stateLoaded(event);
    }

    get min() {
        return super.min;
    }

    get max() {
        return super.max;
    }

    get type() {
        return TYPE.get(this);
    }

}

StateManager.register("key", KeyState);
