/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";
import WorldStateManagers from "/GameTrackerJS/state/world/StateManagers.js";
import StateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import FilteredState from "/GameTrackerJS/state/abstract/FilteredState.js";
import ListLogic from "/GameTrackerJS/util/logic/ListLogic.js";

// TODO check if this can extend the area state from the same folder

const AREA_DATA = new WeakMap();
const ACCESS = new WeakMap();
const LIST = new WeakMap();
const FILTERED_LIST = new WeakMap();
const LIST_MQ = new WeakMap();
const FILTERED_LIST_MQ = new WeakMap();
const TYPE = new WeakMap();
const HINT = new WeakMap();

function internalHintChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setHint(change.value);
    }
}

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

export default class DungeonState extends FilteredState {

    constructor(ref, props, areaData) {
        super(ref, props);
        /* --- */
        this.hint = SavestateHandler.get("area_hint", ref, "");
        AREA_DATA.set(this, areaData);
        this./*#*/__applyTypeValue(SavestateHandler.get("dungeontype", ref, "n"));
        ACCESS.set(this, ListLogic.DEFAULT);
        const [entityList, filteredEntityList, entityListMQ, filteredEntityListMQ] = this.generateLists();
        LIST.set(this, entityList);
        FILTERED_LIST.set(this, filteredEntityList);
        LIST_MQ.set(this, entityListMQ);
        FILTERED_LIST_MQ.set(this, filteredEntityListMQ);
        this.refreshAccess();
        /* EVENTS */
        EventBus.register("state::dungeontype", internalTypeChange.bind(this));
        EventBus.register("state::area_hint", internalHintChange.bind(this));
    }

    generateLists() {
        const entityList = new Map();
        const filteredEntityList = new Map();
        const entityListMQ = new Map();
        const filteredEntityListMQ = new Map();
        const areaData = AREA_DATA.get(this);
        if (areaData != null) {
            const list = areaData.lists["v"];
            if (list != null) {
                list.forEach(record => {
                    const loc = WorldStateManagers.get(record.category, record.id);
                    if (loc != null) {
                        if (record.category != "area" && record.category != "exit") {
                            loc.addEventListener("access", event => {
                                if (loc.isVisible()) {
                                    this.refreshAccess();
                                }
                            });
                        }
                        loc.addEventListener("visible", () => {
                            if (loc.isVisible()) {
                                filteredEntityList.delete(loc);
                            } else {
                                filteredEntityList.set(loc, entityList.get(loc));
                            }
                            this.refreshAccess();
                        });
                        loc.addEventListener("filter", () => {
                            if (loc.isVisible()) {
                                filteredEntityList.delete(loc);
                            } else {
                                filteredEntityList.set(loc, entityList.get(loc));
                            }
                            this.refreshAccess();
                        });
                        entityList.set(loc, record);
                        if (loc.isVisible()) {
                            filteredEntityList.set(loc, record);
                        }
                    }
                });
            }
            const listMQ = areaData.lists["mq"];
            if (listMQ != null) {
                listMQ.forEach(record => {
                    const loc = WorldStateManagers.get(record.category, record.id);
                    if (loc != null) {
                        if (record.category != "area" && record.category != "exit") {
                            loc.addEventListener("access", event => {
                                if (loc.isVisible()) {
                                    this.refreshAccess();
                                }
                            });
                        }
                        loc.addEventListener("visible", () => {
                            if (loc.isVisible()) {
                                filteredEntityListMQ.delete(loc);
                            } else {
                                filteredEntityListMQ.set(loc, entityListMQ.get(loc));
                            }
                            this.refreshAccess();
                        });
                        loc.addEventListener("filter", () => {
                            if (loc.isVisible()) {
                                filteredEntityListMQ.delete(loc);
                            } else {
                                filteredEntityListMQ.set(loc, entityListMQ.get(loc));
                            }
                            this.refreshAccess();
                        });
                        entityListMQ.set(loc, record);
                        if (loc.isVisible()) {
                            filteredEntityListMQ.set(loc, record);
                        }
                    }
                });
            }
        }
        return [entityList, filteredEntityList, entityListMQ, filteredEntityListMQ];
    }

    refreshAccess() {
        const access = this.calculateAvailability();
        if (access != null) {
            const old = ACCESS.get(this);
            if (old != access) {
                ACCESS.set(this, access);
                // external
                const event = new Event("access");
                event.data = access;
                this.dispatchEvent(event);
            }
        }
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
            const list = this./*#*/__getFilteredList();
            const res = {
                done: 0,
                unopened: 0,
                reachable: 0,
                entrances: false,
                value: AccessStateEnum.OPENED
            };
            if (list != null) {
                for (const [loc, record] of list) {
                    if (record.category != "area" && record.category != "exit") {
                        const {done, unopened, reachable, entrances} = loc.access;
                        res.done += done;
                        res.unopened += unopened;
                        res.reachable += reachable;
                        res.entrances = res.entrances || entrances;
                    }
                }
                if (res.unopened > 0) {
                    if (res.reachable > 0) {
                        if (res.unopened == res.reachable) {
                            res.value = AccessStateEnum.AVAILABLE;
                        } else {
                            res.value = AccessStateEnum.POSSIBLE;
                        }
                    } else {
                        res.value = AccessStateEnum.UNAVAILABLE;
                    }
                }
            }
            return res;
        }
    }

    /*#*/__getList(type = this.type) {
        if (type == "v") {
            return LIST.get(this);
        } else if (type == "mq") {
            return LIST_MQ.get(this);
        }
    }

    getList(type = this.type) {
        const list = this./*#*/__getList(type);
        return Array.from(list.values());
    }

    /*#*/__getFilteredList(type = this.type) {
        if (type == "v") {
            return FILTERED_LIST.get(this);
        } else if (type == "mq") {
            return FILTERED_LIST_MQ.get(this);
        }
    }

    getFilteredList(type = this.type) {
        const list = this./*#*/__getFilteredList(type);
        return Array.from(list.values());
    }

    stateLoaded(event) {
        const ref = this.ref;
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
        // hint
        if (event.data.extra["area_hint"] != null) {
            this.hint = event.data.extra["area_hint"][ref] ?? "";
        } else {
            this.hint = "";
        }
    }

    get areaData() {
        return AREA_DATA.get(this);
    }

    get access() {
        return ACCESS.get(this);
    }

    setAllEntries(value = true) {
        const list = this./*#*/__getFilteredList();
        if (list != null) {
            for (const [loc, record] of list) {
                if (record.category != "area" && record.category != "exit") {
                    if (record.category == "location") {
                        loc.value = value;
                    } else {
                        loc.setAllEntries(value);
                    }
                }
            }
        }
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

    get type() {
        return TYPE.get(this);
    }

    /*#*/__setHint(value) {
        const ref = this.ref;
        if (typeof value != "string" || (value != "woth" && value != "barren")) {
            value = "";
        }
        const old = this.hint;
        if (value != old) {
            HINT.set(this, value);
            SavestateHandler.set("area_hint", ref, value);
            // external
            const event = new Event("hint");
            event.data = value;
            this.dispatchEvent(event);
        }
        return value;
    }

    set hint(value) {
        const ref = this.ref;
        const old = this.hint;
        value = this./*#*/__setHint(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::area_hint", { ref, value });
        }
    }

    get hint() {
        return HINT.get(this);
    }

}

StateManager.register("dungeon", DungeonState);
StateManager.register("boss_dungeon", DungeonState);
