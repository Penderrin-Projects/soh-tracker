// frameworks
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import Helper from "/emcJS/util/Helper.js";

import WorldStateManager from "../../state/world/WorldStateManager.js";
import AccessStateEnum from "../../enum/AccessStateEnum.js";

const REF = new WeakMap();
const VISIBLE = new WeakMap();
const ACCESS = new WeakMap();
const LIST_RAW = new WeakMap();
const LIST_RESOLVED = new WeakMap();
const LIST_FILTERED = new WeakMap();

const DEFAULT_ACCESS = {
    done: 0,
    unopened: 0,
    reachable: 0,
    total: 0,
    value: AccessStateEnum.OPENED,
    entrances: 0
};

export const defaultAccess = DEFAULT_ACCESS;

export default class MarkerListHandler extends EventTarget {

    constructor(list, ref) {
        super();
        /* --- */
        VISIBLE.set(this, false);
        ACCESS.set(this, DEFAULT_ACCESS);
        LIST_RAW.set(this, list);
        REF.set(this, ref);
        setTimeout(() => {
            this./*#*/__createLists(list);
            this./*#*/__refreshAccess();
        }, 0);
    }

    updateVisible() {
        const list = LIST_FILTERED.get(this);
        const value = !!list.size;
        const old = VISIBLE.get(this);
        if (old != value) {
            VISIBLE.set(this, value);
            // external
            const ev = new Event("visibility");
            ev.data = value;
            this.dispatchEvent(ev);
        }
    }

    /*#*/__createLists(list) {
        const entityList = new Map();
        const filteredEntityList = new Map();
        if (list != null) {
            list.forEach(record => {
                const loc = WorldStateManager.get(record.category, record.id);
                if (loc != null) {
                    entityList.set(loc, record);
                    if (loc.isVisible()) {
                        filteredEntityList.set(loc, record);
                    }
                    /* event manager */
                    const eventManager = new EventTargetManager(loc);
                    eventManager.set("access", () => {
                        if (filteredEntityList.has(loc)) {
                            if (record.category == "area") {
                                if (loc.props.accessPenetration) {
                                    this./*#*/__refreshAccess();
                                }
                            } else if (record.category == "exit") {
                                const area = loc.area;
                                if (area != null) {
                                    if (area.props.accessPenetration) {
                                        this./*#*/__refreshAccess();
                                    }
                                }
                            } else if (record.category == "location" || record.category == "collection") {
                                this./*#*/__refreshAccess();
                            }
                        }
                    });
                    eventManager.set("visiblity", () => {
                        if (loc.isVisible()) {
                            if (!filteredEntityList.has(loc)) {
                                filteredEntityList.set(loc, entityList.get(loc));
                                this./*#*/__refreshAccess();
                                this.updateVisible();
                            }
                        } else {
                            if (filteredEntityList.has(loc)) {
                                filteredEntityList.delete(loc);
                                this./*#*/__refreshAccess();
                                this.updateVisible();
                            }
                        }
                    });
                }
            });
        }
        /* --- */
        LIST_RESOLVED.set(this, entityList);
        LIST_FILTERED.set(this, filteredEntityList);
        this.updateVisible();
        // external
        const ev = new Event("change");
        ev.data = this.list;
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
            total: 0,
            value: AccessStateEnum.OPENED,
            entrances: 0
        };
        for (const [loc, record] of list) {
            if (record.category == "area") {
                if (loc.props.accessPenetration) {
                    const {done, unopened, reachable, entrances, total} = loc.access;
                    res.done += done;
                    res.unopened += unopened;
                    res.reachable += reachable;
                    res.total += total;
                    res.entrances += entrances;
                }
            } else if (record.category == "exit") {
                const area = loc.area;
                if (area != null) {
                    if (area.props.accessPenetration) {
                        const {done, unopened, reachable, entrances, total} = loc.access;
                        res.done += done;
                        res.unopened += unopened;
                        res.reachable += reachable;
                        res.total += total;
                        res.entrances += entrances;
                    }
                } else {
                    const {entrances} = loc.access;
                    res.entrances += entrances;
                }
            } else if (record.category == "location" || record.category == "collection") {
                const {done, unopened, reachable, entrances, total} = loc.access;
                res.done += done;
                res.unopened += unopened;
                res.reachable += reachable;
                res.total += total;
                res.entrances += entrances;
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
        const list = LIST_RESOLVED.get(this);
        for (const [loc, record] of list) {
            if (record.category == "area") {
                if (loc.props.accessPenetration) {
                    loc.setAllEntries(value);
                }
            } else if (record.category == "exit") {
                const area = loc.area;
                if (area != null) {
                    if (area.props.accessPenetration) {
                        area.setAllEntries(value);
                    }
                }
            } else if (record.category == "collection") {
                area.setAllEntries(value);
            } else if (record.category == "location") {
                loc.value = value;
            }
        }
    }

    get ref() {
        return REF.get(this);
    }

    get visible() {
        return !!VISIBLE.get(this);
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
