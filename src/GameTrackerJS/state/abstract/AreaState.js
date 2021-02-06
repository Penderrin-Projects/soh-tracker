/* asym-import: off */
//import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */
import WorldStateManagers from "../world/StateManagers.js";
import FilteredState from "./FilteredState.js";
import ListLogic from "../../util/logic/ListLogic.js";
import AccessStateEnum from "../../enum/AccessStateEnum.js";

const AREA_DATA = new WeakMap();
const ACCESS = new WeakMap();
const LIST = new WeakMap();
const FILTERED_LIST = new WeakMap();

export default class AreaState extends FilteredState {
    
    constructor(ref, props, areaData) {
        super(ref, props);
        /* --- */
        AREA_DATA.set(this, areaData);
        ACCESS.set(this, ListLogic.DEFAULT);
        const [entityList, filteredEntityList] = this.generateLists();
        LIST.set(this, entityList);
        FILTERED_LIST.set(this, filteredEntityList);
        this.refreshAccess();
        /* EVENTS */
        /*EventBus.register(["logic", "state::location", "options", "filter"], event => {
            this.refreshAccess();
        });*/
    }

    generateLists() {
        const entityList = new Map();
        const filteredEntityList = new Map();
        const areaData = AREA_DATA.get(this);
        if (areaData != null) {
            const list = areaData.list;
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
        }
        return [entityList, filteredEntityList];
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

    getList() {
        const list = LIST.get(this);
        return Array.from(list.values());
    }

    getFilteredList() {
        const list = FILTERED_LIST.get(this);
        return Array.from(list.values());
    }

    get areaData() {
        return AREA_DATA.get(this);
    }

    get access() {
        return ACCESS.get(this);
    }

    setAllEntries(value = true) {
        const list = FILTERED_LIST.get(this);
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
