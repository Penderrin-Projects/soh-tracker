// frameworks
import EventBus from "/emcJS/event/EventBus.js";

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";
import AreaStateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import MarkerListHandler, {defaultAccess as defaultMarkerAccess} from "/GameTrackerJS/util/handler/MarkerListHandler.js";
import DefaultAreaState from "/GameTrackerJS/state/world/area/DefaultState.js";

const TYPE = new WeakMap();
const LIST_HANDLER = new WeakMap();

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

export default class DungeonState extends DefaultAreaState {

    constructor(ref, props, areaData) {
        super(ref, props, areaData);
        /* --- */
        const listHandler = this.generateMQList();
        LIST_HANDLER.set(this, listHandler);
        /* --- */
        this./*#*/__applyTypeValue(SavestateHandler.get("dungeontype", ref, "n"));
        /* EVENTS */
        EventBus.register("state::dungeontype", internalTypeChange.bind(this));
    }

    onStateLoad(state) {
        super.onStateLoad(state);
        const props = this.props;
        // type
        if (props["maxmq"] != null && props["related_dungeon"] != null) {
            const types = state?.data?.["dungeontype"];
            if (types != null) {
                this./*#*/__applyTypeValue(types[props.related_dungeon]);
            } else {
                this./*#*/__applyTypeValue("n");
            }
        }
    }

    /*#*/__applyTypeValue(newValue) {
        const type = TYPE.get(this);
        if (type != newValue) {
            TYPE.set(this, newValue);
            // external
            const ev = new Event("type");
            ev.data = newValue;
            this.dispatchEvent(ev);
            
            const ev2 = new Event("access");
            ev2.data = this.access;
            this.dispatchEvent(ev2);
        }
    }

    get type() {
        return TYPE.get(this);
    }

    get access() {
        return this.getAccess();
    }

    getAccess(type = this.type) {
        if (type == "v") {
            return this.getAccessV();
        } else if (type == "mq") {
            return this.getAccessMQ();
        } else {
            const acc_v = this.getAccessV();
            const acc_mq = this.getAccessMQ();
            const acc = getAccessNeutral(acc_v, acc_mq);
            return acc;
        }
    }

    getAccessV() {
        return super.access;
    }

    getAccessMQ() {
        const listHandler = LIST_HANDLER.get(this);
        return listHandler.access ?? defaultMarkerAccess;
    }

    /* list */
    generateList() {
        const listHandler = new MarkerListHandler(this.props.list, `${this.ref}/v`);
        listHandler.addEventListener("access", event => {
            if (this.type == "v") {
                const ev = new Event("access");
                ev.data = event.data;
                this.dispatchEvent(ev);
            } else if (this.type != "mq") {
                const acc_mq = this.getAccessMQ();
                const acc = getAccessNeutral(event.data, acc_mq);
                const ev = new Event("access");
                ev.data = acc;
                this.dispatchEvent(ev);
            }
        });
        listHandler.addEventListener("change", event => {
            if (this.type != "mq") {
                this.checkAllFilter();
                if (event.list != null) {
                    const ev = new Event("list_update");
                    ev.data = event.list;
                    this.dispatchEvent(ev);
                }
            }
        });
        return listHandler;
    }
    
    generateMQList() {
        const listHandler = new MarkerListHandler(this.props.list_mq, `${this.ref}/mq`);
        listHandler.addEventListener("access", event => {
            if (this.type == "mq") {
                const ev = new Event("access");
                ev.data = event.data;
                this.dispatchEvent(ev);
            } else if (this.type != "v") {
                const acc_v = this.getAccessV();
                const acc = getAccessNeutral(acc_v, event.data);
                const ev = new Event("access");
                ev.data = acc;
                this.dispatchEvent(ev);
            }
        });
        listHandler.addEventListener("change", event => {
            if (this.type != "v") {
                this.checkAllFilter();
                if (event.list != null) {
                    const ev = new Event("list_update");
                    ev.data = event.list;
                    this.dispatchEvent(ev);
                }
            }
        });
        return listHandler;
    }

    getRawList(type = this.type) {
        if (type == "v") {
            return super.getRawList();
        }
        if (type == "mq") {
            const listHandler = LIST_HANDLER.get(this);
            return Array.from(listHandler.rawList);
        }
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
            return Array.from(listHandler.filteredList);
        }
    }

    setAllEntries(value = true) {
        const type = TYPE.get(this);
        if (type == "mq") {
            const listHandler = LIST_HANDLER.get(this);
            listHandler.setAllEntries(value);
        } else if (type == "v") {
            super.setAllEntries(value);
        }
    }

}

AreaStateManager.register("dungeon", DungeonState);
AreaStateManager.register("boss_dungeon", DungeonState);
