// frameworks
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import Helper from "/emcJS/util/Helper.js";

import WorldStateManagers from "../state/world/StateManagers.js";
import AccessStateEnum from "../enum/AccessStateEnum.js";

const REF = new WeakMap();
const ACCESS = new WeakMap();
const LIST_RAW = new WeakMap();
const LIST_RESOLVED = new WeakMap();
const LIST_FILTERED = new WeakMap();

const DEFAULT_ACCESS = {
    done: 0,
    unopened: 0,
    reachable: 0,
    entrances: false,
    value: AccessStateEnum.OPENED
};

export const defaultAccess = DEFAULT_ACCESS;

export default class MarkerListHandler extends EventTarget {

    constructor(list, ref) {
        super();
        /* --- */
        ACCESS.set(this, DEFAULT_ACCESS);
        LIST_RAW.set(this, list);
        REF.set(this, ref);
        this./*#*/__createLists(list);
        this./*#*/__refreshAccess();
    }

    /*#*/__createLists(list) {
        const entityList = new Map();
        const filteredEntityList = new Map();
        if (list != null) {
            list.forEach(record => {
                const loc = WorldStateManagers.get(record.category, record.id);
                if (loc != null) {
                    entityList.set(loc, record);
                    if (loc.isVisible()) {
                        filteredEntityList.set(loc, record);
                    }
                }
            });
        }
        /* --- */
        for (const [loc, record] of entityList) {
            const eventManager = new EventTargetManager(loc);
            // if (!record.props.nofollow) {
            //     eventManager.set("access", () => {
            //         if (filteredEntityList.has(loc)) {
            //             this./*#*/__refreshAccess();
            //         }
            //     });
            // }
            if (record.category == "area") {
                // ignore
            } else {
                eventManager.set("access", () => {
                    if (filteredEntityList.has(loc)) {
                        this./*#*/__refreshAccess();
                    }
                });
            }
            eventManager.set(["visible", "filter"], () => {
                if (loc.isVisible()) {
                    if (!filteredEntityList.has(loc)) {
                        filteredEntityList.set(loc, entityList.get(loc));
                        this./*#*/__refreshAccess();
                        // external
                        const ev = new Event("change");
                        ev.filtered = this.filteredList;
                        this.dispatchEvent(ev);
                    }
                } else {
                    if (filteredEntityList.has(loc)) {
                        filteredEntityList.delete(loc);
                        this./*#*/__refreshAccess();
                        // external
                        const ev = new Event("change");
                        ev.filtered = this.filteredList;
                        this.dispatchEvent(ev);
                    }
                }
            });
        }
        /* --- */
        LIST_RESOLVED.set(this, entityList);
        LIST_FILTERED.set(this, filteredEntityList);
        // external
        const ev = new Event("change");
        ev.list = this.list;
        ev.filtered = this.filteredList;
        this.dispatchEvent(ev);
    }

    /*#*/__refreshAccess() {
        const access = this./*#*/__calculateAvailability();
        if (access != null) {
            const old = ACCESS.get(this);
            if (!Helper.isEqual(old, access)) {
                ACCESS.set(this, access);
                // external
                const event = new Event("access");
                event.data = access;
                this.dispatchEvent(event);
            }
        }
    }

    /*#*/__calculateAvailability() {
        const list = LIST_FILTERED.get(this);
        const res = {
            done: 0,
            unopened: 0,
            reachable: 0,
            entrances: false,
            value: AccessStateEnum.OPENED
        };
        for (const [loc, record] of list) {
            // if (!record.props.nofollow) {
            //     const {done, unopened, reachable, entrances} = loc.access;
            //     res.done += done;
            //     res.unopened += unopened;
            //     res.reachable += reachable;
            //     res.entrances = res.entrances || entrances;
            // } else if (record.category == "exit") {
            //     if (!loc.area) {
            //         const {entrances} = loc.access;
            //         res.entrances = res.entrances || entrances;
            //     }
            // }
            if (record.category == "area") {
                // ignore
            } else if (record.category == "exit") {
                if (!loc.area) {
                    const {entrances} = loc.access;
                    res.entrances = res.entrances || entrances;
                }
            } else {
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
        return res;
    }

    setAllEntries(value = true) {
        const list = LIST_FILTERED.get(this);
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

    get ref() {
        return REF.get(this);
    }

    get access() {
        return ACCESS.get(this);
    }

    get rawList() {
        const list = LIST_RAW.get(this);
        if (list != null) {
            return Array.from(list.values());
        } else {
            return [];
        }
    }

    get list() {
        const list = LIST_RESOLVED.get(this);
        if (list != null) {
            return Array.from(list.values());
        } else {
            return [];
        }
    }

    get filteredList() {
        const list = LIST_FILTERED.get(this);
        if (list != null) {
            return Array.from(list.values());
        } else {
            return [];
        }
    }

}
