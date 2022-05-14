import {
    createMixin
} from "/emcJS/util/Mixin.js";
import LogicHandler from "../../util/handler/LogicHandler.js";

export default createMixin((superclass) => class StateVisibilityMixin extends superclass {

    #handler = null;

    constructor(ref, props = {}) {
        super(ref, props);

        this.#handler = new LogicHandler(props.visible);
        this.#handler.addEventListener("change", (event) => {
            const ev = new Event("visible");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
    }

    updateVisibility() {
        this.#handler.update();
    }

    get visible() {
        return this.#handler?.value ?? false;
    }

});
