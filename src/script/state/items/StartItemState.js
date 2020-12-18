import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import ItemStates from "/script/state/ItemStates.js";
import DefaultState from "/script/state/items/DefaultState.js";

const STARTVALUE = new WeakMap();

function stateLoaded(event) {
    const ref = this.ref;
    const props = this.props;
    // savesatate
    this.value = parseInt(event.data.state[ref]) || 0;
    // settings
    if (props["start_settings"] != null) {
        const startvalue = parseInt(event.data.state[props.start_settings]) || 0;
        this.startvalue = startvalue > 0 ? startvalue : 1;
    }
}

function stateChanged(event) {
    const ref = this.ref;
    const props = this.props;
    // savesatate
    const change = event.data[ref];
    if (change != null) {
        this.value = parseInt(change.newValue) || 0;
    }
    // settings
    if (props["start_settings"] != null) {
        const start = event.data[props.start_settings];
        if (start != null) {
            const startvalue = parseInt(start.newValue) || 0;
            this.startvalue = startvalue > 0 ? startvalue : 1;
        }
    }
}

export default class StartItemState extends DefaultState {

    constructor(ref, props) {
        super(ref, props, 0, props.max);
        /* --- */
        STARTVALUE.set(this, parseInt(StateStorage.read(props.start_settings, 1)));
        /* EVENTS */
        EventBus.register("state", stateLoaded.bind(this));
        EventBus.register("statechange", stateChanged.bind(this));
    }

    set max(value) {
        // no action
    }

    get max() {
        return super.max;
    }

    set min(value) {
        // no action
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
            const event = new Event("startvalue");
            event.data = value;
            this.dispatchEvent(event);
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
