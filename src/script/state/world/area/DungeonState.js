/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";
import StateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import MarkerListHandler from "/GameTrackerJS/util/MarkerListHandler.js";
import DefaultState from "/GameTrackerJS/state/world/area/DefaultState.js";

const TYPE = new WeakMap();
const LIST_HANDLER = new WeakMap();
const ACCESS = new WeakMap();
const ACCESS_MQ = new WeakMap();

function getAccessNeutralBoth(res_v, res_m) {
    if (res_v.value == AccessStateEnum.UNAVAILABLE || res_m.value == AccessStateEnum.UNAVAILABLE) {
        return AccessStateEnum.UNAVAILABLE;
    } else if (res_v.value == AccessStateEnum.POSSIBLE || res_m.value == AccessStateEnum.POSSIBLE) {
        return AccessStateEnum.POSSIBLE;
    } else if (res_v.value == AccessStateEnum.AVAILABLE || res_m.value == AccessStateEnum.AVAILABLE) {
        return AccessStateEnum.AVAILABLE;
    }
    return AccessStateEnum.OPENED;
}

function getAccessNeutralOne(res_v, res_m) {
    if (res_v.value == AccessStateEnum.AVAILABLE || res_m.value == AccessStateEnum.AVAILABLE) {
        return AccessStateEnum.AVAILABLE;
    } else if (res_v.value == AccessStateEnum.POSSIBLE || res_m.value == AccessStateEnum.POSSIBLE) {
        return AccessStateEnum.POSSIBLE;
    } else if (res_v.value == AccessStateEnum.UNAVAILABLE || res_m.value == AccessStateEnum.UNAVAILABLE) {
        return AccessStateEnum.UNAVAILABLE;
    }
    return AccessStateEnum.OPENED;
}

function getAccessNeutral(res_v, res_m) {
    if (SettingsStorage.get("unknown_dungeon_need_both")) {
        const value = getAccessNeutralBoth(res_v, res_m);
        return {
            done: Math.min(res_v.done, res_m.done),
            unopened: Math.min(res_v.done, res_m.done),
            reachable: Math.min(res_v.reachable, res_m.reachable),
            entrances: res_v.entrances && res_m.entrances,
            value
        };
    } else {
        const value = getAccessNeutralOne(res_v, res_m);
        return {
            done: Math.max(res_v.done, res_m.done),
            unopened: Math.max(res_v.done, res_m.done),
            reachable: Math.max(res_v.reachable, res_m.reachable),
            entrances: res_v.entrances || res_m.entrances,
            value
        };
    }
}

function internalTypeChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__applyTypeValue(change.value || "n");
    }
}

export default class DungeonState extends DefaultState {

    constructor(ref, props, areaData) {
        super(ref, props, areaData);
        /* --- */
        ACCESS.set(this, super.access);
        const listHandler = this.generateMQList();
        ACCESS_MQ.set(this, listHandler.access);
        LIST_HANDLER.set(this, listHandler);
        /* --- */
        this./*#*/__applyTypeValue(SavestateHandler.get("dungeontype", ref, "n"));
        /* EVENTS */
        EventBus.register("state::dungeontype", internalTypeChange.bind(this));
    }
    
    generateList() {
        const listHandler = new MarkerListHandler(this.areaData.lists["v"]);
        listHandler.addEventListener("access", event => {
            ACCESS.set(this, event.data);
            if (this.type == "v") {
                this.setAccess(event.data);
            } else if (this.type != "mq") {
                const acc_mq = ACCESS_MQ.get(this);
                const acc = getAccessNeutral(event.data, acc_mq);
                this.setAccess(acc);
            }
        });
        return listHandler;
    }
    
    generateMQList() {
        const listHandler = new MarkerListHandler(this.areaData.lists["mq"]);
        listHandler.addEventListener("access", event => {
            ACCESS_MQ.set(this, event.data);
            if (this.type == "mq") {
                this.setAccess(event.data);
            } else if (this.type != "v") {
                const acc_v = ACCESS.get(this);
                const acc = getAccessNeutral(acc_v, event.data);
                this.setAccess(acc);
            }
        });
        return listHandler;
    }

    /*#*/__applyTypeValue(newValue) {
        const type = TYPE.get(this);
        if (type != newValue) {
            TYPE.set(this, newValue);
            // access
            if (newValue == "v") {
                const acc_v = ACCESS.get(this);
                this.setAccess(acc_v);
            } else if (newValue == "mq") {
                const acc_mq = ACCESS_MQ.get(this);
                this.setAccess(acc_mq);
            } else {
                const acc_v = ACCESS.get(this);
                const acc_mq = ACCESS_MQ.get(this);
                const acc = getAccessNeutral(acc_v, acc_mq);
                this.setAccess(acc);
            }
            // external
            const event = new Event("type");
            event.data = newValue;
            this.dispatchEvent(event);
        }
    }

    stateLoaded(event) {
        const props = this.props;
        // type
        if (props["maxmq"] != null && props["related_dungeon"] != null) {
            const types = event.data.extra.dungeontype;
            if (types != null) {
                this./*#*/__applyTypeValue(types[props.related_dungeon]);
            } else {
                this./*#*/__applyTypeValue("n");
            }
        }
        // savesatate
        super.stateLoaded(event);
    }

    getList(type = this.type) {
        if (type == "v") {
            return super.getList();
        }
        if (type == "mq") {
            const listHandler = LIST_HANDLER.get(this);
            return Array.from(listHandler.list);
        }
    }

    getFilteredList(type = this.type) {
        if (type == "v") {
            return super.getFilteredList();
        }
        if (type == "mq") {
            const listHandler = LIST_HANDLER.get(this);
            return Array.from(listHandler.filtered);
        }
    }

    get type() {
        return TYPE.get(this);
    }

}

StateManager.register("dungeon", DungeonState);
StateManager.register("boss_dungeon", DungeonState);
