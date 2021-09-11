// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

import { parseSafeRange } from "../../util/helper/ItemHelper.js";
import Savestate from "../../savestate/Savestate.js";
import OptionsObserver from "../../util/observer/OptionsObserver.js";
import DataState from "../DataState.js";
import VisibilityHandler from "../../util/handler/VisibilityHandler.js";

const STORAGES = {
    items: Savestate.getStorage("items"),
    startItems: Savestate.getStorage("startItems"),
};

const VISIBILITY_HANDLER = new WeakMap();

const DEF_MAX = new WeakMap();
const DEF_MIN = new WeakMap();
const MAX = new WeakMap();
const MIN = new WeakMap();
const START = new WeakMap();
const VALUE = new WeakMap();

export default class DefaultItemState extends DataState {

    constructor(ref, props = {}) {
        super(ref, props);

        /* VISIBILITY */
        const visibilityHandler = new VisibilityHandler(props.visible);
        VISIBILITY_HANDLER.set(this, visibilityHandler);
        visibilityHandler.addEventListener("change", (event) => {
            const ev = new Event("visiblity");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });

        /* DEFAULT */
        DEF_MAX.set(this, parseSafeRange(props.max, 0));
        DEF_MIN.set(this, parseSafeRange(props.min, 0));

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

        /* VALUES */
        const startItemsObserver = new DataStorageValueObserver(STORAGES.startItems, ref, 0);
        START.set(this, parseSafeRange(startItemsObserver.value, 0));
        startItemsObserver.addEventListener("change", (event) => {
            this./*#*/__setStart(event.data);
        });

        const itemsObserver = new DataStorageValueObserver(STORAGES.items, ref, 0);
        VALUE.set(this, this./*#*/__restrictValue(itemsObserver.value));
        itemsObserver.addEventListener("change", (event) => {
            this.value = event.data;
        });
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
        const ref = this.ref;
        const rValue = parseSafeRange(value);
        if (rValue != null) {
            const newValue = this./*#*/__restrictValue(rValue);
            const oldValue = this.value;
            if (newValue != oldValue) {
                VALUE.set(this, newValue);
                STORAGES.items.set(ref, newValue);
                // external
                const event = new Event("value");
                event.data = newValue;
                this.dispatchEvent(event);
            }
        }
    }

    get value() {
        const value = VALUE.get(this);
        return this./*#*/__restrictValue(value);
    }

    isMarked() {
        if (this.props.mark !== false) {
            const mark = parseInt(this.props.mark);
            if (this.value >= this.max || (!isNaN(mark) && this.value >= mark)) {
                return true;
            }
        }
        return false;
    }

    get visible() {
        const visibilityHandler = VISIBILITY_HANDLER.get(this);
        return visibilityHandler.visible;
    }

}
