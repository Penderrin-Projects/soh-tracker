import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateWorld from "../../abstract/StateWorld.js";
import Logic from "/script/util/logic/Logic.js";

const ACCESS = new WeakMap();
const VALUE = new WeakMap();

function internalChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.value = change.newValue;
    }
}

export default class DefaultState extends StateWorld {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        ACCESS.set(this, Logic.getValue(props.access));
        /* EVENTS */
        EventBus.register("state::location", internalChange.bind(this));
        EventBus.register("net::state::location", internalChange.bind(this));
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

    stateLoaded(event) {
        const ref = this.ref;
        // savesatate
        this.value = !!event.data.state[ref];
    }

    get access() {
        return ACCESS.get(this);
    }

    set value(value) {
        if (typeof value != "boolean") {
            value = !!value;
        }
        const old = this.value;
        if (value != old) {
            const ref = this.ref;
            VALUE.set(this, value);
            StateStorage.write(ref, this.value);
            // external
            const event = new Event("value");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state::location", {
                ref: ref,
                oldValue: old,
                newValue: this.value
            });
        }
    }

    get value() {
        return VALUE.get(this);
    }

}
