// frameworks
import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";

import LogicExecutor from "../logic/LogicExecutor.js";
import FilterStorage from "../../savestate/storage/FilterStorage.js";

const SPECIAL_FILTERS = [
    "access",
    "!access",
    "done",
    "!done"
];

function mapToObj(map) {
    const res = {};
    map.forEach((v, k) => {
        res[k] = v;
    });
    return res;
}

const FILTER = new WeakMap();
const FILTER_LOGICS = new WeakMap();

export default class FilterHandler extends EventTarget {

    constructor(config = {}) {
        super();
        /* FILTER */
        const filter_values = new Map();
        const filter_logics = new Map();
        for (const i in config) {
            const filterValue = FilterStorage.get(i);
            for (const j in config[i]) {
                const filterProp = config[i][j];
                if (typeof filterProp == "object") {
                    const logicFn = LogicCompiler.compile(filterProp);
                    filter_logics.set(`${i}/${j}`, logicFn);
                    if (j == filterValue) {
                        const value = LogicExecutor.execute(logicFn);
                        filter_values.set(i, value);
                    } else {
                        filter_values.set(i, false);
                    }
                } else if (SPECIAL_FILTERS.includes(filterProp)) {
                    filter_logics.set(`${i}/${j}`, filterProp);
                    if (j == filterValue) {
                        const value = this.executeSpecialFilter(filterProp);
                        filter_values.set(i, value);
                    } else {
                        filter_values.set(i, false);
                    }
                } else if (filterProp != null) {
                    const value = !!filterProp;
                    filter_logics.set(`${i}/${j}`, value);
                    if (j == filterValue) {
                        filter_values.set(i, value);
                    } else {
                        filter_values.set(i, false);
                    }
                } else if (j == filterValue) {
                    filter_values.set(i, true);
                } else {
                    filter_values.set(i, false);
                }
            }
        }
        FILTER.set(this, filter_values);
        FILTER_LOGICS.set(this, filter_logics);
        /* EVENTS */
        FilterStorage.addEventListener("change", () => {
            this.checkAllFilter();
        });
        const logicEventManager = new EventTargetManager(LogicExecutor);
        logicEventManager.set(["reset", "change"], () => {
            this.checkAllFilter();
        });
        /* --- */
        setTimeout(() => {
            this.checkAllFilter();
        }, 0);
    }

    checkAllFilter() {
        const filter_values = FILTER.get(this);
        if (filter_values != null) {
            const changes = {};
            for (const [id, oVal] of filter_values) {
                const value = FilterStorage.get(id);
                const nVal = this.#executeFilter(`${id}/${value}`);
                if (oVal != nVal) {
                    filter_values.set(id, nVal);
                    changes[id] = nVal;
                }
            }
            if (Object.keys(changes).length) {
                const event = new Event("change");
                event.data = changes;
                this.dispatchEvent(event);
            }
        }
    }

    #executeFilter(name) {
        const filter_logics = FILTER_LOGICS.get(this);
        if (filter_logics != null) {
            const logicFn = filter_logics.get(name);
            if (typeof logicFn == "function") {
                return LogicExecutor.execute(logicFn);
            } else if (typeof logicFn == "string") {
                return this.executeSpecialFilter(logicFn);
            } else if (logicFn != null) {
                return !!logicFn;
            }
        }
        return true;
    }

    executeSpecialFilter(name) {
        // const access = this.access;
        // switch (name) {
        //     case "access": return access.value != AccessStateEnum.UNAVAILABLE;
        //     case "!access": return access.value == AccessStateEnum.UNAVAILABLE;
        //     case "done": return access.value == AccessStateEnum.OPENED;
        //     case "!done": return access.value != AccessStateEnum.OPENED;
        // }
    }

    get filter() {
        return mapToObj(FILTER.get(this));
    }

    get filtered() {
        const activeFilter = FilterStorage.getAll();
        const filter_values = FILTER.get(this);
        if (filter_values != null) {
            for (const filter in activeFilter) {
                if (filter_values.has(filter) && !filter_values.get(filter)) {
                    return true;
                }
            }
        }
        return false;
    }

}
