// frameworks
import EventBus from "/emcJS/event/EventBus.js";

import SavestateHandler from "../../../savestate/SavestateHandler.js";
import AreaState from "../abstract/AreaState.js";
import "../location/StateManager.js";

const HINT = new WeakMap();

export default class DefaultState extends AreaState {

    constructor(ref, props, areaData) {
        super(ref, props, areaData);
        /* --- */
        this.hint = SavestateHandler.get("area_hint", ref, "");
        /* EVENTS */
        EventBus.register("state::area_hint", (event) => {
            const ref = this.ref;
            // savesatate
            const change = event.data;
            if (change != null && change.ref == ref) {
                this./*#*/__setHint(change.value);
            }
        });
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
    }

    stateLoaded(event) {
        const ref = this.ref;
        // hint
        if (event.data.extra["area_hint"] != null) {
            this.hint = event.data.extra["area_hint"][ref] ?? "";
        } else {
            this.hint = "";
        }
    }

    /*#*/__setHint(value) {
        const ref = this.ref;
        if (typeof value != "string" || (value != "woth" && value != "barren")) {
            value = "";
        }
        const old = this.hint;
        if (value != old) {
            HINT.set(this, value);
            SavestateHandler.set("area_hint", ref, value);
            // external
            const event = new Event("hint");
            event.data = value;
            this.dispatchEvent(event);
        }
        return value;
    }

    set hint(value) {
        const ref = this.ref;
        const old = this.hint;
        value = this./*#*/__setHint(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::area_hint", {ref, value});
        }
    }

    get hint() {
        return HINT.get(this);
    }

}
