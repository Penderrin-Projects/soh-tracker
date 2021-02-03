/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */
import WorldStateManagers from "../world/StateManagers.js";
import FilteredState from "./FilteredState.js";
import ListLogic from "../../util/logic/ListLogic.js";
import LocationState from "../world/location/DefaultState.js";

const AREA_DATA = new WeakMap();
const ACCESS = new WeakMap();
    
export default class AreaState extends FilteredState {
    
    constructor(ref, props, areaData) {
        super(ref, props);
        /* --- */
        AREA_DATA.set(this, areaData);
        ACCESS.set(this, ListLogic.DEFAULT);
        this.refreshAccess();
        /* EVENTS */
        EventBus.register(["logic", "state::location", "options", "filter"], event => {
            this.refreshAccess();
        });
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
        const list = this.getFilteredList();
        if (list != null) {
            return ListLogic.check(list);
        }
    }

    getList() {
        const areaData = AREA_DATA.get(this);
        if (areaData != null) {
            const list = areaData.list;
            if (list != null) {
                const result = [];
                list.forEach(record => {
                    const loc = WorldStateManagers.get(record.category, record.id);
                    if (loc != null) {
                        result.push(record);
                    }
                });
                return result;
            }
        }
        return [];
    }

    getFilteredList() {
        const areaData = AREA_DATA.get(this);
        if (areaData != null) {
            const list = areaData.list;
            if (list != null) {
                const result = [];
                list.forEach(record => {
                    const loc = WorldStateManagers.get(record.category, record.id);
                    if (loc != null && loc.visible) {
                        result.push(record);
                    }
                });
                return result;
            }
        }
        return [];
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
