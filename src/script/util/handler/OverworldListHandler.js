// frameworks
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import Helper from "/emcJS/util/helper/Helper.js";

import LocationStateManager from "/GameTrackerJS/state/world/location/StateManager.js";
import AreaStateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";

const ACCESS = new WeakMap();
const LIST_RESOLVED = new WeakMap();
const LIST_FILTERED = new WeakMap();

export default class OverworldListHandler extends EventTarget {

    constructor() {
        super();
        /* --- */
        ACCESS.set(this, DEFAULT_ACCESS);
        setTimeout(() => {
            this./*#*/__generateList();
            this./*#*/__refreshAccess();
        }, 0);
    }

    /*#*/__generateList() {
        const usedLocations = new Set();
        const dungeonList = new Map();
        const entityList = new Map();
        const filteredEntityList = new Map();
        for (const [, area] of AreaStateManager) {
            if (DUNGEON_TYPES.includes(area.props.type)) {
                dungeonList.add(area);
                const eventManager = new EventTargetManager(area);
                eventManager.set("access", () => {
                    this./*#*/__refreshAccess();
                });
                /* --- */
                const listV = area.props.list.filter(r => r.category == "location").map(r => r.id);
                const listMQ = area.props.list_mq.filter(r => r.category == "location").map(r => r.id);
                for (const entry of listV) {
                    usedLocations.add(entry);
                }
                for (const entry of listMQ) {
                    usedLocations.add(entry);
                }
            }
        }
        for (const [key, loc] of LocationStateManager) {
            if (!usedLocations.has(key)) {
                const record = {
                    "id": key,
                    "x": 0,
                    "y": 0,
                    "category": "location"
                };
                entityList.set(loc, record);
                if (loc.isVisible()) {
                    filteredEntityList.set(loc, record);
                }
                /* event manager */
                const eventManager = new EventTargetManager(loc);
                eventManager.set("access", () => {
                    if (filteredEntityList.has(loc)) {
                        this./*#*/__refreshAccess();
                    }
                });
                eventManager.set("visiblity", () => {
                    if (loc.isVisible()) {
                        if (!filteredEntityList.has(loc)) {
                            filteredEntityList.set(loc, entityList.get(loc));
                            this./*#*/__refreshAccess();
                        }
                    } else {
                        if (filteredEntityList.has(loc)) {
                            filteredEntityList.delete(loc);
                            this./*#*/__refreshAccess();
                        }
                    }
                });
            }
        }
        /* --- */
        DUNGEON_LIST.set(this, dungeonList);
        LIST_RESOLVED.set(this, entityList);
        LIST_FILTERED.set(this, filteredEntityList);
        this.updateVisible();
        // external
        const ev = new Event("change");
        ev.data = this.list;
        this.dispatchEvent(ev);
    }

    /*#*/__setAccess(value) {
        if (value != null) {
            const old = ACCESS.get(this);
            if (!Helper.isEqual(old, value)) {
                ACCESS.set(this, value);
                // external
                const event = new Event("access");
                event.data = value;
                this.dispatchEvent(event);
            }
        }
    }

    /*#*/__refreshAccess() {
        const entityList = LIST_FILTERED.get(this);
        const dungeonList = DUNGEON_LIST.get(this);
        const access = {
            done_min: 0,
            done_max: 0,
            unopened_min: 0,
            unopened_max: 0,
            reachable_min: 0,
            reachable_max: 0,
            total_min: 0,
            total_max: 0,
            value: AccessStateEnum.OPENED
        };
        for (const [loc] of entityList) {
            if (loc.isVisible()) {
                const {done, unopened, reachable, total, value} = loc.access;
                access.done_min += done;
                access.done_max += done;
                access.unopened_min += unopened;
                access.unopened_max += unopened;
                access.reachable_min += reachable;
                access.reachable_max += reachable;
                access.total_min += total;
                access.total_max += total;
            }
        }
        for (const area of dungeonList) {
            if (area.type == "v" || area.type == "mq") {
                const {done, unopened, reachable, total} = area.access;
                access.done_min += done;
                access.done_max += done;
                access.unopened_min += unopened;
                access.unopened_max += unopened;
                access.reachable_min += reachable;
                access.reachable_max += reachable;
                access.total_min += total;
                access.total_max += total;
            } else {
                const {doneV, unopenedV, reachableV, totalV} = area.getAccess("v");
                const {doneMQ, unopenedMQ, reachableMQ, totalMQ} = area.getAccess("mq");
                if (doneV < doneMQ) {
                    done_min += doneV;
                    done_max += doneMQ;
                } else {
                    done_min += doneMQ;
                    done_max += doneV;
                }
                if (unopenedV < unopenedMQ) {
                    unopened_min += unopenedV;
                    unopened_max += unopenedMQ;
                } else {
                    unopened_min += unopenedMQ;
                    unopened_max += unopenedV;
                }
                if (reachableV < reachableMQ) {
                    reachable_min += reachableV;
                    reachable_max += reachableMQ;
                } else {
                    reachable_min += reachableMQ;
                    reachable_max += reachableV;
                }
                if (totalV < totalMQ) {
                    total_min += totalV;
                    total_max += totalMQ;
                } else {
                    total_min += totalMQ;
                    total_max += totalV;
                }
            }
        }
        if (access.unopened_max > 0) {
            if (access.reachable_max > 0) {
                if (access.unopened_max == access.reachable_max) {
                    access.value = AccessStateEnum.AVAILABLE;
                } else {
                    access.value = AccessStateEnum.POSSIBLE;
                }
            } else {
                access.value = AccessStateEnum.UNAVAILABLE;
            }
        }
        this./*#*/__setAccess(access);
    }

    get access() {
        return ACCESS.get(this);
    }

    static get defaultAccess() {
        return {
            done_min: 0,
            done_max: 0,
            unopened_min: 0,
            unopened_max: 0,
            reachable_min: 0,
            reachable_max: 0,
            total_min: 0,
            total_max: 0,
            value: AccessStateEnum.OPENED
        };
    }

}
