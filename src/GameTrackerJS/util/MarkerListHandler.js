/* asym-import: off */
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import Helper from "/emcJS/util/Helper.js";
/* asym-import: on */
import WorldStateManagers from "../state/world/StateManagers.js";
import AccessStateEnum from "../enum/AccessStateEnum.js";

const ACCESS = new WeakMap();
const LIST = new WeakMap();
const FILTERED_LIST = new WeakMap();

export default class MarkerListHandler extends EventTarget {

    constructor(list) {
        super();
        /* --- */
        const [entityList, filteredEntityList] = this./*#*/__createLists(list);
        LIST.set(this, entityList);
        FILTERED_LIST.set(this, filteredEntityList);
        /* --- */
        ACCESS.set(this, this./*#*/__calculateAvailability());
    }

    /*#*/__createLists(list) {
        const entityList = new Map();
        const filteredEntityList = new Map();
        if (list != null) {
            list.forEach(record => {
                const loc = WorldStateManagers.get(record.category, record.id);
                const eventManager = new EventTargetManager(loc);
                if (loc != null) {
                    entityList.set(loc, record);
                    if (loc.isVisible()) {
                        filteredEntityList.set(loc, record);
                    }
                }
                if (record.category != "area" && record.category != "exit") {
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
                        }
                    } else {
                        if (filteredEntityList.has(loc)) {
                            filteredEntityList.delete(loc);
                            this./*#*/__refreshAccess();
                        }
                    }
                });
            });
        }
        return [entityList, filteredEntityList];
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
        const list = FILTERED_LIST.get(this);
        const res = {
            done: 0,
            unopened: 0,
            reachable: 0,
            entrances: false,
            value: AccessStateEnum.OPENED
        };
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
        return res;
    }

    get access() {
        return ACCESS.get(this);
    }

    get list() {
        const list = LIST.get(this);
        return Array.from(list.values());
    }

    get filtered() {
        const list = FILTERED_LIST.get(this);
        return Array.from(list.values());
    }

}
