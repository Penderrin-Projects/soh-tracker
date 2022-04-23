// frameworks
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import Helper from "/emcJS/util/helper/Helper.js";

import WorldStateManagerRegistry from "../../statemanager/WorldStateManagerRegistry.js";
import AccessStateEnum from "../../enum/AccessStateEnum.js";

const REF = new WeakMap();
const VISIBLE = new WeakMap();
const ACCESS = new WeakMap();
const LIST_RESOLVED = new WeakMap();
const LIST_FILTERED = new WeakMap();

export function getDefaultAccess() {
    return {
        done: 0,
        unopened: 0,
        reachable: 0,
        total: 0,
        value: AccessStateEnum.OPENED,
        entrances: 0
    };
}

export default class StateListHandler extends EventTarget {

    constructor(list, ref) {
        super();
        /* --- */
        VISIBLE.set(this, false);
        ACCESS.set(this, getDefaultAccess());
        REF.set(this, ref);
        setTimeout(() => {
            this./*#*/__generateList(list);
        }, 0);
    }

    /*#*/__generateList(list) {
        const entityList = new Map();
        const filteredEntityList = new Map();
        if (list != null) {
            for (const record of list) {
                const loc = WorldStateManagerRegistry.get(record.category).get(record.id);
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
                                this./*#*/__setVisibility(!!filteredEntityList.size);
                            }
                        } else if (filteredEntityList.has(loc)) {
                            filteredEntityList.delete(loc);
                            this./*#*/__refreshAccess();
                            this./*#*/__setVisibility(!!filteredEntityList.size);
                        }
                    });
                }
            }
        }
        /* --- */
        LIST_RESOLVED.set(this, entityList);
        LIST_FILTERED.set(this, filteredEntityList);
        this./*#*/__setVisibility(!!filteredEntityList.size);
        this./*#*/__refreshAccess();
    }

    /*#*/__setVisibility(value) {
        const old = VISIBLE.get(this);
        if (old != value) {
            VISIBLE.set(this, value);
            // external
            const ev = new Event("visibility");
            ev.data = value;
            this.dispatchEvent(ev);
        }
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
        const list = LIST_FILTERED.get(this) ?? new Map();
        const access = {
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
                    access.done += done;
                    access.unopened += unopened;
                    access.reachable += reachable;
                    access.total += total;
                    access.entrances += entrances;
                }
            } else if (record.category == "exit") {
                const area = loc.area;
                if (area != null) {
                    if (area.props.accessPenetration) {
                        const {done, unopened, reachable, entrances, total} = loc.access;
                        access.done += done;
                        access.unopened += unopened;
                        access.reachable += reachable;
                        access.total += total;
                        access.entrances += entrances;
                    }
                } else {
                    const {entrances} = loc.access;
                    access.entrances += entrances;
                }
            } else if (record.category == "location" || record.category == "collection") {
                const {done, unopened, reachable, entrances, total} = loc.access;
                access.done += done;
                access.unopened += unopened;
                access.reachable += reachable;
                access.total += total;
                access.entrances += entrances;
            }
        }
        if (access.unopened > 0) {
            if (access.reachable > 0) {
                if (access.unopened == access.reachable) {
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

    setAllEntries(value = true) {
        const list = LIST_RESOLVED.get(this) ?? new Map();
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
                const area = loc.area;
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

}
