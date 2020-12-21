import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import ItemStates from "/script/state/ItemStates.js";
import DefaultState from "/script/state/items/DefaultState.js";

const STARTVALUE = new WeakMap();

export default class StartItemState extends DefaultState {

    constructor(ref, props) {
        super(ref, props, 0, props.max);
        /* --- */
        STARTVALUE.set(this, parseInt(StateStorage.read(props.start_settings, 1)));
        /* EVENTS */
        EventBus.register("randomizer_options", event => {
            if (props.start_settings != null) {
                const startvalue = parseInt(event.data[props.start_settings]) || 0;
                this.startvalue = startvalue > 0 ? startvalue : 1;
            }
        });
    }

    stateLoaded(event) {
        const props = this.props;
        // savesatate
        super.stateLoaded(event);
        // settings
        if (props.start_settings != null) {
            const startvalue = parseInt(event.data.state[props.start_settings]) || 0;
            this.startvalue = startvalue > 0 ? startvalue : 1;
        }
    }

    get max() {
        return super.max;
    }

    get min() {
        return super.min;
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

    set startvalue(value) {
        if (typeof value != "number") value = 0;
        const max = this.max;
        if (value > max) {
            value = max;
        }
        if (value != this.startvalue) {
            STARTVALUE.set(this, value);
            // external
            const event = new Event("startvalue");
            event.data = value;
            this.dispatchEvent(event);
            // update value
            const state = this.value;
            if (!!state && state < value) {
                this.value = value;
            }
        }
    }

    get startvalue() {
        return STARTVALUE.get(this);
    }

}

ItemStates.register("item_startsettings", StartItemState);
