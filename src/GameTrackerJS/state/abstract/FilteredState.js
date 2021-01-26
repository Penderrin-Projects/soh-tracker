import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import LogicExecutor from "../../util/LogicExecutor.js";
import VisibilityState from "./VisibilityState.js";
import FilterStorage from "/GameTrackerJS/storage/FilterStorage.js";

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
                for (const j in props.filter[i]) {
                    if (typeof props.filter[i][j] == "object") {
                        const logicFn = LogicCompiler.compile(props.filter[i][j]);
                        const value = LogicExecutor.execute(logicFn);
                        filter_logics.set(`${i}/${j}`, logicFn);
                        filter_values.set(`${i}/${j}`, value);
                    } else {
                        filter_values.set(`${i}/${j}`, !!props.filter[i][j]);
                    }
                }
            }
            FILTER.set(this, filter_values);
            FILTER_LOGICS.set(this, filter_logics);
        }
        /* EVENTS */
        const logicEventManager = new EventTargetManager(LogicExecutor);
        logicEventManager.set(["reset", "change"], event => {
            let changed = false;
            const filter_values = FILTER.get(this);
            const filter_logics = FILTER_LOGICS.get(this);
            filter_logics.forEach((logicFn, key) => {
                if (typeof logicFn == "function") {
                    const filtered = filter_values.get(key);
                    const value = LogicExecutor.execute(logicFn);
                    if (filtered != value) {
                        filter_values.set(key, value);
                        changed = true;
                    }
                }
            });
            if (changed) {
                const event = new Event("filter");
                event.data = filter_values;
                this.dispatchEvent(event);
            }
        });
    }

    get filter() {
        return mapToObj(FILTER.get(this));
    }

    get visible() {
        return super.visible && this.filtered;
    }

    get filtered() {
        const activeFilter = FilterStorage.getAll();
        const values = FILTER.get(this);
        for (const filter in activeFilter) {
            const value = activeFilter[filter];
            const name = `${filter}/${value}`;
            if (!!value && values.has(name)) {
                if (!values.get(name)) {
                    return false;
                }
            }
        }
        return true;
    }

}
