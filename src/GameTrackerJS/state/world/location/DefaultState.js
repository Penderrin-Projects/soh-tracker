// frameworks
import EventBus from "/emcJS/event/EventBus.js";
import Helper from "/emcJS/util/Helper.js";

import SavestateHandler from "../../../savestate/SavestateHandler.js";
import ItemStateManager from "../../../state/item/StateManager.js";
import Logic from "../../../util/logic/Logic.js";
import FilteredState from "../../abstract/FilteredState.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";

const ACCESS = new WeakMap();
const REACHABLE = new WeakMap();
const VALUE = new WeakMap();
const ITEM = new WeakMap();
const ITEM_DATA = new WeakMap();

export default class DefaultLocationState extends FilteredState {

    constructor(ref, props) {
        super(ref, props);
        /* EVENTS */
        EventBus.register("state::location", (event) => {
            const ref = this.ref;
            // savesatate
            const change = event.data;
            if (change != null && change.ref == ref) {
                this./*#*/__setValue(change.value);
            }
        });
        EventBus.register("state::location_item", (event) => {
            const ref = this.ref;
            // savesatate
            const change = event.data;
            if (change != null && change.ref == ref) {
                this./*#*/__setItem(change.value);
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

    initValues() {
        super.initValues();
        const ref = this.ref;
        const props = this.props;
        VALUE.set(this, SavestateHandler.get("", ref, false));
        REACHABLE.set(this, Logic.getValue(props.access));
        ACCESS.set(this, this.getAccessValue(VALUE.get(this), REACHABLE.get(this)));
        const item = SavestateHandler.get("item_location", ref, "");
        ITEM.set(this, item);
        if (item) {
            const itemData = ItemStateManager.get(item);
            ITEM_DATA.set(this, itemData?.props);
        }
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
        // item
        if (event.data.extra["item_location"] != null && event.data.extra["item_location"][ref] != null) {
            this.item = event.data.extra["item_location"][ref];
        } else {
            this.item = "";
        }
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
            EventBus.trigger("state::location", { ref, value });
        }
    }

    get value() {
        return VALUE.get(this);
    }

    /*#*/__setItem(value) {
        const ref = this.ref;
        if (typeof value != "string") value = "";
        const old = this.item;
        if (value != old) {
            ITEM.set(this, value);
            SavestateHandler.set("item_location", ref, value);
            // item data
            if (value) {
                const itemData = ItemStateManager.get(value);
                ITEM_DATA.set(this, itemData?.props);
            } else {
                ITEM_DATA.delete(this);
            }
            // external
            const event = new Event("item");
            event.data = value;
            this.dispatchEvent(event);
        }
        return value;
    }

    set item(value) {
        const ref = this.ref;
        const old = this.reward;
        value = this./*#*/__setItem(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::location_item", {ref, value});
        }
    }

    get item() {
        return ITEM.get(this);
    }

    get itemData() {
        if (ITEM_DATA.has(this)) {
            return ITEM_DATA.get(this);
        }
    }

}
