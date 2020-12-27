import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateManager from "/GameTrackerJS/state/item/StateManager.js";
import DefaultState from "/GameTrackerJS/state/item/DefaultState.js";

const STARTVALUE = new WeakMap();

export default class StartItemState extends DefaultState {

    constructor(ref, props) {
        super(ref, props, 0, props.max);
        /* --- */
        STARTVALUE.set(this, parseInt(StateStorage.read(props.start_settings, 1)));
        /* EVENTS */
        EventBus.register("randomizer_options", event => {
            if (event.data[props.start_settings] != null) {
                this.applyStartValue(event.data[props.start_settings]);
            }
        });
    }

    /*#*/applyStartValue(newValue) {
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
            this.applyStartValue(event.data.state[props.start_settings]);
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
        if (typeof value != "number") value = 0;
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

StateManager.register("item_startsettings", StartItemState);
