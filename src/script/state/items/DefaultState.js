import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateData from "/script/state/abstract/StateData.js";

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
        this.value = parseInt(change.newValue) || 0;
    }
}

function networkChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        const diff = (parseInt(change.newValue) || 0) - (parseInt(change.oldValue) || 0);
        if (diff != 0) {
            this.value = this.value + diff;
        }
    }
}

export default class DefaultState extends StateData {

    constructor(ref, props, min = 0, max = 0) {
        super(ref, props);
        /* --- */
        MIN.set(this, parseNumber(min, Number.MIN_SAFE_INTEGER));
        MAX.set(this, parseNumber(max, Number.MAX_SAFE_INTEGER));
        this.value = StateStorage.read(ref, 0);
        /* EVENTS */
        EventBus.register("state::item", internalChange.bind(this));
        EventBus.register("net::state::item", networkChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
    }

    stateLoaded(event) {
        const ref = this.ref;
        // savesatate
        this.value = parseInt(event.data.state[ref]) || 0;
    }

    convert(value) { // XXX is this really needed?
        if (typeof value != "number" || isNaN(value)) value = 0;
        const max = this.max;
        const min = this.min;
        if (value > max) {
            value = max;
        } else if (value < min) {
            value = min;
        }
        return value;
    }
    

    set min(value) {
        value = parseNumber(value, Number.MIN_VALUE);
        if (value != null) {
            const max = MAX.get(this);
            if (value > max) {
                value = max;
            }
            MIN.set(this, value);
            if (this.value < value) {
                this.value = value;
            }
        }
    }

    get min() {
        return MIN.get(this);
    }

    set max(value) {
        value = parseNumber(value, Number.MAX_VALUE);
        if (value != null) {
            const min = MIN.get(this);
            if (value < min) {
                value = min;
            }
            MAX.set(this, value);
            if (this.value > value) {
                this.value = value;
            }
        }
    }

    get max() {
        return MAX.get(this);
    }

    set value(value) {
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
                StateStorage.write(this.ref, this.value);
                // external
                const event = new Event("value");
                event.data = value;
                this.dispatchEvent(event);
                // internal
                EventBus.trigger("state::item", {
                    ref: this.ref,
                    oldValue: old,
                    newValue: this.value
                });
            }
        }
    }

    get value() {
        return VALUE.get(this);
    }

}
