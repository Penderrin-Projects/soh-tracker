/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */

// GameTrackerJS
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";
import WorldRegistry from "/GameTrackerJS/registry/WorldRegistry.js";
import StateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import DefaultState from "/GameTrackerJS/state/world/area/DefaultState.js";
import ListLogic from "/GameTrackerJS/util/logic/ListLogic.js";
// Track-OOT
import StateStorage from "/script/storage/StateStorage.js";

const TYPE = new WeakMap();

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
        this./*#*/__applyTypeValue(StateStorage.readExtra("dungeontype", ref, "n"));
        /* EVENTS */
        EventBus.register("state::dungeontype", internalTypeChange.bind(this));
    }

    /*#*/__applyTypeValue(newValue) {
        const type = TYPE.get(this);
        if (type != newValue) {
            TYPE.set(this, newValue);
            this.refreshAccess();
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

    calculateAvailability() {
        const type = TYPE.get(this);
        if (type == "n") {
            let res;
            const listV = this.getFilteredList("v");
            if (listV != null) {
                res = ListLogic.check(listV);
            }
            const listM = this.getFilteredList("mq");
            if (listM != null) {
                const resM = ListLogic.check(listM);
                if (res != null) {
                    res = getAccessNeutral(res, resM);
                } else {
                    res = resM;
                }
            }
            return res;
        } else {
            const list = this.getFilteredList();
            if (list != null) {
                const res = ListLogic.check(list);
                if (res != null) {
                    return res;
                }
            }
        }
        return ListLogic.DEFAULT;
    }

    getFilteredList(type = this.type) {
        const areaData = this.areaData;
        if (areaData != null) {
            const list = areaData.lists[type];
            if (list != null) {
                const result = [];
                list.forEach(record => {
                    const id = `${record.category}/${record.id}`;
                    const loc = WorldRegistry.get(id);
                    if (!!loc && loc.visible) {
                        result.push(record);
                    }
                });
                return result;
            }
        }
    }

    get type() {
        return TYPE.get(this);
    }

}

StateManager.register("dungeon", DungeonState);
StateManager.register("boss_dungeon", DungeonState);
