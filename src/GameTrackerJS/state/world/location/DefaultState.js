// frameworks
import EventBus from "/emcJS/event/EventBus.js";
import Helper from "/emcJS/util/helper/Helper.js";

import SavestateHandler from "../../../savestate/SavestateHandler.js";
import Logic from "../../../util/logic/Logic.js";
import FilteredState from "../../abstract/FilteredState.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";

const ACCESS = new WeakMap();
const REACHABLE = new WeakMap();
const VALUE = new WeakMap();

export default class DefaultState extends FilteredState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        VALUE.set(this, SavestateHandler.get("", ref, false));
        REACHABLE.set(this, Logic.getValue(props.access));
        ACCESS.set(this, this.getAccessValue(VALUE.get(this), REACHABLE.get(this)));
        /* EVENTS */
        EventBus.register("state::location", (event) => {
            const ref = this.ref;
            // savesatate
            const change = event.data;
            if (change != null && change.ref == ref) {
                this./*#*/__setValue(change.value);
            }
        });
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
        EventBus.register("logic", event => {
            const reachable = Logic.getValue(props.access);
            if (reachable != null) {
                const old = REACHABLE.get(this);
                if (reachable != old) {
                    REACHABLE.set(this, reachable);
                    this.refreshAccess();
                }
            }
        });
    }

    getAccessValue(checked, reachable) {
        const res = {
            done: 0,
            unopened: 0,
            reachable: 0,
            entrances: false,
            value: AccessStateEnum.OPENED
        };
        if (checked) {
            res.done = 1;
        } else if (reachable) {
            res.unopened = 1;
            res.reachable = 1;
            res.value = AccessStateEnum.AVAILABLE;
        } else {
            res.unopened = 1;
            res.value = AccessStateEnum.UNAVAILABLE;
        }
        return res;
    }

    executeSpecialFilter(name) {
        switch (name) {
            case "access": return REACHABLE.get(this);
            case "!access": return !REACHABLE.get(this);
            case "done": return VALUE.get(this);
            case "!done": return !VALUE.get(this);
        }
        return super.executeSpecialFilter(name);
    }

    refreshAccess() {
        const value = this.value;
        const reachable = REACHABLE.get(this);
        const access = this.getAccessValue(value, reachable);
        const old = ACCESS.get(this);
        if (!Helper.isEqual(access, old)) {
            ACCESS.set(this, access);
            // external
            const ev = new Event("access");
            ev.data = access;
            this.dispatchEvent(ev);
        }
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
            this.refreshAccess();
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
            EventBus.trigger("state::location", {ref, value});
        }
    }

    get value() {
        return VALUE.get(this);
    }

}
