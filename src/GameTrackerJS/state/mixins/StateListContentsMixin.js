import {
    createMixin
} from "/emcJS/util/Mixin.js";
import LogicHandler from "../../util/handler/LogicHandler.js";

export default createMixin((superclass) => class StateListContentsMixin extends superclass {

    #handler = null;

    constructor(ref, props = {}) {
        super(ref, props);

        this.#handler = new LogicHandler(props.listContents);
        this.#handler.addEventListener("change", (event) => {
            const ev = new Event("listContents");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
    }

    updateListContents() {
        this.#handler.update();
    }

    get listContents() {
        return this.#handler?.value ?? false;
    }

});
