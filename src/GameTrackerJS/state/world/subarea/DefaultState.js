// frameworks
import EventBus from "/emcJS/event/EventBus.js";

import AbstractAreaState from "../abstract/AreaState.js";
import "../location/StateManager.js";

export default class DefaultState extends AbstractAreaState {

    constructor(ref, props, areaData) {
        super(ref, props, areaData);
        /* EVENTS */
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
    }

    stateLoaded(event) {
        // nothing
    }

    set hint(value) {
        // nothing
    }

    get hint() {
        return "";
    }

    get listContents() {
        return true;
    }

}
