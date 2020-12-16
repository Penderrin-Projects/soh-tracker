import BoolState from "/emcJS/data/state/BoolState.js";
import StateStorage from "/script/storage/StateStorage.js";
import FilterMixin from "/script/state/mixins/FilterMixin.js";

export default class DefaultState extends FilterMixin(BoolState) {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        this.value = StateStorage.read(ref, false);
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
