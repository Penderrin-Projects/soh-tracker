import IntegerState from "/emcJS/data/state/IntegerState.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateDataMixin from "/script/state/mixins/StateDataMixin.js";

export default class DefaultState extends StateDataMixin(IntegerState) {

    constructor(ref, props, min, max) {
        super(ref, props, min, max);
        /* --- */
        this.value = StateStorage.read(ref, 0);
    }

    convert(value) {
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

    set value(value) {
        const old = this.value;
        super.value = value;
        if (this.value != old) {
            StateStorage.write(this.ref, this.value);
        }
    }

    get value() {
        return super.value;
    }

}
