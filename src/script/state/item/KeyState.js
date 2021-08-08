// frameworks
import EventBus from "/emcJS/event/EventBus.js";


// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import StateManager from "/GameTrackerJS/state/item/StateManager.js";
import DefaultState from "/GameTrackerJS/state/item/DefaultState.js";

const TYPE = new WeakMap();
const MAX = new WeakMap();

export default class KeyState extends DefaultState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        if (props["type_max"] != null && props["related_dungeon"] != null) {
            const type = SavestateHandler.get("dungeontype", props.related_dungeon, "n");
            TYPE.set(this, type);
            MAX.set(this, props["type_max"][type] ?? super.max);
        } else {
            TYPE.set(this, "v");
            MAX.set(this, super.max);
        }
        /* EVENTS */
        EventBus.register("state::dungeontype", (event) => {
            const props = this.props;
            // savesatate
            if (props["type_max"] != null && props["related_dungeon"] != null) {
                const change = event.data;
                if (change != null && change.ref == props.related_dungeon) {
                    this./*#*/__applyTypeValue(change.value || "n");
                }
            }
        });
    }

    /*#*/__applyTypeValue(newValue) {
        const type = TYPE.get(this);
        if (type != newValue) {
            TYPE.set(this, newValue);
            const props = this.props;
            this./*#*/__setMax(props["type_max"][newValue]);
            // external
            const event = new Event("type");
            event.data = newValue;
            this.dispatchEvent(event);
        }
    }

    /*#*/__setMax(value) {
        const newMax = DefaultState.parseInt(value, this.defaultMax);
        const oldMax = MAX.get(this);
        if (newMax != oldMax) {
            const oldValue = this.value;
            MAX.set(this, newMax);
            // external max
            const event = new Event("max");
            event.data = newMax;
            this.dispatchEvent(event);
            // external value
            const newValue = this.value;
            if (oldValue != newValue) {
                const event = new Event("value");
                event.data = newValue;
                this.dispatchEvent(event);
            }
        }
    }

    stateLoaded(event) {
        const props = this.props;
        // type
        if (props["type_max"] != null && props.hasOwnProperty["related_dungeon"] != null) {
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

    get max() {
        return MAX.get(this) ?? super.max;
    }

    get type() {
        return TYPE.get(this);
    }

}

StateManager.register("key", KeyState);
