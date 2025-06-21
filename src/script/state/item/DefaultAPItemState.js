// frameworks
import ObservableStorageObserver from "/emcJS/util/observer/ObservableStorageObserver.js";
import {
    mix
} from "/emcJS/util/Mixin.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import ItemStateManager from "/GameTrackerJS/statemanager/item/ItemStateManager.js";
import DataState from "/GameTrackerJS/state/DataState.js";
import StateVisibilityMixin from "/GameTrackerJS/state/mixins/StateVisibilityMixin.js";
import {
    parseSafeRange
} from "/GameTrackerJS/util/helper/ItemHelper.js";
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import {
    AP_STORAGES
} from "../../util/archipelago/storage/RegisterAPStorage.js";

const STORAGES = {
    items: Savestate.getStorage("items"),
    startItems: Savestate.getStorage("startItems")
};

const BaseClass = mix(
    DataState
).with(
    StateVisibilityMixin
);

export default class DefaultAPItemState extends BaseClass {

    #defaultMin;

    #defaultMax;

    #min;

    #max;

    #start;

    #value = 0;

    #apValue = 0;

    constructor(ref, props = {}) {
        super(ref, props);

        /* VAR MIN */
        this.#defaultMin = parseSafeRange(props.min, 0);
        if (props.varMin != null) {
            if (typeof props.varMin == "object") {
                if (props.varMin.option != null && props.varMin.values != null) {
                    const optionObserver = new OptionsObserver(props.varMin.option);
                    const minVal = parseSafeRange(props.varMin.values[optionObserver.value], this.#defaultMin);
                    if (minVal != null) {
                        this.#min = minVal;
                    }
                    optionObserver.onChange((event) => {
                        this.#setMin(props.varMin.values[event.value]);
                    });
                }
            } else if (typeof props.varMin == "string") {
                const optionObserver = new OptionsObserver(props.varMin);
                const minVal = parseSafeRange(optionObserver.value, this.#defaultMin);
                if (minVal != null) {
                    this.#min = minVal;
                }
                optionObserver.onChange((event) => {
                    this.#setMin(event.value ?? 0);
                });
            }
        }

        /* VAR MAX */
        this.#defaultMax = parseSafeRange(props.max, 0);
        if (props.varMax != null) {
            if (typeof props.varMax == "object") {
                if (props.varMax.option != null && props.varMax.values != null) {
                    const optionObserver = new OptionsObserver(props.varMax.option);
                    const maxVal = parseSafeRange(props.varMax.values[optionObserver.value], this.#defaultMax);
                    if (maxVal != null) {
                        this.#max = maxVal;
                    }
                    optionObserver.onChange((event) => {
                        this.#setMax(props.varMax.values[event.value]);
                    });
                }
            } else if (typeof props.varMax == "string") {
                const optionObserver = new OptionsObserver(props.varMax);
                const maxVal = parseSafeRange(optionObserver.value, this.#defaultMax);
                if (maxVal != null) {
                    this.#max = maxVal;
                }
                optionObserver.onChange((event) => {
                    this.#setMax(event.value ?? 0);
                });
            }
        }

        /* VALUES */
        const startItemsObserver = new ObservableStorageObserver(STORAGES.startItems, ref);
        this.#start = parseSafeRange(startItemsObserver.value, 0);
        startItemsObserver.onChange((event) => {
            this.#setStart(event.value ?? 0);
        });

        const apItemsObserver = new ObservableStorageObserver(AP_STORAGES.items, ref);
        this.#apValue = this.#restrictAPValue(apItemsObserver.value);
        apItemsObserver.onChange((event) => {
            this.setAPValue(event.value ?? 0);
        });

        const itemsObserver = new ObservableStorageObserver(STORAGES.items, ref);
        this.#value = this.#restrictValue(itemsObserver.value);
        itemsObserver.onChange((event) => {
            this.setValue(event.value ?? 0);
        });
    }

    #restrictAPValue(value) {
        const max = this.max;
        const min = this.min;
        if (value > max) {
            this.#value = 0;
            return max;
        }
        if (value < min) {
            this.#value = 0;
            return min;
        }
        if (value + this.#value > max) {
            this.#value = max - value;
        }
        return value;
    }

    #restrictValue(value) {
        const max = this.max;
        const min = this.min;
        if (value > max - this.#apValue) {
            return max - this.#apValue;
        }
        if (value < min) {
            return min;
        }
        return value;
    }

    #setMin(value) {
        const newMin = parseSafeRange(value, 0);
        const oldMin = this.#min;
        if (newMin != oldMin) {
            this.#min = newMin;
            // external min
            const event = new Event("min");
            event.value = newMin;
            this.dispatchEvent(event);
            // set value
            this.value = this.#value;
        }
    }

    #setMax(value) {
        const newMax = parseSafeRange(value, this.defaultMax);
        const oldMax = this.#max;
        if (newMax != oldMax) {
            this.#max = newMax;
            // external max
            const event = new Event("max");
            event.value = newMax;
            this.dispatchEvent(event);
            // set value
            this.value = this.#value;
        }
    }

    #setStart(value) {
        const newStart = parseSafeRange(value, 0);
        const oldStart = this.#start;
        if (newStart != oldStart) {
            this.#start = newStart;
            // external min
            const event = new Event("start");
            event.value = newStart;
            this.dispatchEvent(event);
            // set value
            this.value = this.#value;
        }
    }

    get defaultMin() {
        return this.#defaultMin;
    }

    get defaultMax() {
        return this.#defaultMax;
    }

    get min() {
        return Math.max(this.#min ?? this.#defaultMin, this.#start ?? 0);
    }

    get max() {
        return this.#max ?? this.#defaultMax;
    }

    set value(value) {
        const ref = this.ref;
        const rValue = parseSafeRange(value - this.#apValue);
        if (rValue != null) {
            const newValue = this.#restrictValue(rValue);
            const oldValue = this.#value;
            if (newValue != oldValue) {
                const oldResValue = this.value;
                this.#value = newValue;
                STORAGES.items.set(ref, newValue);
                const newResValue = this.value;
                if (newResValue != oldResValue) {
                    // external
                    const event = new Event("value");
                    event.value = newResValue;
                    this.dispatchEvent(event);
                }
            }
        }
    }

    get value() {
        return this.#value + this.#apValue;
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

    setValue(value) {
        const ref = this.ref;
        const rValue = parseSafeRange(value);
        if (rValue != null) {
            const newValue = this.#restrictValue(rValue);
            const oldValue = this.#value;
            if (newValue != oldValue) {
                const oldResValue = this.value;
                this.#value = newValue;
                STORAGES.items.set(ref, newValue);
                const newResValue = this.value;
                if (newResValue != oldResValue) {
                    // external
                    const event = new Event("value");
                    event.value = newResValue;
                    this.dispatchEvent(event);
                }
            }
        }
    }

    setAPValue(value) {
        const rValue = parseSafeRange(value);
        if (rValue != null) {
            const newValue = this.#restrictAPValue(rValue);
            const oldValue = this.#apValue;
            if (newValue != oldValue) {
                const oldResValue = this.value;
                this.#apValue = newValue;
                const newResValue = this.value;
                if (newResValue != oldResValue) {
                    // external
                    const event = new Event("value");
                    event.value = newResValue;
                    this.dispatchEvent(event);
                }
            }
        }
    }

}

ItemStateManager.setDefaultState(DefaultAPItemState);
