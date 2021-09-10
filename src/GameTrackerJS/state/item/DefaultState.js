// frameworks
import EventBus from "/emcJS/event/EventBus.js";

import SavestateHandler from "../../savestate/SavestateHandler.js";
import OptionsObserver from "../../util/observer/OptionsObserver.js";
import StartItemsObserver from "../../util/observer/StartItemsObserver.js";
import DataState from "../DataState.js";

const VALUE = new WeakMap();
const DEF_MAX = new WeakMap();
const DEF_MIN = new WeakMap();
const MAX = new WeakMap();
const MIN = new WeakMap();
const START = new WeakMap();

export function parseSafeRange(value, def) {
    const result = parseInt(value);
    if (isNaN(result)) {
        return def;
    }
    if (result > 99999) {
        return 99999;
    }
    if (result < 0) {
        return 0;
    }
    return result;
}

export default class DefaultState extends DataState {

    constructor(ref, props = {}) {
        super(ref, props);
        /* --- */
        DEF_MAX.set(this, parseSafeRange(props.max, 0));
        DEF_MIN.set(this, parseSafeRange(props.min, 0));

        /* STARTITEMS */
        {
            const startItemsObserver = new StartItemsObserver(ref);
            START.set(this, parseSafeRange(startItemsObserver.value, 0));
            startItemsObserver.addEventListener("change", (event) => {
                this./*#*/__setStart(event.data);
            });
        }

        /* VAR_MAX */
        if (props.var_max != null) {
            if (typeof props.var_max == "object") {
                if (props.var_max.option != null && props.var_max.values != null) {
                    const defMax = DEF_MAX.get(this);
                    const optionObserver = new OptionsObserver(props.var_max.option);
                    const maxVal = parseSafeRange(props.var_max.values[optionObserver.value], defMax);
                    if (maxVal != null) {
                        MAX.set(this, maxVal);
                    }
                    optionObserver.addEventListener("change", (event) => {
                        this./*#*/__setMax(props.var_max.values[event.data]);
                    });
                }
            } else if (typeof props.var_max == "string") {
                const defMax = DEF_MAX.get(this);
                const optionObserver = new OptionsObserver(props.var_max);
                const maxVal = parseSafeRange(optionObserver.value, defMax);
                if (maxVal != null) {
                    MAX.set(this, maxVal);
                }
                optionObserver.addEventListener("change", (event) => {
                    this./*#*/__setMax(event.data);
                });
            }
        }

        /* VAR_MIN */
        if (props.var_min != null) {
            if (typeof props.var_min == "object") {
                if (props.var_min.option != null && props.var_min.values != null) {
                    const defMin = DEF_MIN.get(this);
                    const optionObserver = new OptionsObserver(props.var_min.option);
                    const minVal = parseSafeRange(props.var_min.values[optionObserver.value], defMin);
                    if (minVal != null) {
                        MIN.set(this, minVal);
                    }
                    optionObserver.addEventListener("change", (event) => {
                        this./*#*/__setMin(props.var_min.values[event.data]);
                    });
                }
            } else if (typeof props.var_min == "string") {
                const defMin = DEF_MIN.get(this);
                const optionObserver = new OptionsObserver(props.var_min);
                const minVal = parseSafeRange(optionObserver.value, defMin);
                if (minVal != null) {
                    MIN.set(this, minVal);
                }
                optionObserver.addEventListener("change", (event) => {
                    this./*#*/__setMin(event.data);
                });
            }
        }

        /* VALUE */
        {
            const value = SavestateHandler.get("", ref, 0);
            VALUE.set(this, this./*#*/__restrictValue(value));
        }
        // TODO
        // SavestateHandler.addEventListener("load", event => {
        //     console.log("load", event);
        // });
        
        /* EVENTS */
        EventBus.register("state::item", (event) => {
            const ref = this.ref;
            const change = event.data;
            if (change != null && change.ref == ref) {
                this./*#*/__setValue(change.value);
            }
        });
        EventBus.register("state", (event) => {
            // console.log("state", event);
            this.stateLoaded(event);
        });
    }

    stateLoaded(event) {
        const ref = this.ref;
        // savesatate
        this./*#*/__setValue(event.data.state[ref] ?? 0);
    }

    /*#*/__restrictValue(value) {
        const max = this.max;
        const min = this.min;
        if (value > max) {
            return max;
        }
        if (value < min) {
            return min;
        }
        return value;
    }

    /*#*/__setMax(value) {
        const newMax = parseSafeRange(value, this.defaultMax);
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

    /*#*/__setMin(value) {
        const newMin = parseSafeRange(value, 0);
        const oldMin = MIN.get(this);
        if (newMin != oldMin) {
            const oldValue = this.value;
            MIN.set(this, newMin);
            // external min
            const event = new Event("min");
            event.data = newMin;
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

    /*#*/__setStart(value) {
        const newStart = parseSafeRange(value, 0);
        const oldStart = MIN.get(this);
        if (newStart != oldStart) {
            const oldValue = this.value;
            START.set(this, newStart);
            // external min
            const event = new Event("start");
            event.data = newStart;
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

    /*#*/__setValue(value) {
        const ref = this.ref;
        const rValue = parseSafeRange(value);
        if (rValue != null) {
            const newValue = this./*#*/__restrictValue(rValue);
            const oldValue = this.value;
            if (newValue != oldValue) {
                VALUE.set(this, newValue);
                SavestateHandler.set("", ref, newValue);
                // external
                const event = new Event("value");
                event.data = newValue;
                this.dispatchEvent(event);
            }
            return newValue;
        }
    }

    get defaultMax() {
        return DEF_MAX.get(this);
    }

    get defaultMin() {
        return DEF_MIN.get(this);
    }

    get max() {
        return MAX.get(this) ?? DEF_MAX.get(this);
    }

    get min() {
        return Math.max(MIN.get(this) ?? DEF_MIN.get(this), START.get(this) ?? 0);
    }

    set value(value) {
        const oldValue = this.value;
        const newValue = this./*#*/__setValue(value);
        if (newValue != null && newValue != oldValue) {
            // internal
            EventBus.trigger("state::item", {ref: this.ref, value: newValue});
        }
    }

    get value() {
        const value = VALUE.get(this);
        return this./*#*/__restrictValue(value);
    }

}
