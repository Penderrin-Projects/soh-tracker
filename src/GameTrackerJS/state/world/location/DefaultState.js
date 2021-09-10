// frameworks
import EventBus from "/emcJS/event/EventBus.js";
import Helper from "/emcJS/util/Helper.js";
import { mix } from "/emcJS/util/Mixin.js";

import Logic from "../../../util/logic/Logic.js";
import SavestateHandler from "../../../savestate/SavestateHandler.js";
import WorldState from "../WorldState.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";
import ItemStateManager from "../../../state/item/StateManager.js";

const ACCESS = new WeakMap();
const REACHABLE = new WeakMap();
const VALUE = new WeakMap();
const ITEM = new WeakMap();
const ITEM_DATA = new WeakMap();

export default class DefaultLocationState extends WorldState {

    constructor(ref, props) {
        super(ref, props);
        this.initValues();
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
            const reachable = Logic.getValue(props.logicAccess);
            if (reachable != null) {
                const old = REACHABLE.get(this);
                if (reachable != old) {
                    REACHABLE.set(this, reachable);
                    this.refreshAccess();
                }
            }
        });
        /* --- */
        setTimeout(() => {
            this.refreshAccess();
        }, 0);
    }

    onStateLoad(state) {
        // TODO
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

    initValues() {
        const ref = this.ref;
        const props = this.props;
        VALUE.set(this, SavestateHandler.get("", `location/${ref}`, false)); // XXX remove "location/"
        REACHABLE.set(this, Logic.getValue(props.logicAccess));
        ACCESS.set(this, {
            done: 0,
            unopened: 0,
            reachable: 0,
            total: 1,
            value: AccessStateEnum.OPENED,
            entrances: 0
        });
        const item = SavestateHandler.get("item_location", `location/${ref}`, ""); // XXX remove "location/"
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
            total: 1,
            value: AccessStateEnum.OPENED,
            entrances: 0
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
            SavestateHandler.set("", `location/${ref}`, value); // XXX remove "location/"
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
            SavestateHandler.set("item_location", `location/${ref}`, value); // XXX remove "location/"
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
