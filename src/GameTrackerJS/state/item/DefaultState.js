import EventBus from "/emcJS/event/EventBus.js";
import DataState from "../abstract/DataState.js";
import StateStorage from "/script/storage/StateStorage.js";

const VALUE = new WeakMap();
const MAX = new WeakMap();
const MIN = new WeakMap();

function parseNumber(value) {
    const result = parseInt(value);
    if (isNaN(result)) {
        console.warn("value is not a number");
        return;
    }
    if (result > Number.MAX_SAFE_INTEGER) {
        return Number.MAX_SAFE_INTEGER;
    }
    if (result < Number.MIN_SAFE_INTEGER) {
        return Number.MIN_SAFE_INTEGER;
    }
    return result;
}

function internalChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setValue(change.value);
    }
}

export default class DefaultState extends DataState {

    constructor(ref, props, min = 0, max = 0) {
        super(ref, props);
        /* --- */
        MIN.set(this, parseNumber(min, Number.MIN_SAFE_INTEGER));
        MAX.set(this, parseNumber(max, Number.MAX_SAFE_INTEGER));
        this.value = StateStorage.read(ref, 0);
        /* EVENTS */
        EventBus.register("state::item", internalChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
    }

    stateLoaded(event) {
        const ref = this.ref;
        // savesatate
        this.value = event.data.state[ref] ?? 0;
    }

    set min(value) {
        value = parseNumber(value, Number.MIN_VALUE);
        if (value != null) {
            const min = MIN.get(this);
            const max = MAX.get(this);
            if (value > max) {
                value = max;
            }
            if (value != min) {
                MIN.set(this, value);
                // external
                const event = new Event("min");
                event.data = value;
                this.dispatchEvent(event);
                // update value
                if (this.value < value) {
                    this.value = value;
                }
            }
        }
    }

    get min() {
        return MIN.get(this);
    }

    set max(value) {
        value = parseNumber(value, Number.MAX_VALUE);
        if (value != null) {
            const max = MAX.get(this);
            const min = MIN.get(this);
            if (value < min) {
                value = min;
            }
            if (value != max) {
                MAX.set(this, value);
                // external
                const event = new Event("max");
                event.data = value;
                this.dispatchEvent(event);
                // update value
                if (this.value > value) {
                    this.value = value;
                }
            }
        }
    }

    get max() {
        return MAX.get(this);
    }

    /*#*/__setValue(value) {
        const ref = this.ref;
        value = parseNumber(value);
        if (value != null) {
            const max = MAX.get(this);
            const min = MIN.get(this);
            if (value > max) {
                value = max;
            } else if (value < min) {
                value = min;
            }
            const old = this.value;
            if (value != old) {
                VALUE.set(this, value);
                StateStorage.write(ref, value);
                // external
                const event = new Event("value");
                event.data = value;
                this.dispatchEvent(event);
            }
            return value;
        }
    }

    set value(value) {
        const ref = this.ref;
        const old = this.value;
        value = this./*#*/__setValue(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::item", {ref, value});
        }
    }

    get value() {
        return VALUE.get(this);
    }

}
