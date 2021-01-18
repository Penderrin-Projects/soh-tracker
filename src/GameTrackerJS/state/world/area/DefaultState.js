import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import AreaState from "../../abstract/AreaState.js";

const HINT = new WeakMap();

function internalHintChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setHint(change.value);
    }
}

export default class DefaultState extends AreaState {

    constructor(ref, props, areaData) {
        super(ref, props, areaData);
        /* --- */
        this.hint = StateStorage.readExtra("area_hint", ref, "");
        /* EVENTS */
        EventBus.register("state::area_hint", internalHintChange.bind(this));
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
            StateStorage.writeExtra("area_hint", ref, value);
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
