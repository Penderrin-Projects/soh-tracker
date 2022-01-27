// frameworks
import EventBus from "/emcJS/event/EventBus.js";


// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import StateManager from "/GameTrackerJS/state/item/StateManager.js";
import DefaultState from "/GameTrackerJS/state/item/DefaultState.js";

const STARTVALUE = new WeakMap();

export default class TradeItemState extends DefaultState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        if (props.start_values) {
            const startSettings = SavestateHandler.get("", props.start_settings);
            const startValue = props.start_values[startSettings] ?? 0;
            STARTVALUE.set(this, parseInt(startValue));
        } else {
            const startValue = SavestateHandler.get("", props.start_settings, 0);
            STARTVALUE.set(this, parseInt(startValue));
        }
        /* EVENTS */
        EventBus.register("options", event => {
            if (event.data[props.start_settings] != null) {
                if (props.start_values) {
                    const startSettings = event.data[props.start_settings];
                    const startValue = props.start_values[startSettings] ?? 0;
                    this./*#*/__applyStartValue(startValue);
                } else {
                    const startValue = event.data[props.start_settings];
                    this./*#*/__applyStartValue(startValue);
                }
            }
        });
    }

    /*#*/__applyStartValue(newValue) {
        const startvalue = STARTVALUE.get(this);
        newValue = parseInt(newValue) || 1;
        const max = this.max;
        if (newValue < 1) {
            newValue = 1;
        }
        if (newValue > max) {
            newValue = max;
        }
        if (newValue != startvalue) {
            STARTVALUE.set(this, newValue);
            // external
            const event = new Event("startvalue");
            event.data = newValue;
            this.dispatchEvent(event);
            // update value
            const state = this.value;
            if (!!state && state < newValue) {
                this.value = newValue;
            }
        }
    }

    stateLoaded(event) {
        const props = this.props;
        // savesatate
        super.stateLoaded(event);
        // settings
        if (event.data.state[props.start_settings] != null) {
            if (props.start_values) {
                const startSettings = event.data.state[props.start_settings];
                const startValue = props.start_values[startSettings] ?? 0;
                this./*#*/__applyStartValue(startValue);
            } else {
                const startValue = event.data.state[props.start_settings];
                this./*#*/__applyStartValue(startValue);
            }
        }
    }

    get max() {
        return super.max;
    }

    get min() {
        return super.min;
    }

    get startvalue() {
        return STARTVALUE.get(this);
    }

    set value(value) {
        if (typeof value != "number") {
            value = 0;
        }
        if (!!value && value < this.startvalue) {
            if (super.value > value) {
                value = 0;
            } else {
                value = this.startvalue;
            }
        }
        super.value = value;
    }

    get value() {
        return super.value;
    }

}

StateManager.register("item_startsettings", TradeItemState);
