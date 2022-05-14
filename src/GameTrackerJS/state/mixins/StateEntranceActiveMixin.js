import {
    createMixin
} from "/emcJS/util/Mixin.js";
import LogicHandler from "../../util/handler/LogicHandler.js";

export default createMixin((superclass) => class StateEntranceActiveMixin extends superclass {

    #handler = null;

    constructor(ref, props = {}) {
        super(ref, props);

        this.#handler = new LogicHandler(props.entranceActive);
        this.#handler.addEventListener("change", (event) => {
            const ev = new Event("active");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
    }

    updateActive() {
        this.#handler.update();
    }

    get active() {
        return this.#handler?.value ?? false;
    }

});
