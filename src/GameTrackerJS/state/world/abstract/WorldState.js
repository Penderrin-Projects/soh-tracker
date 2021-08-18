import SavestateHandler from "../../../savestate/SavestateHandler.js";
import FilteredState from "../../abstract/FilteredState.js";

export default class WorldState extends FilteredState {

    constructor(ref, props = {}) {
        super(ref, props);
        /* --- */
        SavestateHandler.addEventListener("beforeload", event => {
            this.beforeStateLoad();
        });
        SavestateHandler.addEventListener("load", event => {
            this.onStateLoad(event.state);
        });
    }

    beforeStateLoad() {
        // nothing
    }

    onStateLoad(state) {
        // nothing
    }

}
