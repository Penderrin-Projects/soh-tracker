import {
    createMixin
} from "/emcJS/util/Mixin.js";
import FilterHandler from "../../util/handler/FilterHandler.js";

export default createMixin((superclass) => class StateFilterMixin extends superclass {

    #handler = null;

    constructor(ref, props = {}) {
        super(ref, props);

        this.#handler = new FilterHandler(props.filter);
        this.#handler.addEventListener("change", (event) => {
            const ev = new Event("filtered");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
    }

    updateFiltered() {
        this.#handler.update();
    }

    get filtered() {
        return this.#handler?.value ?? false;
    }

});
