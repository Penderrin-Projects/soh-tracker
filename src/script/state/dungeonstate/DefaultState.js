import EventBus from "/emcJS/event/EventBus.js";
import WorldRegistry from "/GameTrackerJS/registry/WorldRegistry.js";
import StateData from "/GameTrackerJS/state/abstract/StateData.js";
import StateStorage from "/script/storage/StateStorage.js";

const TYPE = new WeakMap();
const REWARD = new WeakMap();

function internalTypeChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.value = change.newValue;
    }
}

function networkTypeChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.value = change.newValue;
    }
}

function internalRewardChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.reward = change.newValue;
    }
}

function networkRewardChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.reward = change.newValue;
    }
}

export default class DefaultState extends StateData {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        const data = WorldRegistry.get(ref);
        if (data != null) {
            if (data.areaData.lists == null) {
                this.type = "v";
            } else {
                this.type = StateStorage.readExtra("dungeontype", ref, "n");
            }
        } else {
            this.type = "v";
        }
        this.reward = StateStorage.readExtra("dungeonreward", ref, "");
        /* EVENTS */
        EventBus.register("state::dungeontype", internalTypeChange.bind(this));
        EventBus.register("net::state::dungeontype", networkTypeChange.bind(this));
        EventBus.register("state::dungeonreward", internalRewardChange.bind(this));
        EventBus.register("net::state::dungeonreward", networkRewardChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
    }

    stateLoaded(event) {
        const ref = this.ref;
        if (ref) {
            // type
            const data = WorldRegistry.get(ref);
            if (data != null) {
                if (data.areaData.lists == null) {
                    this.type = "v";
                } else if (event.data.extra.dungeontype != null) {
                    const state = event.data.extra.dungeontype[ref];
                    if (typeof state != "undefined" && state != "") {
                        this.type = state;
                    } else {
                        this.type = "n";
                    }
                } else {
                    this.type = "n";
                }
            } else {
                this.type = "v";
            }
            // reward
            if (event.data.extra.dungeonreward != null) {
                const value = event.data.extra.dungeonreward[ref];
                if (value != null) {
                    this.reward = value;
                } else {
                    this.reward = "";
                }
            } else {
                this.reward = "";
            }
        } else {
            this.type = "v";
            this.reward = "";
        }
    }

    set type(value) {
        if (value != null) {
            const old = this.type;
            if (value != old) {
                TYPE.set(this, value);
                StateStorage.writeExtra("dungeontype", this.ref, this.type);
                // external
                const event = new Event("type");
                event.data = value;
                this.dispatchEvent(event);
                // internal
                EventBus.trigger("state::dungeontype", {
                    ref: this.ref,
                    oldValue: old,
                    newValue: this.type
                });
            }
        }
    }

    get type() {
        return TYPE.get(this);
    }

    set reward(value) {
        if (value != null) {
            const old = this.reward;
            if (value != old) {
                REWARD.set(this, value);
                StateStorage.writeExtra("dungeonreward", this.ref, this.reward);
                // external
                const event = new Event("reward");
                event.data = value;
                this.dispatchEvent(event);
                // internal
                EventBus.trigger("state::dungeonreward", {
                    ref: this.ref,
                    oldValue: old,
                    newValue: this.reward
                });
            }
        }
    }

    get reward() {
        return REWARD.get(this);
    }

}
