// frameworks
import EventBus from "/emcJS/event/EventBus.js";


// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import AreaStateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import DataState from "/GameTrackerJS/state/DataState.js";
// Track-OOT
import "/script/state/world/CustomWorldStates.js";

const TYPE = new WeakMap();
const REWARD = new WeakMap();

function internalTypeChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setType(change.value);
    }
}

function internalRewardChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setReward(change.value);
    }
}

export default class DefaultState extends DataState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        const state = AreaStateManager.get(ref);
        if (state != null) {
            if (state.props.list_mq == null) {
                this.type = "v";
            } else {
                this.type = SavestateHandler.get("dungeontype", ref, "n");
            }
        } else {
            this.type = "v";
        }
        this.reward = SavestateHandler.get("dungeonreward", ref, "");
        /* EVENTS */
        EventBus.register("state::dungeontype", internalTypeChange.bind(this));
        EventBus.register("state::dungeonreward", internalRewardChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
    }

    stateLoaded(event) {
        const ref = this.ref;
        if (ref) {
            // type
            const state = AreaStateManager.get(ref);
            if (state != null) {
                if (state.props.list_mq == null) {
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

    /*#*/__setType(value) {
        const ref = this.ref;
        if (value != null) {
            const old = this.type;
            if (value != old) {
                TYPE.set(this, value);
                SavestateHandler.set("dungeontype", ref, value);
                // external
                const event = new Event("type");
                event.data = value;
                this.dispatchEvent(event);
            }
            return value;
        }
    }
    
    set type(value) {
        const ref = this.ref;
        const old = this.reward;
        value = this./*#*/__setType(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::dungeontype", {ref, value});
        }
    }

    get type() {
        return TYPE.get(this);
    }

    /*#*/__setReward(value) {
        const ref = this.ref;
        if (value != null) {
            const old = this.reward;
            if (value != old) {
                REWARD.set(this, value);
                SavestateHandler.set("dungeonreward", ref, value);
                // external
                const event = new Event("reward");
                event.data = value;
                this.dispatchEvent(event);
            }
            return value;
        }
    }
    
    set reward(value) {
        const ref = this.ref;
        const old = this.reward;
        value = this./*#*/__setReward(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::dungeonreward", {ref, value});
        }
    }

    get reward() {
        return REWARD.get(this);
    }

}
