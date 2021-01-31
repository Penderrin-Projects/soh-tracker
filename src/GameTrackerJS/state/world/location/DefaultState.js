/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */
import SavestateHandler from "../../../savestate/SavestateHandler.js";
import Logic from "../../../util/logic/Logic.js";
import WorldElementState from "../../abstract/WorldElementState.js";
import FilterStorage from "/script/storage/FilterStorage.js";

const ACCESS = new WeakMap();
const VALUE = new WeakMap();

function internalChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setValue(change.value);
    }
}

export default class DefaultState extends WorldElementState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        ACCESS.set(this, Logic.getValue(props.access));
        /* EVENTS */
        EventBus.register("state::location", internalChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
        EventBus.register("logic", event => {
            const access = Logic.getValue(props.access);
            if (access != null) {
                const old = ACCESS.get(this);
                if (access != old) {
                    ACCESS.set(this, access);
                    // external
                    const ev = new Event("access");
                    ev.data = access;
                    this.dispatchEvent(ev);
                }
            }
        });
    }

    get visible() {
        const showDone = FilterStorage.get("filter.show_done", "true");
        const value = VALUE.get(this);
        return super.visible && (!value || showDone == "true");
    }

    stateLoaded(event) {
        const ref = this.ref;
        // savesatate
        this.value = !!event.data.state[ref];
    }

    get access() {
        return ACCESS.get(this);
    }

    /*#*/__setValue(value) {
        if (typeof value != "boolean") {
            value = !!value;
        }
        const old = VALUE.get(this);
        if (value != old) {
            const ref = this.ref;
            VALUE.set(this, value);
            SavestateHandler.set("", ref, value);
            // external
            const event = new Event("value");
            event.data = value;
            this.dispatchEvent(event);
        }
        return value;
    }

    set value(value) {
        const ref = this.ref;
        const old = VALUE.get(this);
        value = this./*#*/__setValue(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::location", { ref, value });
        }
    }

    get value() {
        return VALUE.get(this);
    }

}
