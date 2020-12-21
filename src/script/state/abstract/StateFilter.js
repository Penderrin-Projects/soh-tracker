import EventBus from "/emcJS/event/EventBus.js";
import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import StateStorage from "/script/storage/StateStorage.js";
import FilterStorage from "/script/storage/FilterStorage.js";
import StateVisible from "/script/state/abstract/StateVisible.js";

function valueGetter(key) {
    return this.get(key);
}

const FILTER = new WeakMap();
const FILTER_LOGICS = new WeakMap();

export default class StateFilter extends StateVisible {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        const stored_data = new Map(Object.entries(StateStorage.getAll()));
        /* FILTER */
        if (props.filter) {
            const filter_values = new Map();
            const filter_logics = new Map();
            for (const i in props.filter) {
                for (const j in props.filter[i]) {
                    if (typeof props.filter[i][j] == "object") {
                        const logicFn = LogicCompiler.compile(props.filter[i][j]);
                        filter_logics.set(`${i}/${j}`, logicFn);
                        const res = !!logicFn(valueGetter.bind(stored_data));
                        filter_values.set(`${i}/${j}`, res);
                    } else {
                        filter_values.set(`${i}/${j}`, !!props.filter[i][j]);
                    }
                }
            }
            FILTER.set(this, filter_values);
            FILTER_LOGICS.set(this, filter_logics);
        }
        /* EVENTS */
        EventBus.register("state", event => {
            const data = new Map(Object.entries(event.data.state));
            this.calculateFilter(data);
        });
        EventBus.register("randomizer_options", event => {
            const data = new Map(Object.entries(event.data));
            this.calculateFilter(data);
        });
    }
    
    /*#*/calculateFilter(data) {
        let changed = false;
        const filter_values = FILTER.get(this);
        const filter_logics = FILTER_LOGICS.get(this);
        filter_logics.forEach((logicFn, key) => {
            if (typeof logicFn == "function") {
                const filtered = filter_values.get(key);
                const res = !!logicFn(valueGetter.bind(data));
                filter_values.set(key, res);
                if (filtered != res) {
                    changed = true;
                }
            }
        });
        if (changed) {
            const event = new Event("filter");
            event.data = filter_values;
            this.dispatchEvent(event);
        }
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
