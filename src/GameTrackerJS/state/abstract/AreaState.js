/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */
import WorldStateManagers from "../world/StateManagers.js";
import FilteredState from "./FilteredState.js";
import ListLogic from "../../util/logic/ListLogic.js";
import LocationState from "../world/location/DefaultState.js";
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
        this./*#*/__generateLists();
        this.refreshAccess();
        /* EVENTS */
        EventBus.register(["logic", "state::location", "options", "filter"], event => {
            this.refreshAccess();
        });
    }

    /*#*/__generateLists() {
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
                                this.refreshAccess();
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
                        if (record.isVisible()) {
                            filteredEntityList.set(loc, record);
                        }
                    }
                });
            }
        }
        LIST.set(this, entityList);
        FILTERED_LIST.set(this, filteredEntityList);
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
        for (const [loc] of list) {
            const {done, unopened, reachable, entrances} = this.check(loc.access);
            res.done += done;
            res.unopened += unopened;
            res.reachable += reachable;
            res.entrances = res.entrances || entrances;
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
        const result = [];
        if (list != null) {
            for (const [, record] of list) {
                result.push(record);
            }
        }
        return result;
    }

    getFilteredList() {
        const list = FILTERED_LIST.get(this);
        const result = [];
        if (list != null) {
            for (const [, record] of list) {
                result.push(record);
            }
        }
        return result;
    }

    get areaData() {
        return AREA_DATA.get(this);
    }

    get access() {
        return ACCESS.get(this);
    }

    setAllEntries(value = true) {
        const list = this.getFilteredList();
        if (!!list && Array.isArray(list)) {
            for (const entry of list) {
                const category = entry.category;
                const id = entry.id;
                if (category == "location") {
                    const location = WorldStateManagers.get("location", id);
                    if (location instanceof LocationState) {
                        location.value = value;
                    }
                } else if (category == "subarea") {
                    const subarea = WorldStateManagers.get("subarea", id);
                    if (subarea != null) {
                        subarea.setAllEntries(value);
                    }
                } else if (category == "subexit") {
                    const subexit = WorldStateManagers.get("subexit", id);
                    if (subexit != null) {
                        const bound = subexit.value;
                        if (!bound) {
                            continue;
                        }
                        const entrance = WorldStateManagers.getEntrance(bound);
                        if (entrance != null) {
                            const subarea = WorldStateManagers.get("subarea", id);
                            if (subarea != null) {
                                subarea.setAllEntries(value);
                            }
                        }
                    }
                } else if (category == "area") {
                    // ignore
                } else if (category == "exit") {
                    // ignore
                } else {
                    new Error(`unknown category "${category}" for entry "${id}"`);
                }
            }
        }
    }

}
