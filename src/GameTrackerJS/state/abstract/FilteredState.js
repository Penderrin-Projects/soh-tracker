/* asym-import: off */
import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
/* asym-import: on */
import LogicExecutor from "../../util/logic/LogicExecutor.js";
import VisibilityState from "./VisibilityState.js";
import FilterStorage from "../../storage/FilterStorage.js";

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

export default class FilteredState extends VisibilityState {

    constructor(ref, props) {
        super(ref, props);
        /* FILTER */
        if (props.filter) {
            const filter_values = new Map();
            const filter_logics = new Map();
            for (const i in props.filter) {
                const filterValue = FilterStorage.get(i);
                for (const j in props.filter[i]) {
                    const filterProp = props.filter[i][j];
                    if (typeof filterProp == "object") {
                        const logicFn = LogicCompiler.compile(filterProp);
                        filter_logics.set(`${i}/${j}`, logicFn);
                        if (j == filterValue) {
                            const value = LogicExecutor.execute(logicFn);
                            filter_values.set(i, value);
                        }
                    } else if (SPECIAL_FILTERS.includes(filterProp)) {
                        filter_logics.set(`${i}/${j}`, filterProp);
                        if (j == filterValue) {
                            const value = this.executeSpecialFilter(filterProp);
                            filter_values.set(i, value);
                        }
                    } else if (filterProp != null) {
                        const value = !!filterProp;
                        filter_logics.set(`${i}/${j}`, value);
                        if (j == filterValue) {
                            filter_values.set(i, value);
                        }
                    } else if (j == filterValue) {
                        filter_values.set(i, true);
                    }
                }
            }
            FILTER.set(this, filter_values);
            FILTER_LOGICS.set(this, filter_logics);
        }
        /* EVENTS */
        FilterStorage.addEventListener("change", event => {
            let changed = false;
            for (const [key, value] of Object.entries(event.data)) {
                changed = changed || this./*#*/__checkFilter(key, value);
            }
            if (changed) {
                const event = new Event("filter");
                event.data = FILTER.get(this);
                this.dispatchEvent(event);
            }
        });
        const logicEventManager = new EventTargetManager(LogicExecutor);
        logicEventManager.set(["reset", "change"], event => {
            const changed = this./*#*/__checkAllFilter()
            if (changed) {
                const event = new Event("filter");
                event.data = FILTER.get(this);
                this.dispatchEvent(event);
            }
        });
    }

    /*#*/__checkFilter(id, value) {
        const filter_values = FILTER.get(this);
        const oVal = filter_values.get(id);
        const nVal = this./*#*/__executeFilter(`${id}/${value}`);
        if (oVal != nVal) {
            filter_values.set(id, nVal);
            return true;
        }
        return false;
    }

    /*#*/__checkAllFilter() {
        let changed = false;
        const filter_values = FILTER.get(this);
        for (const [id, oVal] of filter_values) {
            const value = FilterStorage.get(id);
            const nVal = this./*#*/__executeFilter(`${id}/${value}`);
            if (oVal != nVal) {
                filter_values.set(id, nVal);
                changed = true;
            }
        }
        return changed;
    }

    /*#*/__executeFilter(name) {
        const filter_logics = FILTER_LOGICS.get(this);
        const logicFn = filter_logics.get(name);
        if (typeof logicFn == "function") {
            return LogicExecutor.execute(logicFn);
        } else if (typeof logicFn == "string") {
            return this.executeSpecialFilter(logicFn);
        } else if (logicFn != null) {
            return !!logicFn;
        }
        return true;
    }

    executeSpecialFilter(name) {
        return true;
    }

    get filter() {
        return mapToObj(FILTER.get(this));
    }

    isVisible() {
        return this.visible && !this.filtered;
    }

    get filtered() {
        const activeFilter = FilterStorage.getAll();
        const filter_values = FILTER.get(this);
        for (const filter in activeFilter) {
            if (filter_values.has(filter) && !filter_values.get(filter)) {
                return true;
            }
        }
        return false;
    }

}
