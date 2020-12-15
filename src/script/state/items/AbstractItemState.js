import NumberState from "/emcJS/data/state/NumberState.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateDataMixin from "../mixins/StateDataMixin.js";

export default class AbstractItemState extends StateDataMixin(NumberState) {

    constructor(ref, props, max, min) {
        super(ref, props, max, min);
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
